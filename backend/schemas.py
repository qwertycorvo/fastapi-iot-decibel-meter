from pydantic import BaseModel
from typing import List, Optional

class UserBase(BaseModel):
    name: str
    email: str
    role: str
    status: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

class DeviceBase(BaseModel):
    id: str
    location: str
    status: str
    lastReading: str

class DeviceCreate(DeviceBase):
    pass

class Device(DeviceBase):
    class Config:
        from_attributes = True

class ViolationBase(BaseModel):
    sensor: str
    level: float
    time: str
    reportId: Optional[int] = None

class ViolationCreate(ViolationBase):
    pass

class Violation(ViolationBase):
    id: int

    class Config:
        from_attributes = True

class ReportBase(BaseModel):
    title: str
    reporter: str
    vehicleType: str
    plate: str
    location: str
    datetime: str
    description: str
    status: str

class ReportCreate(ReportBase):
    pass

class Report(ReportBase):
    id: int
    publishedDate: str
    attachments: Optional[str] = None
    comments: Optional[str] = None

    class Config:
        from_attributes = True

class Stats(BaseModel):
    activeSensors: int
    highestDb: float
    violationsToday: int
    onlineDevices: int

    class Config:
        from_attributes = True

class PredictionRequest(BaseModel):
    db_level: float
    hour: int

class PredictionResponse(BaseModel):
    category: str
    confidence: float
    is_night_mode: bool
    effective_db: float
