# main.py or app.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.auth import router as auth_router 
from app.api.upload import router as upload_router
from app.api.profile import router as profile_router
from app.api.train import router as train_router

from logger import logger

from exception import DAException

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(upload_router)
app.include_router(profile_router)
app.include_router(train_router)



