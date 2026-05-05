from sqlalchemy.orm import Session
import models, schemas
import datetime

# Users
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user: schemas.UserCreate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        for key, value in user.dict().items():
            setattr(db_user, key, value)
        db.commit()
        db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user

# Devices
def get_devices(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Device).offset(skip).limit(limit).all()

def create_device(db: Session, device: schemas.DeviceCreate):
    db_device = models.Device(**device.dict())
    db.add(db_device)
    db.commit()
    db.refresh(db_device)
    return db_device

def update_device(db: Session, device_id: str, device: schemas.DeviceCreate):
    db_device = db.query(models.Device).filter(models.Device.id == device_id).first()
    if db_device:
        for key, value in device.dict().items():
            setattr(db_device, key, value)
        db.commit()
        db.refresh(db_device)
    return db_device

def delete_device(db: Session, device_id: str):
    db_device = db.query(models.Device).filter(models.Device.id == device_id).first()
    if db_device:
        db.delete(db_device)
        db.commit()
    return db_device

# Violations
def get_violations(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Violation).offset(skip).limit(limit).all()

def create_violation(db: Session, violation: schemas.ViolationCreate):
    db_violation = models.Violation(**violation.dict())
    db.add(db_violation)
    db.commit()
    db.refresh(db_violation)
    return db_violation

def delete_violation_by_report(db: Session, report_id: int):
    db_violations = db.query(models.Violation).filter(models.Violation.reportId == report_id).all()
    for v in db_violations:
        db.delete(v)
    db.commit()

# Reports
def get_reports(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Report).offset(skip).limit(limit).all()

def get_report(db: Session, report_id: int):
    return db.query(models.Report).filter(models.Report.id == report_id).first()

def create_report(db: Session, report: schemas.ReportCreate):
    publishedDate = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    db_report = models.Report(**report.dict(), publishedDate=publishedDate)
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

def update_report(db: Session, report_id: int, report: schemas.ReportCreate, comments: Optional[str] = None):
    db_report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if db_report:
        for key, value in report.dict().items():
            setattr(db_report, key, value)
        if comments is not None:
            db_report.comments = comments
        db.commit()
        db.refresh(db_report)
    return db_report

# Stats
def get_stats(db: Session):
    return db.query(models.Stats).first()

def update_stats(db: Session, stats: schemas.Stats):
    db_stats = db.query(models.Stats).first()
    if not db_stats:
        db_stats = models.Stats(**stats.dict())
        db.add(db_stats)
    else:
        for key, value in stats.dict().items():
            setattr(db_stats, key, value)
    db.commit()
    db.refresh(db_stats)
    return db_stats
