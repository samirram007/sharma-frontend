import type { AuthContextType } from '@/features/auth/contexts/AuthContext';
import type { QueryClient } from '@tanstack/react-query';


export interface MyRouterContext {
    queryClient: QueryClient;
    auth: AuthContextType;
}