import api from '../services/api';

export const checkApiHealth = async () => {
    try {
        console.log('Checking API health...');
        const response = await api.get('/health', {
            timeout: 5000,
            // Add retry logic
            retry: 3,
            retryDelay: 1000
        });
        
        // Add more detailed health check
        const dbStatus = response.data?.database === 'connected';
        const serverStatus = response.data?.status === 'ok';
        
        return {
            isHealthy: response.data.success && dbStatus && serverStatus,
            error: null,
            details: {
                ...response.data,
                dbConnected: dbStatus,
                serverRunning: serverStatus
            }
        };
    } catch (error) {
        console.error('Health check failed:', error);
        return {
            isHealthy: false,
            error: `Server connection failed: ${error.response?.status === 404 ? 'Endpoint not found' : error.message}`,
            details: {
                error: error.message,
                status: error.response?.status,
                data: error.response?.data
            }
        };
    }
};
