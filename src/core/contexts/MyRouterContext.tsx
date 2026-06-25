import type { AuthContextType } from '@/features/auth/contexts/AuthContext';
import { QueryClient } from '@tanstack/react-query';


export interface MyRouterContext {
    queryClient: QueryClient;
    auth: AuthContextType;
}