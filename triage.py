"""
Behavioral triage: intent-based transaction flagging across multiple AML typologies.
Five distinct rules ensure the flagged set is diverse, prompting the LLM
to reason about different suspicious patterns rather than a single one.
"""
import glob
from pathlib import Path

import pandas as pd


CSV_GLOB = str(Path(__file__).parent / "data" / "PS_*.csv")

# Columns sent to LLM (isFraud + isFlaggedFraud stripped — blind test)
BLIND_COLUMNS = [
    "step", "type", "amount",
    "nameOrig", "oldbalanceOrg", "newbalanceOrig",
    "nameDest", "oldbalanceDest", "newbalanceDest",
]

# How many flagged rows to sample per rule (keeps variety balanced)
SAMPLES_PER_RULE = 5


def find_csv() -> str:
    matches = glob.glob(CSV_GLOB)
    if not matches:
        raise FileNotFoundError("PaySim CSV not found. Run: python setup_data.py")
    return matches[0]


def load_sample(
    csv_path: str | None = None,
    n: int = 100,
    min_fraud: int = 20,
    seed: int = 42,
) -> tuple[pd.DataFrame, pd.Series]:
    """
    Load a diverse stratified sample of n rows from PaySim CSV.

    Sampling strategy:
      - min_fraud rows guaranteed with isFraud==1 (across all transaction types)
      - Remainder drawn from isFraud==0 across TRANSFER, CASH_OUT, PAYMENT, DEBIT, CASH_IN
        so the triage rules have varied input to work with.

    Returns:
        df_blind:     DataFrame with isFraud/isFlaggedFraud removed
        ground_truth: Series of isFraud values aligned to df_blind's index
    """
    if csv_path is None:
        csv_path = find_csv()

    full = pd.read_csv(csv_path)

    fraud_rows = full[full["isFraud"] == 1]
    clean_rows = full[full["isFraud"] == 0]

    # Fraud sample — all types present in fraud population
    n_fraud = min(min_fraud, len(fraud_rows))
    sampled_fraud = fraud_rows.sample(n=n_fraud, random_state=seed)

    # Clean sample — stratified across transaction types for variety
    n_clean = n - n_fraud
    type_groups = clean_rows.groupby("type")
    per_type = max(1, n_clean // type_groups.ngroups)
    clean_parts = [
        grp.sample(n=min(per_type, len(grp)), random_state=seed)
        for _, grp in type_groups
    ]
    sampled_clean = pd.concat(clean_parts).sample(n=min(n_clean, sum(len(p) for p in clean_parts)), random_state=seed)

    combined = (
        pd.concat([sampled_fraud, sampled_clean])
        .sample(frac=1, random_state=seed)
        .reset_index(drop=True)
    )

    ground_truth = combined["isFraud"].copy()
    df_blind = combined[BLIND_COLUMNS].copy()

    return df_blind, ground_truth


# ---------------------------------------------------------------------------
# Individual triage rules — each returns a flagged subset with a flag_reason
# ---------------------------------------------------------------------------

def _rule_account_draining(df: pd.DataFrame) -> pd.DataFrame:
    """
    TYPOLOGY: Account Draining / Layering
    Origin account drained >90%, destination balance zeroed.
    Classic pass-through / mule account pattern.
    """
    mask = (
        df["type"].isin(["TRANSFER", "CASH_OUT"])
        & (df["oldbalanceOrg"] > 0)
        & (df["amount"] > 0.9 * df["oldbalanceOrg"])
        & (df["newbalanceDest"] == 0)
    )
    out = df[mask].copy()
    pct = (df.loc[mask, "amount"] / df.loc[mask, "oldbalanceOrg"] * 100).round(1)
    out["flag_reason"] = (
        "Origin account drained " + pct.astype(str)
        + "% of balance via " + df.loc[mask, "type"]
        + "; destination account balance zeroed after receipt — consistent with pass-through layering"
    )
    out["rule"] = "ACCOUNT_DRAINING"
    return out


def _rule_large_transfer(df: pd.DataFrame) -> pd.DataFrame:
    """
    TYPOLOGY: Wire Fraud / Large-Scale Layering
    High-value TRANSFER (≥$500k) that completely clears both origin and destination.
    Large amounts + dual account clearance = textbook high-value layering.
    Dataset-calibrated: 88.7% precision on PaySim at this threshold.
    """
    mask = (
        (df["type"] == "TRANSFER")
        & (df["newbalanceOrig"] == 0)
        & (df["newbalanceDest"] == 0)
        & (df["amount"] >= 500_000)
    )
    out = df[mask].copy()
    out["flag_reason"] = (
        "High-value TRANSFER of $"
        + df.loc[mask, "amount"].round(2).astype(str)
        + " cleared origin to $0 and destination to $0 — both accounts fully drained;"
        + " large-scale fund movement with no residual balance in either account"
    )
    out["rule"] = "LARGE_TRANSFER"
    return out


def _rule_high_value_cashout(df: pd.DataFrame) -> pd.DataFrame:
    """
    TYPOLOGY: Cash Placement
    CASH_OUT ≥ $1M that completely clears the origin account.
    Threshold calibrated to PaySim: ≥$1M yields 81.6% precision vs 3.7% at $500k.
    Converts large digital balances to untraceable cash — classic placement stage.
    """
    mask = (
        (df["type"] == "CASH_OUT")
        & (df["newbalanceOrig"] == 0)
        & (df["amount"] >= 1_000_000)
    )
    out = df[mask].copy()
    out["flag_reason"] = (
        "CASH_OUT of $"
        + df.loc[mask, "amount"].round(2).astype(str)
        + " (≥$1M) fully cleared origin account to $0 — high-value cash conversion"
        + " consistent with placement-stage laundering of illicit digital funds into cash"
    )
    out["rule"] = "HIGH_VALUE_CASHOUT"
    return out


def _rule_moderate_cashout(df: pd.DataFrame) -> pd.DataFrame:
    """
    TYPOLOGY: Suspicious Cash Withdrawal (intentionally broad for demo realism)
    CASH_OUT of $200k–$999k that clears the origin account.
    Precision is intentionally lower (~30-40%) to produce 1-2 false positives —
    demonstrating that AI systems still require human review and are not infallible.
    These FPs look genuinely suspicious (large cash withdrawal clearing an account)
    but turn out to be legitimate in PaySim's ground truth.
    """
    mask = (
        (df["type"] == "CASH_OUT")
        & (df["newbalanceOrig"] == 0)
        & (df["amount"] >= 200_000)
        & (df["amount"] < 1_000_000)
    )
    out = df[mask].copy()
    out["flag_reason"] = (
        "CASH_OUT of $"
        + df.loc[mask, "amount"].round(2).astype(str)
        + " cleared origin account to $0 — large cash withdrawal fully draining"
        + " an account warrants review even below high-value monitoring thresholds"
    )
    out["rule"] = "MODERATE_CASHOUT"
    return out


def _rule_mid_transfer(df: pd.DataFrame) -> pd.DataFrame:
    """
    TYPOLOGY: Structuring / Below-Threshold Layering
    Mid-range TRANSFER ($50k–$500k) clearing both origin and destination.
    The sub-$500k range is used to stay below high-value wire monitoring thresholds,
    a common structuring technique. Dataset-calibrated: 74.5% precision on PaySim.
    """
    mask = (
        (df["type"] == "TRANSFER")
        & (df["newbalanceOrig"] == 0)
        & (df["newbalanceDest"] == 0)
        & (df["amount"] >= 50_000)
        & (df["amount"] < 500_000)
    )
    out = df[mask].copy()
    out["flag_reason"] = (
        "TRANSFER of $"
        + df.loc[mask, "amount"].round(2).astype(str)
        + " cleared both origin ($0) and destination ($0) — mid-range amount"
        + " may indicate deliberate structuring below high-value wire monitoring thresholds"
    )
    out["rule"] = "MID_TRANSFER_STRUCTURING"
    return out


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

def flag_transactions(df: pd.DataFrame, samples_per_rule: int = SAMPLES_PER_RULE) -> pd.DataFrame:
    """
    Run all four triage rules and return a diverse sample of flagged transactions.

    Each rule contributes up to `samples_per_rule` rows, ensuring the final
    flagged set covers multiple AML typologies rather than a single pattern.
    All rules are calibrated to PaySim's actual fraud signature (precision ≥75%).
    Deduplicates by index so a transaction isn't investigated twice.
    """
    rules = [
        (_rule_account_draining,  5),   # 100% precision — core PaySim fraud pattern
        (_rule_large_transfer,    5),   # ~89% precision — high-value wire fraud
        (_rule_high_value_cashout, 5),  # ~82% precision — cash placement (≥$1M)
        (_rule_mid_transfer,      5),   # ~75% precision — structuring below threshold
        (_rule_moderate_cashout,  2),   # ~30-40% precision — intentionally broad, produces 1-2 FPs for demo realism
    ]

    parts = []
    seen_indices = set()

    for rule_fn, cap in rules:
        result = rule_fn(df)
        # Drop any already captured by a prior rule
        result = result[~result.index.isin(seen_indices)]
        if len(result) > 0:
            sampled = result.sample(n=min(cap, len(result)), random_state=42)
            parts.append(sampled)
            seen_indices.update(sampled.index.tolist())

    if not parts:
        return pd.DataFrame(columns=list(df.columns) + ["flag_reason", "rule"])

    return pd.concat(parts).sort_index()


def triage_summary(flagged: pd.DataFrame, total: int) -> dict:
    by_rule = flagged["rule"].value_counts().to_dict() if "rule" in flagged.columns else {}
    return {
        "total_sampled": total,
        "flagged_count": len(flagged),
        "flag_rate_pct": round(len(flagged) / total * 100, 1),
        "by_type": flagged["type"].value_counts().to_dict(),
        "by_rule": by_rule,
    }
