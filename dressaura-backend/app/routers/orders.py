from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Order, Dress, User

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("/")
def create_order(
    user_id: int,
    dress_id: int,
    payment_method: str,
    db: Session = Depends(get_db)
):

    dress = db.query(Dress).filter(Dress.id == dress_id).first()

    if not dress:
        return {"error": "Dress not found"}


    if dress.is_sold:
        return {"error": "Dress already sold"}


    order = Order(
        user_id=user_id,
        dress_id=dress_id,
        payment_method=payment_method,
        status="in-progress"
    )

    db.add(order)
    db.commit()
    db.refresh(order)


    dress.is_sold = True
    db.commit()

    return {
        "message": "Order created successfully",
        "order_id": order.id,
        "dress_id": dress.id
    }



@router.get("/stats/{user_id}")
def get_order_stats(user_id: int, db: Session = Depends(get_db)):
    ordered_count = db.query(Order).filter(
        Order.user_id == user_id
    ).count()

    sold_count = (
        db.query(Order)
        .join(Dress, Order.dress_id == Dress.id)
        .filter(Dress.user_id == user_id)
        .count()
    )

    return {
        "ordered": ordered_count,
        "sold": sold_count
    }


@router.put("/{order_id}/complete")
def complete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        return {"error": "Order not found"}

    order.status = "completed"
    db.commit()
    db.refresh(order)

    return {
        "message": "Order marked as completed",
        "order_id": order.id,
        "status": order.status
    }


@router.get("/{user_id}/{order_type}/{status}")
def get_orders(
    user_id: int,
    order_type: str,
    status: str,
    db: Session = Depends(get_db)
):

    normalized_status = status

    if order_type == "ordered":
        orders = db.query(Order).filter(
            Order.user_id == user_id,
            Order.status == normalized_status
        ).all()

    else:  # sold
        orders = (
            db.query(Order)
            .join(Dress, Order.dress_id == Dress.id)
            .filter(
                Dress.user_id == user_id,
                Order.status == normalized_status
            )
            .all()
        )

    result = []

    for order in orders:
        dress = db.query(Dress).filter(Dress.id == order.dress_id).first()

        result.append({
            "id": order.id,
            "status": order.status,
            "payment_method": order.payment_method,
            "created_at": order.created_at,
            "dress": {
                "id": dress.id,
                "brand": dress.brand,
                "size": dress.size,
                "price": float(dress.price),
                "image_url": dress.image_url,
                "is_sold": dress.is_sold,
            } if dress else None
        })

    return result