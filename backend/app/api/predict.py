from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import pandas as pd
import io
import joblib

from app.db.mongo import fs, dataset_collection

router = APIRouter()

class PredictRequest(BaseModel):
    session_id: str
    inputs: List[Dict[str, Any]]

class PredictResponse(BaseModel):
    predictions: List[Any]

@router.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    # Fetch model metadata
    meta = dataset_collection.find_one({"session_id": request.session_id})
    if not meta or "model_file_id" not in meta:
        raise HTTPException(status_code=404, detail="Model not found for session.")

    # Load pipeline artifacts from GridFS
    model_file = fs.find_one({"_id": meta["model_file_id"]})
    if not model_file:
        raise HTTPException(status_code=404, detail="Model file not found.")

    pipeline_artifacts = joblib.load(io.BytesIO(model_file.read()))

    model = pipeline_artifacts["model"]
    imputer = pipeline_artifacts["imputer"]
    scaler = pipeline_artifacts["scaler"]
    feature_names = pipeline_artifacts["feature_names"]
    label_encoder = pipeline_artifacts.get("label_encoder")  # Could be None

    # Prepare input
    input_df = pd.DataFrame(request.inputs)
    input_df = pd.get_dummies(input_df)

    # Align input to training feature space
    input_df_aligned = input_df.reindex(columns=feature_names, fill_value=0)

    # Apply imputer and scaler
    input_imputed = imputer.transform(input_df_aligned)
    input_scaled = scaler.transform(input_imputed)

    # Predict
    raw_preds = model.predict(input_scaled)

    # Decode if classification
    if label_encoder:
        raw_preds = label_encoder.inverse_transform(raw_preds)

    return PredictResponse(predictions=raw_preds.tolist())
