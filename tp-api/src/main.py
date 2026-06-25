from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routers.articulos import router as articulos_router

app = FastAPI()
app.title = 'TP Evaluativo - Mi API'

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(articulos_router, prefix="/articulos")
