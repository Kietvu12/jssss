from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# from routers import resume
from routers import resume3, jd, compare

app = FastAPI(
    title="Resume Parser AI System",
    description="API trích xuất thông tin CV",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# app.include_router(resume.router)
app.include_router(resume3.router)
app.include_router(compare.router)
app.include_router(jd.router)

@app.get("/")
def root():
    return {"message": "Server is running! Go to /docs to test API."}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)