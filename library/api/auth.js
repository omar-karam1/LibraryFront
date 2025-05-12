// 📂 api/auth.api.js
const API_BASE_URL = "http://projectlibraryapi.runasp.net/api";

export const AuthAPI = {
    register: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/User/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                ...userData,
                birthDate: new Date(userData.birthDate).toISOString()
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'فشل في عملية التسجيل');
        }

        return await response.json();
    }
};