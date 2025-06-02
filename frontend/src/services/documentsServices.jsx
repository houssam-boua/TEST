import { api } from "./apiConnection";

export const getDocuments = async () => {
    try {
        const response = await api.get('/api/documents');
        console.log('getDocuments response', response);
        return response.data;
    } catch (error) {
        console.error('Error fetching documents:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch documents.');
    }
}

export const createDocument = async (documentData) => {
    try {
        const formData = new FormData();
        for (const key in documentData) {
            formData.append(key, documentData[key]);
        }
        const response = await api.post('/api/documents', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        console.log('createDocument response', response);
        return response.data;
    } catch (error) {
        console.error('Error creating document:', error);
        throw new Error(error.response?.data?.message || 'Failed to create document.');
    }
}