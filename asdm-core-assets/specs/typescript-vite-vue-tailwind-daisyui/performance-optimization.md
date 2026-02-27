# Performance Optimization

General rule for performance optimization that includes lazy loading, image optimization, and Web Vitals.

## Guidelines

- Implement lazy loading for non-critical components.
- Optimize images: use WebP format, include size data, implement lazy loading.
- Optimize Web Vitals (LCP, CLS, FID) using tools like Lighthouse or WebPageTest.

## File Patterns

**Applies to:** `src/**/*.*`

## Best Practices

### Lazy Loading Components

```typescript
// Good - lazy load non-critical components
const HeavyChart = defineAsyncComponent(() =>
  import('@/components/HeavyChart.vue')
)

// Wrap in Suspense for better UX
<template>
  <Suspense>
    <template #default>
      <HeavyChart />
    </template>
    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>
```

### Image Optimization

```vue
<template>
  <!-- Good - WebP format with lazy loading -->
  <img
    src="/images/hero.webp"
    width="800"
    height="600"
    loading="lazy"
    alt="Hero image"
  />

  <!-- Use picture element for fallback -->
  <picture>
    <source srcset="/images/hero.webp" type="image/webp" />
    <source srcset="/images/hero.jpg" type="image/jpeg" />
    <img src="/images/hero.jpg" width="800" height="600" alt="Hero image" />
  </picture>
</template>
```

### Web Vitals Optimization

#### Largest Contentful Paint (LCP)

- Optimize critical rendering path
- Preload important resources
- Use CDN for faster delivery

```html
<!-- Preload critical resources -->
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/images/hero.webp" as="image" />
```

#### Cumulative Layout Shift (CLS)

- Always include width and height attributes on images
- Reserve space for dynamic content
- Avoid inserting content above existing content

```vue
<template>
  <!-- Reserve space for images -->
  <div class="aspect-video">
    <img
      src="/images/hero.webp"
      width="800"
      height="450"
      alt="Hero image"
    />
  </div>
</template>
```

#### First Input Delay (FID)

- Break up long tasks
- Use web workers for heavy computations
- Minimize main thread work

```typescript
// Use requestIdleCallback for non-critical work
requestIdleCallback(() => {
  // Non-critical analytics or logging
})
```

### Performance Monitoring

```typescript
// Use Performance API to measure custom metrics
const startTime = performance.now()
// ... some operation
const endTime = performance.now()
console.log(`Operation took ${endTime - startTime}ms`)
```
