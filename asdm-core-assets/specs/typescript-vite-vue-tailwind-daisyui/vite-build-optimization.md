# Vite Build Optimization

Outlines optimization strategies for Vite build processes, including chunking, code splitting, and image optimization techniques.

## Guidelines

- Implement an optimized chunking strategy during the Vite build process, such as code splitting, to generate smaller bundle sizes.
- Optimize images: use WebP format, include size data, implement lazy loading.

## File Patterns

**Applies to:** `vite.config.ts`

## Best Practices

### Manual Chunk Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['daisyui', 'tailwindcss'],
          'utils-vendor': ['vueuse', 'axios'],
        },
      },
    },
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
})
```

### Dynamic Imports for Code Splitting

```typescript
// Good - dynamic imports for route-based code splitting
const routes = [
  {
    path: '/dashboard',
    component: () => import('@/views/Dashboard.vue'),
  },
  {
    path: '/settings',
    component: () => import('@/views/Settings.vue'),
  },
]
```

### Chunk Size Analysis

```typescript
// vite.config.ts - Add build analyzer
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    vue(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
})
```

### Asset Optimization

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // Asset file naming
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.')
          const ext = info?.[info.length - 1]
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(assetInfo.name || '')) {
            return 'images/[name]-[hash][extname]'
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
            return 'fonts/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
  },
})
```

### Preload Critical Assets

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    modulePreload: {
      polyfill: true,
    },
  },
})
```

### Environment-Based Configuration

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => ({
  build: {
    sourcemap: mode === 'development',
    minify: mode === 'production' ? 'terser' : false,
  },
}))
```
