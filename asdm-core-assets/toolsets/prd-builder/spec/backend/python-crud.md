# Python CRUD Specification

This document provides a template and guidelines for generating Python CRUD operations using FastAPI and SQLAlchemy.

## Tech Stack

| Component | Version | Notes |
|-----------|---------|-------|
| Python | 3.11+ | Latest stable |
| FastAPI | 0.109.x | Web framework |
| SQLAlchemy | 2.0.x | ORM framework |
| Pydantic | 2.x | Data validation |
| PostgreSQL/SQLite | - | Database (configurable) |
| Uvicorn | 0.27.x | ASGI server |

## Project Structure

```
src/
├── main.py                     # Application entry point
├── config/
│   └── settings.py            # Configuration
├── models/
│   └── {entity}.py            # Database models
├── schemas/
│   └── {entity}_schema.py     # Pydantic schemas
├── crud/
│   └── {entity}_crud.py       # CRUD operations
├── routers/
│   └── {entity}.py            # API endpoints
├── database.py                # Database connection
└── deps.py                    # Dependencies

tests/
├── test_crud/
│   └── test_{entity}_crud.py
└── test_api/
    └── test_{entity}_api.py
```

## Database Configuration

```python
# src/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from .config.settings import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

## Settings Configuration

```python
# src/config/settings.py
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    APP_NAME: str = "My API"
    DATABASE_URL: str = "sqlite:///./app.db"
    
    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()


settings = get_settings()
```

## Model Template

```python
# src/models/{entity}.py
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from datetime import datetime

from ..database import Base


class {Entity}(Base):
    __tablename__ = "{entity_table}"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    description = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

## Schema Templates

### Request Schema

```python
# src/schemas/{entity}_schema.py
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class {Entity}Base(BaseModel):
    name: str
    description: Optional[str] = None


class {Entity}Create({Entity}Base):
    pass


class {Entity}Update({Entity}Base):
    pass


class {Entity}InDB({Entity}Base):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class {Entity}Response({Entity}InDB):
    pass
```

## CRUD Template

```python
# src/crud/{entity}_crud.py
from typing import List, Optional
from sqlalchemy.orm import Session

from ..models.{entity} import {Entity}
from ..schemas.{entity}_schema import {Entity}Create, {Entity}Update


def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[{Entity}]:
    return (
        db.query({Entity})
        .filter({Entity}.is_active == True)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_by_id(db: Session, {entity}_id: int) -> Optional[{Entity}]:
    return (
        db.query({Entity})
        .filter({Entity}.id == {entity}_id, {Entity}.is_active == True)
        .first()
    )


def create(db: Session, {entity}_in: {Entity}Create) -> {Entity}:
    {entity} = {Entity}(**{entity}_in.model_dump())
    db.add({entity})
    db.commit()
    db.refresh({entity})
    return {entity}


def update(
    db: Session, {entity}_id: int, {entity}_in: {Entity}Update
) -> Optional[{Entity}]:
    {entity} = get_by_id(db, {entity}_id)
    if {entity}:
        update_data = {entity}_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr({entity}, field, value)
        db.commit()
        db.refresh({entity})
    return {entity}


def delete(db: Session, {entity}_id: int) -> bool:
    {entity} = get_by_id(db, {entity}_id)
    if {entity}:
        # Soft delete
        {entity}.is_active = False
        db.commit()
        return True
    return False
```

## Router Template

```python
# src/routers/{entity}.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas.{entity}_schema import {Entity}Create, {Entity}Update, {Entity}Response
from ..crud.{entity}_crud import (
    get_all,
    get_by_id,
    create,
    update,
    delete,
)

router = APIRouter(prefix="/{entity_path}", tags=["{entity}"])


@router.get("", response_model=List[{Entity}Response])
def read_{entity}s(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    items = get_all(db, skip=skip, limit=limit)
    return items


@router.get("/{id}", response_model={Entity}Response)
def read_{entity}(id: int, db: Session = Depends(get_db)):
    item = get_by_id(db, id)
    if not item:
        raise HTTPException(status_code=404, detail="{Entity} not found")
    return item


@router.post("", response_model={Entity}Response, status_code=status.HTTP_201_CREATED)
def create_{entity}({entity}_in: {Entity}Create, db: Session = Depends(get_db)):
    return create(db, {entity}_in)


@router.put("/{id}", response_model={Entity}Response)
def update_{entity}(id: int, {entity}_in: {Entity}Update, db: Session = Depends(get_db)):
    item = update(db, id, {entity}_in)
    if not item:
        raise HTTPException(status_code=404, detail="{Entity} not found")
    return item


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_{entity}(id: int, db: Session = Depends(get_db)):
    if not delete(db, id):
        raise HTTPException(status_code=404, detail="{Entity} not found")
```

## Main Application

```python
# src/main.py
from fastapi import FastAPI
from .routers import {entity}

app = FastAPI(
    title="My API",
    description="API description",
    version="1.0.0",
)

# Include routers
app.include_router({entity}.router)


@app.get("/")
def root():
    return {"message": "Welcome to My API"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

## Dependencies

```txt
# requirements.txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
pydantic==2.5.3
pydantic-settings==2.1.0
psycopg2-binary==2.9.9  # For PostgreSQL
alembic==1.13.1  # For migrations
pytest==7.4.4
pytest-asyncio==0.23.3
httpx==0.26.0
```

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /{entity_path} | List all active entities |
| GET | /{entity_path}/{id} | Get entity by ID |
| POST | /{entity_path} | Create new entity |
| PUT | /{entity_path}/{id} | Update entity |
| DELETE | /{entity_path}/{id} | Soft delete entity |

## Acceptance Criteria

1. All CRUD endpoints return correct HTTP status codes
2. Validation errors return 422 Unprocessable Entity with error details
3. Non-existent entities return 404 Not Found
4. Successful operations return the created/updated entity
5. Delete performs soft delete (sets is_active = False)
6. Code follows PEP 8 and FastAPI best practices
7. Unit tests cover CRUD operations
8. Use Pydantic v2 for data validation
9. Use SQLAlchemy 2.0 for database operations

## Testing Template

```python
# tests/test_api/test_{entity}_api.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.main import app
from src.database import Base, get_db
from src.models.{entity} import {Entity}

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture
def client():
    Base.metadata.create_all(bind=engine)
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    Base.metadata.drop_all(bind=engine)


def test_create_{entity}(client):
    response = client.post(
        "/{entity_path}",
        json={{"name": "Test {Entity}", "description": "Test description"}},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test {Entity}"
    assert "id" in data


def test_read_{entity}(client):
    # Create first
    client.post(
        "/{entity_path}",
        json={{"name": "Test {Entity}"}},
    )
    response = client.get("/{entity_path}/1")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test {Entity}"


def test_read_{entity}s(client):
    response = client.get("/{entity_path}")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
```
