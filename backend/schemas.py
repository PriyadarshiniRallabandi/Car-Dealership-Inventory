from pydantic import BaseModel


class CarCreate(BaseModel):
    brand: str
    model: str
    year: int
    price: float
    mileage: float
    fuel_type: str
    availability: bool = True


class CarResponse(CarCreate):
    id: int

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    username: str
    password: str