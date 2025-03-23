import axios from 'axios';

const api = axios.create({
    baseURL: process.env.VITE_URL,  // Make sure this matches your server URL
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: false
});

// Update the getImageUrl method
api.getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // Handle both full URLs and relative paths
    if (imagePath.startsWith('http')) return imagePath;
    // Remove any leading slashes and combine with baseURL
    const cleanPath = imagePath.replace(/^\/+/, '');
    const fullUrl = `${api.defaults.baseURL}/${cleanPath}`;
    console.log('Constructed image URL:', fullUrl);
    return fullUrl;
};

api.interceptors.request.use(config => {
    // Add API version prefix for non-health endpoints
    if (!config.url?.includes('/health')) {
        config.url = `/api/v1${config.url}`;
    }
    
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('API Request:', {
        url: `${config.baseURL}${config.url}`,
        method: config.method,
        data: config.data ? {...config.data, password: '[REDACTED]'} : undefined
    });
    return config;
}, error => {
    console.error('Request error:', error);
    return Promise.reject(error);
});

api.interceptors.response.use(
    response => {
        console.log('API Response:', {
            url: response.config.url,
            data: response.data
        });
        return response;
    },
    error => {
        console.error('API Error:', {
            url: error.config?.url,
            message: error.message,
            response: error.response?.data
        });
        return Promise.reject(error);
    }
);

export default api;