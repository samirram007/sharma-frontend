import { redirect } from '@tanstack/react-router';
import { useAuth } from '../features/auth/contexts/AuthContext'; // or use session storage
import axiosClient from './axios-client';
import { toast } from 'sonner';

export async function protectedLoader() {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        throw redirect({
            to: '/sign-in',
            search: { redirect: window.location.pathname }, // optional: after-login redirect
        })
    }
    return null
}

export function clean_logout() {
    axiosClient.post('/auth/clean_logout')
        .then((response) => {
            console.log('Logout successful:', response.data);
            toast.message('All cookies cleared. Please login again.');
           // document.location.href = '/sign-in';
        })
        .catch((error) => {
            console.error('Error during logout:', error);
        });
    //localStorage.removeItem('auth_token');
    // localStorage.removeItem('user_data');
}
export function clearAllCookies() {
    document.cookie.split(';').forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
        document.cookie =
            name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    });
}