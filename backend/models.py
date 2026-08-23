from sqlalchemy import Column, Integer, String, Float, Boolean
from database import Base


class Car(Base):
    __tablename__ = "cars"

    id = Column(Integer, primary_key=True, index=True)
    brand = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    year = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    mileage = Column(Float, nullable=False)
    fuel_type = Column(String(50), nullable=False)
    availability = Column(Boolean, default=True)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    password = Column(String(255), nullable=False)