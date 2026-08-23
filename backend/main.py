from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, Base, get_db
from models import Car, User
from schemas import CarCreate, CarResponse, LoginRequest
from auth import verify_password, hash_password


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Car Dealership Inventory API")


# Allow React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Car Dealership Inventory API is running"}


@app.post("/cars", response_model=CarResponse)
def create_car(car: CarCreate, db: Session = Depends(get_db)):
    new_car = Car(**car.model_dump())

    db.add(new_car)
    db.commit()
    db.refresh(new_car)

    return new_car


@app.get("/cars", response_model=list[CarResponse])
def get_cars(db: Session = Depends(get_db)):
    return db.query(Car).all()


@app.get("/cars/{car_id}", response_model=CarResponse)
def get_car(car_id: int, db: Session = Depends(get_db)):
    car = db.query(Car).filter(Car.id == car_id).first()

    if not car:
        raise HTTPException(
            status_code=404,
            detail="Car not found"
        )

    return car


@app.put("/cars/{car_id}", response_model=CarResponse)
def update_car(
    car_id: int,
    car_data: CarCreate,
    db: Session = Depends(get_db)
):
    car = db.query(Car).filter(Car.id == car_id).first()

    if not car:
        raise HTTPException(
            status_code=404,
            detail="Car not found"
        )

    for key, value in car_data.model_dump().items():
        setattr(car, key, value)

    db.commit()
    db.refresh(car)

    return car


@app.delete("/cars/{car_id}")
def delete_car(
    car_id: int,
    db: Session = Depends(get_db)
):
    car = db.query(Car).filter(Car.id == car_id).first()

    if not car:
        raise HTTPException(
            status_code=404,
            detail="Car not found"
        )

    db.delete(car)
    db.commit()

    return {
        "message": "Car deleted successfully"
    }


# LOGIN
@app.post("/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.username == data.username
    ).first()

    if not user or not verify_password(
        data.password,
        user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    return {
        "message": "Login successful",
        "username": user.username
    }


# REGISTER
@app.post("/register")
def register(
    data: LoginRequest,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.username == data.username
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    new_user = User(
        username=data.username,
        password=hash_password(data.password)
    )

    db.add(new_user)
    db.commit()

    return {
        "message": "Registration successful"
    }