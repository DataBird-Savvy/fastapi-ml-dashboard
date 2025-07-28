from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict
import io
import joblib
import pandas as pd

from app.db.mongo import fs, dataset_collection
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder, LabelEncoder
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, mean_squared_error, r2_score

router = APIRouter()

class TrainRequest(BaseModel):
    session_id: str

class TrainResponse(BaseModel):
    model_type: str
    model_file_id: str
    metrics: Dict[str, float]
    feature_importances: Dict[str, float]

@router.post("/train", response_model=TrainResponse)
def train_model(request: TrainRequest):
    # Load file
    meta = dataset_collection.find_one({"session_id": request.session_id})
    if not meta:
        raise HTTPException(status_code=404, detail="Session not found")

    csv_file = fs.find_one({"_id": meta["csv_file_id"]})
    if not csv_file:
        raise HTTPException(status_code=404, detail="CSV file not found")

    df = pd.read_csv(io.BytesIO(csv_file.read()))

    # Auto-detect target
    possible_targets = ["target", "label"]
    target_col = next((col for col in df.columns if col.strip().lower() in possible_targets), None)
    if not target_col:
        raise HTTPException(status_code=400, detail="Target column not found")

    X = df.drop(columns=[target_col])
    y = df[target_col]

    # Column types
    numeric_cols = X.select_dtypes(include=["int64", "float64"]).columns.tolist()
    categorical_cols = X.select_dtypes(include=["object", "category", "bool"]).columns.tolist()

    # Pipeline preprocessors
    numeric_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="mean")),
        ("scaler", StandardScaler())
    ])
    categorical_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore"))
    ])
    preprocessor = ColumnTransformer(transformers=[
        ("num", numeric_transformer, numeric_cols),
        ("cat", categorical_transformer, categorical_cols)
    ])

    # Auto-detect task
    is_classification = y.dtype == "object" or y.nunique() < 20
    label_encoder = None
    if is_classification:
        label_encoder = LabelEncoder()
        y = label_encoder.fit_transform(y)

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Model selection
    if is_classification:
        model = RandomForestClassifier(random_state=42)
        model_type = "classification"
    else:
        model = RandomForestRegressor(random_state=42)
        model_type = "regression"

    # Full pipeline
    pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("model", model)
    ])

    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)

    # Evaluation
    if is_classification:
        metrics = {
            "accuracy": accuracy_score(y_test, y_pred),
            "precision": precision_score(y_test, y_pred, average="weighted", zero_division=0),
            "recall": recall_score(y_test, y_pred, average="weighted", zero_division=0),
            "f1_score": f1_score(y_test, y_pred, average="weighted", zero_division=0),
        }
    else:
        metrics = {
            "rmse": mean_squared_error(y_test, y_pred, squared=False),
            "r2": r2_score(y_test, y_pred),
        }

    # Get feature importances (after preprocessing)
    model_fitted = pipeline.named_steps["model"]
    try:
        importances = model_fitted.feature_importances_
        feature_names = pipeline.named_steps["preprocessor"].get_feature_names_out()
        top_indices = importances.argsort()[::-1][:10]
        top_feature_importances = {
            feature_names[i]: round(float(importances[i]), 5)
            for i in top_indices
        }
    except AttributeError:
        top_feature_importances = {}

    # Save full pipeline
    buffer = io.BytesIO()
    joblib.dump({
        "pipeline": pipeline,
        "label_encoder": label_encoder,
        "target_col": target_col
    }, buffer)
    buffer.seek(0)

    model_file_id = fs.put(buffer.read(), filename="model.joblib", session_id=request.session_id)

    # Update DB
    dataset_collection.update_one(
        {"session_id": request.session_id},
        {"$set": {
            "model_file_id": model_file_id,
            "metrics": metrics,
            "model_type": model_type
        }}
    )

    return TrainResponse(
        model_type=model_type,
        model_file_id=str(model_file_id),
        metrics=metrics,
        feature_importances=top_feature_importances
    )
