from sqlalchemy import Column, Integer, String, Text, DECIMAL, ForeignKey, TIMESTAMP, Boolean
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())


class Dress(Base):
    __tablename__ = "dresses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    brand = Column(String(100), nullable=False)
    size = Column(String(10), nullable=False)
    condition_status = Column(String(50), nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)
    description = Column(Text)
    image_url = Column(String(255))
    is_sold = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.now())


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    dress_id = Column(Integer, ForeignKey("dresses.id"), nullable=False)
    payment_method = Column(String(50))
    status = Column(String(50), default="pending")
    created_at = Column(TIMESTAMP, server_default=func.now())