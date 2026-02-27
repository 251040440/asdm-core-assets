# Vue.js Component Guidelines

Defines the style and structure for Vue.js components, including naming conventions, Composition API usage, and UI library preferences.

## Guidelines

- Use lowercase with dashes for directories (e.g., components/auth-wizard).
- Favor named exports for functions.
- Always use the Vue Composition API script setup style.
- Use DaisyUI, and Tailwind for components and styling.
- Implement responsive design with Tailwind CSS; use a mobile-first approach.

## File Patterns

**Applies to:** `src/components/**/*.vue`

## Best Practices

### Directory Structure

```
components/
  auth-wizard/
    AuthWizard.vue
    AuthWizardForm.vue
    AuthWizardInput.vue
  user-profile/
    UserProfile.vue
    UserProfileCard.vue
```

### Script Setup Style

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Props with TypeScript interface
interface Props {
  title: string
  initialCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialCount: 0,
})

// Emits with TypeScript
interface Emits {
  (e: 'update', value: number): void
  (e: 'submit'): void
}

const emit = defineEmits<Emits>()

// Reactive state
const count = ref(props.initialCount)

// Computed property
const doubledCount = computed(() => count.value * 2)

// Methods
const increment = () => {
  count.value++
  emit('update', count.value)
}

// Lifecycle
onMounted(() => {
  console.log('Component mounted')
})
</script>

<template>
  <div class="card">
    <h2 class="text-xl font-bold">{{ title }}</h2>
    <p>Count: {{ count }}</p>
    <p>Doubled: {{ doubledCount }}</p>
    <button
      class="btn btn-primary"
      @click="increment"
    >
      Increment
    </button>
  </div>
</template>
```

### Named Exports for Composables

```typescript
// composables/useCounter.ts
import { ref, computed } from 'vue'

export function useCounter(initialValue: number = 0) {
  const count = ref(initialValue)
  const doubled = computed(() => count.value * 2)

  const increment = () => count.value++
  const decrement = () => count.value--
  const reset = () => (count.value = initialValue)

  return {
    count,
    doubled,
    increment,
    decrement,
    reset,
  }
}
```

### DaisyUI and Tailwind Usage

```vue
<template>
  <!-- Mobile-first responsive design -->
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title text-sm md:text-base lg:text-lg">
        Responsive Title
      </h2>

      <!-- DaisyUI button with responsive sizing -->
      <button class="btn btn-primary btn-sm md:btn-md lg:btn-lg">
        Click Me
      </button>

      <!-- Tailwind responsive grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="p-4 bg-base-200 rounded-lg">Item 1</div>
        <div class="p-4 bg-base-200 rounded-lg">Item 2</div>
        <div class="p-4 bg-base-200 rounded-lg">Item 3</div>
      </div>
    </div>
  </div>
</template>
```

### Form Components

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

interface FormData {
  email: string
  password: string
}

const formData = ref<FormData>({
  email: '',
  password: '',
})

const isValid = computed(() => {
  return formData.value.email.includes('@') && formData.value.password.length >= 8
})

const handleSubmit = () => {
  if (isValid.value) {
    // Submit form
  }
}
</script>

<template>
  <form class="form-control w-full max-w-xs" @submit.prevent="handleSubmit">
    <label class="label">
      <span class="label-text">Email</span>
    </label>
    <input
      v-model="formData.email"
      type="email"
      placeholder="email@example.com"
      class="input input-bordered w-full max-w-xs"
    />

    <label class="label">
      <span class="label-text">Password</span>
    </label>
    <input
      v-model="formData.password"
      type="password"
      placeholder="********"
      class="input input-bordered w-full max-w-xs"
    />

    <button
      type="submit"
      class="btn btn-primary mt-4"
      :disabled="!isValid"
    >
      Submit
    </button>
  </form>
</template>
```

### Slot Usage

```vue
<!-- Card.vue -->
<script setup lang="ts">
interface Props {
  title: string
}

defineProps<Props>()
</script>

<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">{{ title }}</h2>
      <slot name="content" />
      <div class="card-actions justify-end">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<!-- Usage -->
<Card title="My Card">
  <template #content>
    <p>This is the card content</p>
  </template>
  <template #actions>
    <button class="btn btn-primary">Action</button>
  </template>
</Card>
```
