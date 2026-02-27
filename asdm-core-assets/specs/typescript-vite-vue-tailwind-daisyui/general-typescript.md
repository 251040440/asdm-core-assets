# General TypeScript Guidelines

Applies general TypeScript best practices, including using interfaces, avoiding enums, and using functional components.

## Guidelines

- Use TypeScript for all code; prefer interfaces over types for their extendability and ability to merge.
- Avoid enums; use maps instead for better type safety and flexibility.
- Use functional components with TypeScript interfaces.

## File Patterns

**Applies to:** `**/*.ts`

## Best Practices

### Interfaces vs Types

```typescript
// Good - interfaces are extendable and mergeable
interface User {
  id: string
  name: string
  email: string
}

interface UserWithRole extends User {
  role: string
}

// Avoid - types are less flexible
type User = {
  id: string
  name: string
  email: string
}
```

### Avoid Enums

```typescript
// Good - use maps for better flexibility
const Status = {
  PENDING: 'pending',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const

type StatusValue = typeof Status[keyof typeof Status]

// Avoid - enums add unnecessary complexity
enum Status {
  Pending = 'pending',
  Active = 'active',
  Inactive = 'inactive',
}
```

### Functional Components with Interfaces

```typescript
// Good - functional component with interface
interface ButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

const Button = ({ label, onClick, disabled = false }: ButtonProps) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  )
}
```

### Interface Declaration Merging

```typescript
// Interfaces can be merged - useful for extending third-party types
interface User {
  name: string
}

interface User {
  email: string
}

// Result: User has both name and email
const user: User = {
  name: 'John',
  email: 'john@example.com',
}
```
