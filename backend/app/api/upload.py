from fastapi import APIRouter, UploadFile
import pandas as pd
import uuid

from app.db.mongo import dataset_collection, fs  # ✅ import GridFS handler
from logger import logger
from exception import DAException

router = APIRouter()

# In-memory session storage
session_data = {}

@router.post("/upload")
async def upload_csv(file: UploadFile):
    logger.info(f"📤 Uploading file: {file.filename}")

    if not file.filename.endswith(".csv"):
        logger.warning(f"❌ Invalid file format: {file.filename}")
        raise DAException("Only CSV files are allowed.", status_code=400)

    contents = await file.read()

    try:
        df = pd.read_csv(pd.io.common.BytesIO(contents))
        logger.info(f"✅ CSV read successfully: {file.filename} — Shape: {df.shape}")
    except Exception as e:
        logger.exception("❌ Failed to read CSV")
        raise DAException(f"Failed to read CSV: {str(e)}", status_code=400)

    session_id = str(uuid.uuid4())
    logger.info(f"🆔 New session created: {session_id}")

    # Infer parsed schema
    def infer_column_type(series: pd.Series):
        if pd.api.types.is_numeric_dtype(series):
            return "numerical"
        elif pd.api.types.is_datetime64_any_dtype(series):
            return "datetime"
        elif pd.api.types.is_bool_dtype(series):
            return "boolean"
        else:
            return "categorical"

    parsed_schema = []
    for col in df.columns:
        series = df[col]
        col_type = infer_column_type(series)
        unique_vals = series.nunique()
        null_pct = series.isnull().mean() * 100
        sample_vals = series.dropna().unique()[:3].tolist()

        parsed_schema.append({
            "column": col,
            "dtype": col_type,
            "unique_values": int(unique_vals),
            "null_percentage": round(null_pct, 2),
            "high_cardinality": unique_vals > 50,
            "constant": unique_vals == 1,
            "sample_values": [str(val) for val in sample_vals]
        })

    # Save DataFrame and schema in memory
    session_data[session_id] = {
        "df": df,
        "parsed_schema": parsed_schema
    }
    logger.info(f"🧠 Session data stored in memory for: {session_id}")

    # ✅ Store CSV file in GridFS
    try:
        csv_file_id = fs.put(contents, filename=file.filename, session_id=session_id)
        logger.info(f"🗂️ CSV file saved to GridFS: {csv_file_id}")
    except Exception as e:
        logger.exception("❌ Failed to store CSV in GridFS")
        raise DAException("Failed to store CSV file.", status_code=500)

    # ✅ Save schema + file ID to MongoDB
    try:
        dataset_collection.update_one(
            {"session_id": session_id},
            {"$set": {
                "session_id": session_id,
                "parsed_schema": parsed_schema,
                "num_rows": len(df),
                "num_columns": len(df.columns),
                "csv_file_id": csv_file_id  
            }},
            upsert=True
        )
        logger.info(f"💾 Parsed schema saved to MongoDB for session: {session_id}")
        logger.info(f"💾 columns: {df.columns.tolist()}")
    except Exception as e:
        logger.exception("❌ Failed to save schema to MongoDB")
        raise DAException("Failed to save metadata to database.", status_code=500)

    return {
        "session_id": session_id,
        "parsed_schema": parsed_schema
    }
