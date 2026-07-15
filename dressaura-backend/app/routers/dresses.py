from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
from sqlalchemy import or_
import os
import shutil
from datetime import datetime

from app.deps import get_db
from app import models, schemas

router = APIRouter(prefix="/dresses", tags=["Dresses"])

UPLOAD_DIR = "app/uploads/dresses"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/", response_model=list[schemas.DressOut])
def list_dresses(
    db: Session = Depends(get_db),
    size: Optional[str] = Query(None),
    condition: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    search: Optional[str] = Query(None),
):
    query = db.query(models.Dress).filter(models.Dress.is_sold == False)

    if size:
        query = query.filter(models.Dress.size == size)

    if condition:
        query = query.filter(models.Dress.condition_status == condition)

    if min_price is not None:
        query = query.filter(models.Dress.price >= min_price)

    if max_price is not None:
        query = query.filter(models.Dress.price <= max_price)

    if search:
        query = query.filter(models.Dress.brand.ilike(f"%{search}%"))

    return query.all()


@router.get("/{dress_id}", response_model=schemas.DressOut)
def get_dress(dress_id: int, db: Session = Depends(get_db)):
    dress = db.query(models.Dress).filter(models.Dress.id == dress_id).first()
    if not dress:
        raise HTTPException(status_code=404, detail="Dress not found")
    return dress


@router.post("/", response_model=schemas.DressOut)
async def create_dress(
    user_id: int = Form(...),
    brand: str = Form(...),
    size: str = Form(...),
    condition_status: str = Form(...),
    price: float = Form(...),
    description: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    image_url = None

    if image:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{image.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        image_url = f"/uploads/dresses/{filename}"

    new_dress = models.Dress(
        user_id=user_id,
        brand=brand,
        size=size,
        condition_status=condition_status,
        price=price,
        description=description,
        image_url=image_url
    )

    db.add(new_dress)
    db.commit()
    db.refresh(new_dress)
    return new_dress


@router.put("/{dress_id}", response_model=schemas.DressOut)
def update_dress(
    dress_id: int,
    dress_update: schemas.DressCreate,
    db: Session = Depends(get_db)
):
    dress = db.query(models.Dress).filter(models.Dress.id == dress_id).first()

    if not dress:
        raise HTTPException(status_code=404, detail="Dress not found")

    dress.brand = dress_update.brand
    dress.size = dress_update.size
    dress.condition_status = dress_update.condition_status
    dress.price = dress_update.price
    dress.description = dress_update.description

    db.commit()
    db.refresh(dress)
    return dress


@router.delete("/{dress_id}")
def delete_dress(dress_id: int, db: Session = Depends(get_db)):
    dress = db.query(models.Dress).filter(models.Dress.id == dress_id).first()

    if not dress:
        raise HTTPException(status_code=404, detail="Dress not found")


    dress.is_sold = True

    db.commit()
    db.refresh(dress)

    return {"message": "Listing removed successfully"}