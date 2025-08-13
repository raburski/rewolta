# Lib Directory - Utilities and Hooks

This directory contains reusable utilities and custom hooks for the application.

## Fetcher (`fetcher.ts`)

A generic HTTP client that provides consistent error handling and can be used with SWR or standalone.

### Basic Usage

```typescript
import { fetcher } from '@/lib/fetcher'

// GET request
const data = await fetcher('/api/users')

// POST request
const newUser = await fetcher('/api/users', {
  method: 'POST',
  body: { name: 'John', email: 'john@example.com' }
})

// Custom headers
const data = await fetcher('/api/protected', {
  headers: {
    'Authorization': 'Bearer token'
  }
})
```

### Convenience Functions

```typescript
import { getFetcher, postFetcher, putFetcher, deleteFetcher } from '@/lib/fetcher'

// GET
const data = await getFetcher('/api/users')

// POST
const newUser = await postFetcher('/api/users', { name: 'John' })

// PUT
const updatedUser = await putFetcher('/api/users/1', { name: 'Jane' })

// DELETE
await deleteFetcher('/api/users/1')
```

### Error Handling

All fetcher functions throw errors with the format: `"Failed to fetch {url}"`

```typescript
try {
  const data = await fetcher('/api/users')
} catch (error) {
  console.error(error.message) // "Failed to fetch /api/users"
}
```

## API Structure

The application uses a unified `/api/user` structure for all user-related endpoints:

- `/api/user` - API information and available endpoints
- `/api/user/credits` - User credits management
- `/api/user/images/[productId]` - User image history

## SWR Integration

The fetcher is automatically configured as the default fetcher in `SWRProvider`, so you can use SWR hooks without specifying a fetcher:

```typescript
import useSWR from 'swr'

// Uses the default fetcher automatically
const { data, error, isLoading } = useSWR('/api/user/credits')
```

### Custom Hooks

#### `useUserCredits` (`hooks/useUserCredits.ts`)

Fetches user credits with automatic authentication handling.

```typescript
import { useUserCredits } from '@/lib/hooks/useUserCredits'

function MyComponent() {
  const { credits, isLoading, hasError, mutate } = useUserCredits(isAuthenticated)
  
  return (
    <div>
      Credits: {isLoading ? 'Loading...' : credits}
      <button onClick={() => mutate()}>Refresh</button>
    </div>
  )
}
```

#### `useUserImages` (`hooks/useUserImages.ts`)

Fetches user image history with automatic authentication handling.

```typescript
import { useUserImages } from '@/lib/hooks/useUserImages'

function ImageHistory({ productId }: { productId: string }) {
  const { images, isLoading, hasError, error, mutate } = useUserImages(productId, isAuthenticated)
  
  return (
    <div>
      {isLoading ? 'Loading...' : (
        <div>
          {images.map(image => (
            <img key={image.id} src={image.imageUrl} alt="Generated" />
          ))}
          <button onClick={() => mutate()}>Refresh</button>
        </div>
      )}
    </div>
  )
}
```

## Best Practices

1. **Use SWR for data fetching**: Leverage caching, revalidation, and error handling
2. **Use convenience functions**: `getFetcher`, `postFetcher`, etc. for common HTTP methods
3. **Handle errors consistently**: All fetcher functions throw errors with the same format
4. **Type your responses**: Use TypeScript interfaces for API response types
5. **Use conditional fetching**: Only fetch when needed (e.g., when authenticated)

## Example Usage Patterns

### Basic Data Fetching
```typescript
const { data, error, isLoading } = useSWR('/api/data')
```

### Conditional Fetching
```typescript
const { data, error, isLoading } = useSWR(
  userId ? `/api/users/${userId}` : null
)
```

### Custom Fetcher
```typescript
const { data } = useSWR('/api/protected', (url) => 
  fetcher(url, { headers: { 'Authorization': `Bearer ${token}` } })
)
```

### Mutations
```typescript
const { mutate } = useSWR('/api/users')

const updateUser = async (id: string, data: any) => {
  await putFetcher(`/api/users/${id}`, data)
  mutate() // Revalidate the cache
}
``` 