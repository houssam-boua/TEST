import {
    api,
  } from './apiConnection';

export const getUsers = async () => {
    try {
        const response = await api.get('/api/users');
        console.log('getUsers response', response);
        return response.data;
    }catch (error) {
        console.error('Error fetching users:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch users.');
    }
}
