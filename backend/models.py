from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    role = Column(String)
    status = Column(String) # active, disabled

class Device(Base):
    __tablename__ = "devices"

    id = Column(String, primary_key=True, index=True)
    location = Column(String)
    status = Column(String) # online, offline
    lastReading = Column(String)

class Violation(Base):
    __tablename__ = "violations"

    id = Column(Integer, primary_key=True, index=True)
    sensor = Column(String)
    level = Column(Float)
    time = Column(String)
    reportId = Column(Integer, ForeignKey("reports.id"), nullable=True)

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    reporter = Column(String)
    publishedDate = Column(String)
    vehicleType = Column(String)
    plate = Column(String)
    location = Column(String)
    datetime = Column(String)
    description = Column(String)
    status = Column(String) # PENDING, ACTION TAKEN, DISMISSED
    attachments = Column(String, nullable=True) # JSON string
    comments = Column(String, nullable=True) # JSON string

class Stats(Base):
    __tablename__ = "stats"
    id = Column(Integer, primary_key=True, index=True)
    activeSensors = Column(Integer, default=0)
    highestDb = Column(Float, default=0.0)
    violationsToday = Column(Integer, default=0)
    onlineDevices = Column(Integer, default=0)
