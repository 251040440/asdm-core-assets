# Go CRUD Specification

This document provides a template and guidelines for generating Go CRUD operations using Gin framework and GORM.

## Tech Stack

| Component | Version | Notes |
|-----------|---------|-------|
| Go | 1.21+ | Latest stable |
| Gin | 1.9.x | HTTP web framework |
| GORM | 1.25.x | ORM framework |
| MySQL/PostgreSQL/SQLite | - | Database (configurable) |

## Project Structure

```
cmd/
└── server/
    └── main.go

internal/
├── config/
│   └── config.go
├── models/
│   └── {entity}.go
├── handlers/
│   └── {entity}_handler.go
├── repositories/
│   └── {entity}_repository.go
├── services/
│   └── {entity}_service.go
├── dto/
│   └── {entity}_dto.go
└── middleware/
    └── middleware.go

go.mod
go.sum
```

## Model Template

```go
package models

import (
    "time"
    "gorm.io/gorm"
)

type {Entity} struct {
    ID          uint           `gorm:"primarykey" json:"id"`
    Name        string         `gorm:"type:varchar(100);not null" json:"name"`
    Description string         `gorm:"type:varchar(500)" json:"description"`
    CreatedAt   time.Time      `json:"created_at"`
    UpdatedAt   time.Time      `json:"updated_at"`
    DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

func ({Entity}) TableName() string {
    return "{entity_table}"
}
```

## DTO Templates

### Request DTO

```go
package dto

type Create{Entity}Request struct {
    Name        string `json:"name" binding:"required,max=100"`
    Description string `json:"description" binding:"max=500"`
}

type Update{Entity}Request struct {
    Name        string `json:"name" binding:"required,max=100"`
    Description string `json:"description" binding:"max=500"`
}
```

### Response DTO

```go
package dto

type {Entity}Response struct {
    ID          uint      `json:"id"`
    Name        string    `json:"name"`
    Description string    `json:"description"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
}

type {Entity}ListResponse struct {
    Items      []*{Entity}Response `json:"items"`
    TotalCount int64              `json:"total_count"`
}
```

## Repository Template

```go
package repository

import (
    "your-project/internal/models"
    "gorm.io/gorm"
)

type {Entity}Repository interface {
    Create(entity *models.{Entity}) error
    FindAll() ([]models.{Entity}, error)
    FindByID(id uint) (*models.{Entity}, error)
    Update(entity *models.{Entity}) error
    Delete(id uint) error
    Count() (int64, error)
}

type {Entity}RepositoryImpl struct {
    db *gorm.DB
}

func New{Entity}Repository(db *gorm.DB) {Entity}Repository {
    return &{Entity}RepositoryImpl{db: db}
}

func (r *{Entity}RepositoryImpl) Create(entity *models.{Entity}) error {
    return r.db.Create(entity).Error
}

func (r *{Entity}RepositoryImpl) FindAll() ([]models.{Entity}, error) {
    var entities []models.{Entity}
    err := r.db.Find(&entities).Error
    return entities, err
}

func (r *{Entity}RepositoryImpl) FindByID(id uint) (*models.{Entity}, error) {
    var entity models.{Entity}
    err := r.db.First(&entity, id).Error
    if err != nil {
        return nil, err
    }
    return &entity, nil
}

func (r *{Entity}RepositoryImpl) Update(entity *models.{Entity}) error {
    return r.db.Save(entity).Error
}

func (r *{Entity}RepositoryImpl) Delete(id uint) error {
    return r.db.Delete(&models.{Entity}{}, id).Error
}

func (r *{Entity}RepositoryImpl) Count() (int64, error) {
    var count int64
    err := r.db.Model(&models.{Entity}{}).Count(&count).Error
    return count, err
}
```

## Service Template

```go
package service

import (
    "errors"
    "your-project/internal/dto"
    "your-project/internal/models"
    "your-project/internal/repository"
)

var Err{Entity}NotFound = errors.New("{entity} not found")

type {Entity}Service interface {
    Create(req *dto.Create{Entity}Request) (*dto.{Entity}Response, error)
    GetAll() (*dto.{Entity}ListResponse, error)
    GetByID(id uint) (*dto.{Entity}Response, error)
    Update(id uint, req *dto.Update{Entity}Request) (*dto.{Entity}Response, error)
    Delete(id uint) error
}

type {Entity}ServiceImpl struct {
    repo repository.{Entity}Repository
}

func New{Entity}Service(repo repository.{Entity}Repository) {Entity}Service {
    return &{Entity}ServiceImpl{repo: repo}
}

func (s *{Entity}ServiceImpl) Create(req *dto.Create{Entity}Request) (*dto.{Entity}Response, error) {
    entity := models.{Entity}{
        Name:        req.Name,
        Description: req.Description,
    }

    if err := s.repo.Create(&entity); err != nil {
        return nil, err
    }

    return &dto.{Entity}Response{
        ID:          entity.ID,
        Name:        entity.Name,
        Description: entity.Description,
        CreatedAt:   entity.CreatedAt,
        UpdatedAt:   entity.UpdatedAt,
    }, nil
}

func (s *{Entity}ServiceImpl) GetAll() (*dto.{Entity}ListResponse, error) {
    entities, err := s.repo.FindAll()
    if err != nil {
        return nil, err
    }

    items := make([]*dto.{Entity}Response, len(entities))
    for i, e := range entities {
        items[i] = &dto.{Entity}Response{
            ID:          e.ID,
            Name:        e.Name,
            Description: e.Description,
            CreatedAt:   e.CreatedAt,
            UpdatedAt:   e.UpdatedAt,
        }
    }

    count, _ := s.repo.Count()

    return &dto.{Entity}ListResponse{
        Items:      items,
        TotalCount: count,
    }, nil
}

