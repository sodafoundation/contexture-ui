import axios from 'axios';

const API_URL = 'http://20.205.160.206:8003/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getSessions = async () => {
    const response = await api.get('/sessions');
    return response.data;
};

export const createSession = async (name) => {
    const response = await api.post('/sessions', { name });
    return response.data;
};

export const deleteSession = async (id) => {
    const response = await api.delete(`/sessions/${id}`);
    return response.data;
};

export const updateSession = async (id, name) => {
    const response = await api.put(`/sessions/${id}`, { name });
    return response.data;
};

export const getHistory = async (sessionId) => {
    const response = await api.get(`/history/${sessionId}`);
    return response.data;
};

export const sendMessage = async (sessionId, query) => {
    const response = await api.post('/chat', { session_id: sessionId, query });
    return response.data;
};

export const getConfig = async () => {
    const response = await api.get('/config');
    return response.data;
};

export default api;
