from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import json

import crud, models, schemas
from database import SessionLocal, engine, get_db
from ai_model import noise_model

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
def read_root():
    return {"status": "online", "message": "Decibel Meter API is running", "database": "connected"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed initial data if empty
@app.on_event("startup")
def startup_populate_db():
    db = SessionLocal()
    try:
        if not db.query(models.User).first():
            crud.create_user(db, schemas.UserCreate(name="Alice Johnson", email="alice.johnson@example.com", role="admin", status="active"))
            crud.create_user(db, schemas.UserCreate(name="Bob Smith", email="bob.smith@example.com", role="enforcer", status="disabled"))
        
        if not db.query(models.Device).first():
            crud.create_device(db, schemas.DeviceCreate(id="DEV-001", location="Building A - Lobby", status="online", lastReading="2026-03-01 09:45"))
            crud.create_device(db, schemas.DeviceCreate(id="DEV-002", location="Building B - Floor 3", status="offline", lastReading="2026-03-01 08:12"))
        
        if not db.query(models.Stats).first():
            crud.update_stats(db, schemas.Stats(activeSensors=128, highestDb=102.5, violationsToday=3, onlineDevices=54))
            
        if not db.query(models.Violation).first():
            crud.create_violation(db, schemas.ViolationCreate(sensor="Sensor A", level=95.7, time="2026-03-01 09:23"))

    finally:
        db.close()

# Users
@app.get("/users/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db=db, user=user)

@app.put("/users/{user_id}", response_model=schemas.User)
def update_user(user_id: int, user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.update_user(db=db, user_id=user_id, user=user)

@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    crud.delete_user(db=db, user_id=user_id)
    return {"status": "success"}

# Devices
@app.get("/devices/", response_model=List[schemas.Device])
def read_devices(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_devices(db, skip=skip, limit=limit)

@app.post("/devices/", response_model=schemas.Device)
def create_device(device: schemas.DeviceCreate, db: Session = Depends(get_db)):
    return crud.create_device(db=db, device=device)

@app.put("/devices/{device_id}", response_model=schemas.Device)
def update_device(device_id: str, device: schemas.DeviceCreate, db: Session = Depends(get_db)):
    return crud.update_device(db=db, device_id=device_id, device=device)

@app.delete("/devices/{device_id}")
def delete_device(device_id: str, db: Session = Depends(get_db)):
    crud.delete_device(db=db, device_id=device_id)
    return {"status": "success"}

# Violations
@app.get("/violations/", response_model=List[schemas.Violation])
def read_violations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_violations(db, skip=skip, limit=limit)

@app.post("/violations/", response_model=schemas.Violation)
def create_violation(violation: schemas.ViolationCreate, db: Session = Depends(get_db)):
    return crud.create_violation(db=db, violation=violation)

# Reports
@app.get("/reports/", response_model=List[schemas.Report])
def read_reports(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_reports(db, skip=skip, limit=limit)

@app.get("/reports/{report_id}", response_model=schemas.Report)
def read_report(report_id: int, db: Session = Depends(get_db)):
    db_report = crud.get_report(db, report_id=report_id)
    if db_report is None:
        raise HTTPException(status_code=404, detail="Report not found")
    return db_report

@app.post("/reports/", response_model=schemas.Report)
def create_report(report: schemas.ReportCreate, db: Session = Depends(get_db)):
    db_report = crud.create_report(db=db, report=report)
    
    # Handle violation creation if PENDING
    if db_report.status == "PENDING":
        crud.create_violation(db, schemas.ViolationCreate(
            sensor=db_report.location,
            level=0.0,
            time=db_report.datetime,
            reportId=db_report.id
        ))
        # Update stats
        current_stats = crud.get_stats(db)
        if current_stats:
            current_stats.violationsToday += 1
            db.commit()
            
    return db_report

@app.put("/reports/{report_id}", response_model=schemas.Report)
def update_report(report_id: int, report_data: dict, db: Session = Depends(get_db)):
    old_report = crud.get_report(db, report_id)
    if not old_report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    prev_status = old_report.status
    
    # Extract report fields and comments
    report_fields = {k: v for k, v in report_data.items() if k != "comments" and k != "id" and k != "publishedDate"}
    comments = report_data.get("comments")
    if isinstance(comments, list):
        comments = json.dumps(comments)
    
    report_create = schemas.ReportCreate(**report_fields)
    new_report = crud.update_report(db=db, report_id=report_id, report=report_create, comments=comments)
    
    # Status transition logic
    if prev_status == "PENDING" and new_report.status != "PENDING":
        crud.delete_violation_by_report(db, report_id)
        current_stats = crud.get_stats(db)
        if current_stats:
            current_stats.violationsToday = max(0, current_stats.violationsToday - 1)
            db.commit()
    elif prev_status != "PENDING" and new_report.status == "PENDING":
        crud.create_violation(db, schemas.ViolationCreate(
            sensor=new_report.location,
            level=0.0,
            time=new_report.datetime,
            reportId=new_report.id
        ))
        current_stats = crud.get_stats(db)
        if current_stats:
            current_stats.violationsToday += 1
            db.commit()
            
    return new_report

# Stats
@app.get("/stats/", response_model=schemas.Stats)
def read_stats(db: Session = Depends(get_db)):
    stats = crud.get_stats(db)
    if not stats:
        return schemas.Stats(activeSensors=0, highestDb=0.0, violationsToday=0, onlineDevices=0)
    return stats

@app.put("/stats/", response_model=schemas.Stats)
def update_stats(stats: schemas.Stats, db: Session = Depends(get_db)):
    return crud.update_stats(db=db, stats=stats)

# AI Prediction
@app.post("/predict/", response_model=schemas.PredictionResponse)
def predict_noise(request: schemas.PredictionRequest):
    """
    Endpoint to predict noise category using the AI model.
    """
    prediction = noise_model.predict(request.db_level, request.hour)
    return prediction

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
