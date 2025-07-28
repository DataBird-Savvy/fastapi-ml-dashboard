from fastapi import APIRouter, Query
import pandas as pd
import numpy as np
from scipy.stats import skew

from app.api.upload import session_data
from app.db.mongo import dataset_collection

from logger import logger
from exception import DAException

router = APIRouter()

@router.get("/profile")
def profile(session_id: str = Query(...)):
    logger.info(f"📥 Received profile request for session_id: {session_id}")

    if session_id not in session_data:
        logger.warning(f"❌ Invalid session_id: {session_id}")
        raise DAException("Invalid session_id", status_code=404)

    try:
        session = session_data[session_id]
        df = session["df"]
        parsed_schema = session.get("parsed_schema", [])

        logger.info(f"✅ DataFrame retrieved. Columns: {df.columns.tolist()}")

        # Outliers
        outliers = {}
        for col in df.select_dtypes(include=[np.number]).columns:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            outlier_count = ((df[col] < Q1 - 1.5 * IQR) | (df[col] > Q3 + 1.5 * IQR)).sum()
            outliers[col] = int(outlier_count)
        logger.info("📊 Outliers computed")

        # Skewness
        skewness = df.select_dtypes(include=[np.number]).apply(
            lambda x: round(skew(x.dropna()), 3)
        ).to_dict()
        logger.info("📈 Skewness calculated")

        # Correlations
        correlations = df.select_dtypes(include=[np.number]).corr().to_dict()
        logger.info("🔗 Correlation matrix calculated")

        # Imbalance
        imbalance = {}
        for col in df.columns:
            freq = df[col].value_counts(normalize=True, dropna=False)
            if not freq.empty and freq.iloc[0] > 0.9:
                imbalance[col] = round(freq.iloc[0] * 100, 2)
        logger.info("⚖️  Imbalance check complete")

        # Data leakage
        leakage = {}
        if 'target' in df.columns:
            for col in df.select_dtypes(include=[np.number]).columns:
                if col != 'target':
                    sub = df[[col, 'target']].dropna()
                    if len(sub) > 1:
                        corr_val = sub.corr().iloc[0, 1]
                        if pd.notna(corr_val) and abs(corr_val) > 0.9:
                            leakage[col] = round(corr_val, 4)
        logger.info("🔒 Potential leakage check complete")

        profile = {
            "parsed_schema": parsed_schema,
            "outliers": outliers,
            "skewness": skewness,
            "pairwise_correlations": correlations,
            "imbalanced_columns": imbalance,
            "potential_leakage": leakage
        }

        # Save to DB
        dataset_collection.update_one(
            {"session_id": session_id},
            {"$set": {"profile": profile}},
            upsert=True
        )
        logger.info(f"💾 Profile saved to DB for session_id: {session_id}")
        logger.info(f"💾 Profile saved to DB tat is: {profile}")
        return {
            "message": "Data profiling complete.",
            "profile": profile
        }

    except Exception as e:
        logger.exception(f"🔥 Error while profiling session {session_id}")
        raise DAException("Error during profiling. Please try again.")
