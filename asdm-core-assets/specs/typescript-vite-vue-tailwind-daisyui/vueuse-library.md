# VueUse Library

Encourages leveraging VueUse functions throughout the project to enhance reactivity and performance.

## Guidelines

- Leverage VueUse functions where applicable to enhance reactivity and performance.

## File Patterns

**Applies to:** `src/**/*.*`

## Best Practices

### Installation

```bash
npm install @vueuse/core
npm install @vueuse/components  # Optional component versions
```

### Common VueUse Functions

#### State Management

```typescript
import { useStorage, useToggle, useCounter } from '@vueuse/core'

// Persistent state in localStorage
const user = useStorage('user', { name: '', email: '' })

// Toggle state
const [value, toggle] = useToggle(false)

// Counter with bounds
const { count, inc, dec, reset } = useCounter(0, { min: 0, max: 10 })
```

#### Browser APIs

```typescript
import {
  useWindowSize,
  useMouse,
  useScroll,
  useIntersectionObserver,
} from '@vueuse/core'

// Window size
const { width, height } = useWindowSize()

// Mouse position
const { x, y } = useMouse()

// Scroll position
const { x: scrollX, y: scrollY, isScrolling } = useScroll(window)

// Intersection observer for lazy loading
const target = ref<HTMLElement | null>(null)
const isVisible = ref(false)

useIntersectionObserver(
  target,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      isVisible.value = true
    }
  },
  { threshold: 0.5 }
)
```

#### Event Handling

```typescript
import {
  useEventListener,
  onClickOutside,
  useDebounceFn,
  useThrottleFn,
} from '@vueuse/core'

// Event listener with auto-cleanup
useEventListener(window, 'resize', () => {
  console.log('Window resized')
})

// Click outside detection
const dropdown = ref<HTMLElement | null>(null)
onClickOutside(dropdown, () => {
  // Close dropdown
})

// Debounced function
const debouncedSearch = useDebounceFn((query: string) => {
  // Perform search
}, 300)

// Throttled function
const throttledScroll = useThrottleFn(() => {
  // Handle scroll
}, 100)
```

#### Network & Fetching

```typescript
import {
  useFetch,
  useAxios,
  useOnline,
  useNetwork,
} from '@vueuse/core'

// useFetch
const { data, error, isFetching } = useFetch('/api/users').json()

// Online status
const isOnline = useOnline()

// Network information
const { isSupported, type, effectiveType } = useNetwork()
```

#### DOM Utilities

```typescript
import {
  useElementSize,
  useElementBounding,
  useBreakpoints,
} from '@vueuse/core'

// Element size
const element = ref<HTMLElement | null>(null)
const { width, height } = useElementSize(element)

// Element bounding
const { left, top, right, bottom, width, height } = useElementBounding(element)

// Tailwind breakpoints
const breakpoints = useBreakpoints({
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
})

const isMobile = breakpoints.smaller('md')
const isDesktop = breakpoints.greater('md')
```

#### Sensors

```typescript
import {
  useBattery,
  useGeolocation,
  useDark,
  usePreferredDark,
} from '@vueuse/core'

// Battery status
const { charging, level, chargingTime } = useBattery()

// Geolocation
const { coords, locatedAt, error } = useGeolocation()

// Dark mode
const isDark = useDark({
  selector: 'html',
  attribute: 'data-theme',
  valueDark: 'dark',
  valueLight: 'light',
})

const toggleDark = useToggle(isDark)

// Check system preference
const prefersDark = usePreferredDark()
```

### VueUse Components

```vue
<script setup lang="ts">
import { UseIntersectionObserver, UseWindowSize } from '@vueuse/components'
</script>

<template>
  <!-- Intersection Observer Component -->
  <UseIntersectionObserver v-slot="{ isIntersecting }">
    <div :class="{ 'animate-fade-in': isIntersecting }">
      Content that animates when visible
    </div>
  </UseIntersectionObserver>

  <!-- Window Size Component -->
  <UseWindowSize v-slot="{ width, height }">
    <div>Window: {{ width }}x{{ height }}</div>
  </UseWindowSize>
</template>
```

### Performance Tips

```typescript
import { watchOnce, watchPausable, until } from '@vueuse/core'

// Watch only once
watchOnce(source, () => {
  console.log('This runs only once')
})

// Pausable watcher
const { pause, resume, isActive } = watchPausable(source, () => {
  // Handle change
})

// Wait for condition
await until(ref(true)).toBe(true)
```
