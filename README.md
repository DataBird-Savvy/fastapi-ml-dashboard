# 📊 Mini AI Analyst as a Service (AaaS)

A full-stack AI-powered platform that allows users to upload CSV files, automatically profile datasets, train machine learning models, and generate insights & predictions — all accessible via API and dashboard.

This project is built as part of the **Othor AI – Full Stack AI Developer** take-home assignment.

---

## 🚀 Features

### **Backend (FastAPI)**
- CSV ingestion (up to 50MB) with streaming (no full memory load)
- Schema inference:
  - Column types (categorical, numerical, datetime, boolean)
  - Unique value counts & null percentage
  - Flags for high cardinality / constant columns
- Data profiling:
  - Outliers, skewness, correlations
  - Imbalanced columns
  - Data leakage detection
- AutoML:
  - Preprocessing (encoding, missing values)
  - Model training (classification/regression)
  - Evaluation metrics & feature importance
- Prediction API
- Natural language data & model summary

### **Frontend (Next.js + Tailwind CSS)**
- CSV upload interface
- Display of schema & profiling insights
- Trigger model training
- Display predictions in table format
- Simple chart visualizations
- Loading & error handling

---

## 🛠️ Tech Stack

**Backend**
- Python 3.9+
- FastAPI
- Pandas, NumPy
- Scikit-learn / XGBoost
- Uvicorn
- Joblib (model persistence)

**Frontend**
- Next.js
- React
- Tailwind CSS
- Chart.js

**Other**
- Docker & Docker Compose
- UUID-based session handling

---

