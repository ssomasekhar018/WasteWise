# WasteWise Frontend

## Environment Setup

Create a `.env` file in the frontend root directory with the following variables:

```env
VITE_APP_API_URL=http://localhost:5000/api
VITE_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## API Utility

The application uses a centralized API utility for making HTTP requests. This utility is located at `src/utils/api.js` and automatically:

- Uses the base URL from environment variables
- Sets the Content-Type header
- Adds authentication tokens to requests

Example usage:

```javascript
import api from '../utils/api';

// GET request
const fetchData = async () => {
  try {
    const response = await api.get('/users/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

// POST request
const createData = async (data) => {
  try {
    const response = await api.post('/complaints', data);
    return response.data;
  } catch (error) {
    console.error('Error creating data:', error);
  }
};
```

## Development

To start the development server:

```bash
npm run dev
```

## Build

To build for production:

```bash
npm run build
```