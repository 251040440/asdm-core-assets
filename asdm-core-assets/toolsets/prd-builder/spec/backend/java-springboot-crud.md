# Java Spring Boot CRUD Specification

This document provides a template and guidelines for generating Java Spring Boot CRUD operations.

## Tech Stack

| Component | Version | Notes |
|-----------|---------|-------|
| Java | 17+ | LTS version |
| Spring Boot | 3.x | Latest stable |
| Spring Data JPA | - | ORM framework |
| H2/MySQL | - | Database (configurable) |
| Maven | 3.8+ | Build tool |

## Project Structure

```
src/main/java/com/example/{entity}/
├── {Entity}Controller.java      # REST endpoints
├── {Entity}Service.java          # Business logic
├── {Entity}Repository.java      # Data access
├── {Entity}.java               # Entity class
├── {Entity}DTO.java            # Data transfer object
├── {Entity}Mapper.java          # DTO mapper
└── exception/
    ├── {Entity}NotFoundException.java
    └── GlobalExceptionHandler.java

src/main/resources/
├── application.yml              # Configuration
└── data.sql                    # Initial data (optional)

src/test/java/com/example/{entity}/
├── {Entity}ServiceTest.java     # Unit tests
└── {Entity}ControllerTest.java  # Integration tests
```

## Entity Class Template

```java
package com.example.{entity};

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "{entity_table}")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class {Entity} {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

## Repository Template

```java
package com.example.{entity};

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface {Entity}Repository extends JpaRepository<{Entity}, Long> {

    Optional<{Entity}> findByName(String name);

    List<{Entity}> findByNameContaining(String name);

    @Query("SELECT e FROM {Entity} e WHERE e.active = true")
    List<{Entity}> findAllActive();
}
```

## Service Template

```java
package com.example.{entity};

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class {Entity}Service {

    private final {Entity}Repository repository;

    @Transactional(readOnly = true)
    public List<{Entity}> findAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public {Entity} findById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new {Entity}NotFoundException(id));
    }

    @Transactional
    public {Entity} create({Entity}DTO dto) {
        {Entity} entity = {Entity}Mapper.toEntity(dto);
        return repository.save(entity);
    }

    @Transactional
    public {Entity} update(Long id, {Entity}DTO dto) {
        {Entity} existing = findById(id);
        {Entity}Mapper.updateEntity(existing, dto);
        return repository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        {Entity} entity = findById(id);
        repository.delete(entity);
    }
}
```

## Controller Template

```java
package com.example.{entity};

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/{entity-path}")
@RequiredArgsConstructor
public class {Entity}Controller {

    private final {Entity}Service service;

    @GetMapping
    public ResponseEntity<List<{Entity}>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<{Entity}> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<{Entity}> create(@RequestBody {Entity}DTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<{Entity}> update(
            @PathVariable Long id,
            @RequestBody {Entity}DTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

## DTO Template

```java
package com.example.{entity};

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class {Entity}DTO {
    private Long id;
    private String name;
    private String description;
}
```

## Mapper Template

```java
package com.example.{entity};

import org.mapstruct.*;
import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface {Entity}Mapper {

    {Entity} toEntity({Entity}DTO dto);

    {Entity}DTO toDTO({Entity} entity);

    List<{Entity}DTO> toDTOList(List<{Entity}> entities);

    @Mapping(target = "id", ignore = true)
    void updateEntity({Entity} entity, {Entity}DTO dto);
}
```

## Validation Rules

- Entity name must be unique
- Required fields cannot be null or empty
- Date fields are auto-managed
- Soft delete recommended (use `active` flag instead of hard delete)

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/{entity-path} | List all entities |
| GET | /api/{entity-path}/{id} | Get entity by ID |
| POST | /api/{entity-path} | Create new entity |
| PUT | /api/{entity-path}/{id} | Update entity |
| DELETE | /api/{entity-path}/{id} | Delete entity |

## Acceptance Criteria

1. All CRUD endpoints return correct HTTP status codes
2. Validation errors return 400 Bad Request with error details
3. Non-existent entities return 404 Not Found
4. Successful operations return the created/updated entity
5. Delete operations return 204 No Content
6. Unit tests cover service layer methods
7. Code follows Java naming conventions and Spring Boot best practices

## Dependencies (pom.xml)

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
    <dependency>
        <groupId>org.mapstruct</groupId>
        <artifactId>mapstruct</artifactId>
        <version>1.5.5.Final</version>
    </dependency>
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```