func (s *{Entity}ServiceImpl) GetByID(id uint) (*dto.{Entity}Response, error) {
    entity, err := s.repo.FindByID(id)
    if err != nil {
        return nil, Err{Entity}NotFound
    }

    return &dto.{Entity}Response{
        ID:          entity.ID,
        Name:        entity.Name,
        Description: entity.Description,
        CreatedAt:   entity.CreatedAt,
        UpdatedAt:   entity.UpdatedAt,
    }, nil
}

func (s *{Entity}ServiceImpl) Update(id uint, req *dto.Update{Entity}Request) (*dto.{Entity}Response, error) {
    entity, err := s.repo.FindByID(id)
    if err != nil {
        return nil, Err{Entity}NotFound
    }

    entity.Name = req.Name
    entity.Description = req.Description

    if err := s.repo.Update(entity); err != nil {
        return nil, err
    }

    return &dto.{Entity}Response{
        ID:          entity.ID,
        Name:        entity.Name,
        Description: entity.Description,
        CreatedAt:   entity.CreatedAt,
        UpdatedAt:   entity.UpdatedAt,
    }, nil
}

func (s *{Entity}ServiceImpl) Delete(id uint) error {
    _, err := s.repo.FindByID(id)
    if err != nil {
        return Err{Entity}NotFound
    }

    return s.repo.Delete(id)
}
```

## Handler Template

```go
package handler

import (
    "net/http"
    "strconv"
    "your-project/internal/dto"
    "your-project/internal/service"
    "github.com/gin-gonic/gin"
)

type {Entity}Handler interface {
    Create(c *gin.Context)
    GetAll(c *gin.Context)
    GetByID(c *gin.Context)
    Update(c *gin.Context)
    Delete(c *gin.Context)
}

type {Entity}HandlerImpl struct {
    service service.{Entity}Service
}

func New{Entity}Handler(service service.{Entity}Service) {Entity}Handler {
    return &{Entity}HandlerImpl{service: service}
}

func (h *{Entity}HandlerImpl) Create(c *gin.Context) {
    var req dto.Create{Entity}Request
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    resp, err := h.service.Create(&req)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, resp)
}

func (h *{Entity}HandlerImpl) GetAll(c *gin.Context) {
    resp, err := h.service.GetAll()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, resp)
}

func (h *{Entity}HandlerImpl) GetByID(c *gin.Context) {
    id, err := strconv.ParseUint(c.Param("id"), 10, 32)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
        return
    }

    resp, err := h.service.GetByID(uint(id))
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, resp)
}

func (h *{Entity}HandlerImpl) Update(c *gin.Context) {
    id, err := strconv.ParseUint(c.Param("id"), 10, 32)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
        return
    }

    var req dto.Update{Entity}Request
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    resp, err := h.service.Update(uint(id), &req)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, resp)
}

func (h *{Entity}HandlerImpl) Delete(c *gin.Context) {
    id, err := strconv.ParseUint(c.Param("id"), 10, 32)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
        return
    }

    if err := h.service.Delete(uint(id)); err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusNoContent, nil)
}
```

## Router Setup (main.go)

```go
package main

import (
    "log"
    "your-project/internal/config"
    "your-project/internal/handler"
    "your-project/internal/repository"
    "your-project/internal/service"

    "github.com/gin-gonic/gin"
    "gorm.io/driver/mysql"
    "gorm.io/gorm"
)

func main() {
    // Initialize config
    cfg := config.Load()

    // Initialize database
    db, err := gorm.Open(mysql.Open(cfg.DSN()), &gorm.Config{})
    if err != nil {
        log.Fatal(err)
    }

    // Migrate database
    db.AutoMigrate(&models.{Entity}{})

    // Initialize layers
    {Entity}Repo := repository.New{Entity}Repository(db)
    {Entity}Svc := service.New{Entity}Service({Entity}Repo)
    {Entity}Handler := handler.New{Entity}Handler({Entity}Svc)

    // Setup router
    r := gin.Default()

    // Routes
    api := r.Group("/api")
    {
        entities := api.Group("/{entity}")
        {
            entities.POST("", {Entity}Handler.Create)
            entities.GET("", {Entity}Handler.GetAll)
            entities.GET("/:id", {Entity}Handler.GetByID)
            entities.PUT("/:id", {Entity}Handler.Update)
            entities.DELETE("/:id", {Entity}Handler.Delete)
        }
    }

    r.Run(":8080")
}
```

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/{entity} | Create new entity |
| GET | /api/{entity} | List all entities |
| GET | /api/{entity}/:id | Get entity by ID |
| PUT | /api/{entity}/:id | Update entity |
| DELETE | /api/{entity}/:id | Delete entity |

## Acceptance Criteria

1. All CRUD endpoints return correct HTTP status codes
2. Validation errors return 400 Bad Request with error details
3. Non-existent entities return 404 Not Found
4. Successful operations return the created/updated entity
5. Delete performs soft delete using GORM's Delete
6. Code follows Go naming conventions (PascalCase for exports, camelCase for locals)
7. Unit tests cover service layer methods

## Go Modules (go.mod)

```go
module your-project

go 1.21

require (
    github.com/gin-gonic/gin v1.9.1
    gorm.io/driver/mysql v1.5.2
    gorm.io/gorm v1.25.5
)
```
