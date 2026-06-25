// src/context/AuthContext.tsx
import type { UserFiscalYear } from '@/features/modules/user_fiscal_year/data/schema';
import { useQueryClient } from '@tanstack/react-query';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { fetchUserProfileService, loginService, logoutService } from '../services/apis';
import type { UserWithRole } from '../data/schema';
import type { Permission } from '@/features/modules/permission/data/schema';
import type { Role } from '@/features/modules/role/data/schema';
export type LoginProps = {
    email: string;
    password: string;
}

export type PeriodType = {
    startDate: Date | null;
    endDate: Date | null;
}
export interface AuthContextType {
    user: UserWithRole | null;
    userFiscalYear: UserFiscalYear | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (props: LoginProps) => Promise<void>;
    logout: () => Promise<void>;
    fetchProfile: () => Promise<void>;
    permissions: string[];
    period: PeriodType | null;
    setPeriod: (period: PeriodType | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    // const navigate = useNavigate();
    // const [isAuthenticated, setIsAuthenticated] = useState(true)
    const [user, setUser] = useState<UserWithRole | null>(null);
    const [userFiscalYear, setUserFiscalYear] = useState<UserFiscalYear | null>(null);
    const [period, setPeriod] = useState<PeriodType | null>(null);
    const [permissions, setpermissions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true)
    const queryClient = useQueryClient();
    const fetchProfile = async () => {
        setIsLoading(true);
        // check cookie key "token" is set  else redirect to login


        try {
            // console.log('Fetching profile...');
            const data = await fetchUserProfileService();
            flushSync(() => {
                //console.log("userProfileData", data?.data)
                setUser(data?.data);
                setUserFiscalYear(data?.data?.userFiscalYear || null);

                setPeriod(data?.data?.userFiscalYear ? {
                    startDate: new Date(data?.data?.userFiscalYear.startDate),
                    endDate: new Date(data?.data?.userFiscalYear.endDate)
                } : null);
                const perms: string[] = [];
                // Extract permissions from roles
                //must be unique permissions

                data?.data?.roles?.forEach((role: Role) => {
                    role?.permissions?.forEach((permission: Permission) => {
                        // console.log(permission, "permissions in auth context")
                        if (permission.isAllowed && !perms.includes(permission.appModuleFeature?.code || '')) {
                            perms.push(permission.appModuleFeature?.code || '');
                        }
                    });
                });

                // data?.data?.roles?.forEach((role: Role) => {
                //     role.permission?.forEach((permission: Permission) => {
                //         if (permission.isAllowed) {
                //             perms.push(permission.appModuleFeature?.code || '');
                //         }
                //     });
                // });
                setpermissions(perms);
            })
            // console.log('Profile fetched successfully:', data?.data);

            // console.log('profile Data: ', data, isAuthenticated, user);
        } catch (error) {
            flushSync(() => {
                setUser(null);
                setUserFiscalYear(null);

            })
        } finally {
            // console.log('Profile fetch completed');

            setIsLoading(false);
        }
    };
    const login = React.useCallback(async ({ email, password }: LoginProps) => {
        setIsLoading(true);
        const response = await loginService({ email, password })
        if (response?.status === 'success') {

            await fetchProfile();
        }
        else {
            flushSync(() => {
                setUser(null);
                setUserFiscalYear(null);

            })
        }
        setIsLoading(false);
        // axiosClient.get('/cookie-test').then(console.log);
        // await fetchProfile();

    }, [])

    const logout = React.useCallback(async () => {
        console.log('Logging out...');
        setIsLoading(true);
        try {
            // Optionally hit a logout endpoint to clear server-side auth
            await logoutService();

            // Clear all client-side cache (e.g. React Query)
            flushSync(() => {
                queryClient.clear();
                setUser(null);

            })


            // Optionally clear auth cookies manually, if not HTTP-only
            // document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=aipt-api.local; secure";

        } catch (error) {
            console.error("Logout failed:", error);
        }
        finally {
            setIsLoading(false);

        }
    }, [])



    useEffect(() => {

        fetchProfile();
    }, []);
    return (
        <AuthContext.Provider
            value={{ user, isLoading, userFiscalYear, period, setPeriod, isAuthenticated: !!user, login, logout, fetchProfile, permissions }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within AuthProvider')
    return context
}
