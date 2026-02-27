# Code Style and Structure

Enforces consistent code style and structure across the project, including concise code, functional programming, and descriptive variable names.

## Guidelines

- Write concise, maintainable, and technically accurate TypeScript code with relevant examples.
- Use functional and declarative programming patterns; avoid classes.
- Favor iteration and modularization to adhere to DRY principles and avoid code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
- Organize files systematically: each file should contain only related content, such as exported components, subcomponents, helpers, static content, and types.

## File Patterns

**Applies to:** `**/*.{ts,vue}`

## Best Practices

### Variable Naming

```typescript
// Good - use auxiliary verbs for booleans
const isLoading = ref(false)
const hasError = ref(false)
const canSubmit = computed(() => formIsValid.value)

// Avoid
const loading = ref(false)
const error = ref(false)
```

### File Organization

```
components/
  auth-wizard/
    AuthWizard.vue        # Main component
    AuthWizardForm.vue    # Subcomponent
    auth-wizard-types.ts  # Types
    auth-wizard-helpers.ts # Helper functions
```

### DRY Principles

```typescript
// Good - modular and reusable
function formatDate(date: Date, format: string): string {
  // Implementation
}

// Avoid - duplicated logic
function formatShortDate(date: Date): string {
  // Duplicated logic
}
function formatLongDate(date: Date): string {
  // Duplicated logic
}
```
