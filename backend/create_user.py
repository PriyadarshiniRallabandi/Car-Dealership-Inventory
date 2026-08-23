from database import SessionLocal, Base, engine
from models import User
from auth import hash_password

Base.metadata.create_all(bind=engine)

db = SessionLocal()

existing = db.query(User).filter(User.username == "admin").first()

if not existing:
    user = User(
        username="admin",
        password=hash_password("admin123")
    )

    db.add(user)
    db.commit()

    print("Admin user created successfully")
else:
    print("Admin user already exists")

db.close()