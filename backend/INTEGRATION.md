# Frontend-Backend Integration Guide

## Setup

1. **Backend**: Ensure the backend is running on `http://localhost:3000`
2. **Frontend**: The API client is configured to use `VITE_API_URL` environment variable

## Environment Variables

Add to your frontend `.env` file:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

For production:
```env
VITE_API_URL=https://api.zaminat.mgx.world/api/v1
```

## Usage Examples

### Authentication

```typescript
import { apiClient } from '@/lib/api-client';

// Register
const registerResponse = await apiClient.register({
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe',
});

// Login
const loginResponse = await apiClient.login({
  email: 'user@example.com',
  password: 'password123',
});

// Phone login with OTP
const otpResponse = await apiClient.login({
  phone: '+998901234567',
});
// Then verify OTP
const verifyResponse = await apiClient.verifyOtp('+998901234567', '123456');

// Get current user
const user = await apiClient.getCurrentUser();

// Logout
apiClient.logout();
```

### Projects & Voting

```typescript
// Get all projects
const projects = await apiClient.getProjects('active');

// Get project details
const project = await apiClient.getProject('project-id');

// Vote for project
await apiClient.voteForProject('project-id');

// Donate to project
await apiClient.donateToProject('project-id', 50000, 'UZS');
```

### Events

```typescript
// Get all events
const events = await apiClient.getEvents('upcoming');

// Get event details
const event = await apiClient.getEvent('event-id');

// Join event
await apiClient.joinEvent('event-id');
```

### Locations

```typescript
// Get all locations
const locations = await apiClient.getLocations({ type: 'plastic' });

// Get nearby locations
const nearby = await apiClient.getNearbyLocations(41.2995, 69.2401, 5);

// Get location details
const location = await apiClient.getLocation('location-id');
```

### Shop

```typescript
// Get products
const products = await apiClient.getProducts('furniture');

// Get product details
const product = await apiClient.getProduct('product-id');
```

### Stories

```typescript
// Get stories
const stories = await apiClient.getStories('success');

// Get story details
const story = await apiClient.getStory('story-id');
```

### Leaderboard

```typescript
// Get leaderboard
const leaderboard = await apiClient.getLeaderboard('all', 100);
```

### File Upload

```typescript
// Upload image
const file = event.target.files[0];
const uploadResult = await apiClient.uploadImage(file);
console.log(uploadResult.url); // Use this URL in your app
```

## React Query Integration

For better state management, use React Query:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// Query projects
function useProjects(status?: string) {
  return useQuery({
    queryKey: ['projects', status],
    queryFn: () => apiClient.getProjects(status),
  });
}

// Mutate vote
function useVoteProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (projectId: string) => apiClient.voteForProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
```

## Error Handling

```typescript
try {
  const projects = await apiClient.getProjects();
} catch (error) {
  if (error.message.includes('401')) {
    // Unauthorized - redirect to login
    router.push('/login');
  } else {
    // Show error message
    toast.error(error.message);
  }
}
```

## Token Management

The API client automatically:
- Stores tokens in localStorage
- Adds Authorization header to requests
- Refreshes tokens on 401 errors
- Clears tokens on logout

You don't need to manually manage tokens in most cases.

