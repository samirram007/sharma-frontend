// src/context/AuthContext.tsx
import type { UserFiscalYear } from '@/features/modules/user_fiscal_year/data/schema';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { fetchUserProfileService, loginService, logoutService } from '../services/apis';
import type { UserWithRole } from '../data/schema';
import type { Permission } from '@/features/modules/permission/data/schema';
import type { Role } from '@/features/modules/role/data/schema';
import type { MenuTreeItem } from '@/features/modules/menu/data/menu-tree-types';
import { menuTreeQueryOptions } from '@/features/modules/menu/data/services';
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
    menuTree: MenuTreeItem[];
    period: PeriodType | null;
    setPeriod: (period: PeriodType | null) => void;
}

import { AUTH_TOKEN_KEY } from '@/lib/auth'

// ---------------------------------------------------------------------------
//  Token storage helpers — driven by VITE_AUTH_STORAGE env var
// ---------------------------------------------------------------------------

/** Configured storage driver: localStorage, sessionStorage, or 'cookie' */
const authDriver = import.meta.env.VITE_AUTH_STORAGE || 'localStorage';

function getStorage(): Storage | null {
    if (authDriver === 'sessionStorage') return sessionStorage;
    if (authDriver === 'localStorage')   return localStorage;
    return null; // 'cookie' or unknown — no client-side storage, rely on HTTP-only cookie
}

function getToken(): string | null {
    const store = getStorage();
    if (store) return store.getItem(AUTH_TOKEN_KEY);
    // Cookie-based storage: try reading the 'token' cookie.
    // NOTE: httpOnly cookies set by the server are NOT readable from
    // document.cookie — this path only works with non-httpOnly cookies.
    const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
    return match ? match[2] : null;
}

function setToken(token: string): void {
    const store = getStorage();
    if (store) {
        store.setItem(AUTH_TOKEN_KEY, token);
    } else {
        // Fallback to cookie if no web storage is configured
        document.cookie = `token=${token}; path=/; secure; SameSite=None`;
    }
}

function removeToken(): void {
    const store = getStorage();
    if (store) {
        store.removeItem(AUTH_TOKEN_KEY);
    } else {
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    }
}

export { getToken, setToken, removeToken };

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    // const navigate = useNavigate();
    // const [isAuthenticated, setIsAuthenticated] = useState(true)
    const [user, setUser] = useState<UserWithRole | null>(null);
    const [userFiscalYear, setUserFiscalYear] = useState<UserFiscalYear | null>(null);
    const [period, setPeriod] = useState<PeriodType | null>(null);
    const [permissions, setpermissions] = useState<string[]>([]);
    const [menuTree, setMenuTree] = useState<MenuTreeItem[]>([]);
    const [isLoading, setIsLoading] = useState(true)
    const queryClient = useQueryClient();

    // Fetch the menu tree via TanStack Query
    const { data: menuTreeData } = useQuery({
        ...menuTreeQueryOptions(),
        enabled: !!user, // only fetch once we have a user
    })

    // Sync menu tree data into context state
    useEffect(() => {
        if (menuTreeData?.data) {
            setMenuTree(menuTreeData.data)
        }
    }, [menuTreeData])

    const fetchProfile = async () => {
        setIsLoading(true);
        // check cookie key "token" is set  else redirect to login


        try {
            // console.log('Fetching profile...');
            const data = await fetchUserProfileService();
            flushSync(() => {
                
                setUser(data?.data);
                setUserFiscalYear(data?.data?.userFiscalYear || null);

                setPeriod(data?.data?.userFiscalYear ? {
                    startDate: new Date(data?.data?.userFiscalYear.startDate),
                    endDate: new Date(data?.data?.userFiscalYear.endDate)
                } : null);
                const perms: string[] = [];
                // Extract permissions from roles
               

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
            // Token is invalid/expired — clear it from storage
            removeToken();
        } finally {
            // console.log('Profile fetch completed');

            setIsLoading(false);
        }
    };
    const login = React.useCallback(async ({ email, password }: LoginProps) => {
        setIsLoading(true);
        try {
            const response = await loginService({ email, password })
            // Backend returns the unified envelope: success (boolean).
            // Keep the legacy 'status' check for backward compatibility.
            if (response?.success === true || response?.status === 'success') {
                // Store bearer token if the backend returned one
                if (response?.token) {
                    setToken(response.token);
                }
                await fetchProfile();
            }
            else {
                flushSync(() => {
                    setUser(null);
                    setUserFiscalYear(null);

                })
            }
        } finally {
            // Always reset loading state, even if loginService throws
            setIsLoading(false);
        }
    }, [])

    const logout = React.useCallback(async () => {
        console.log('Logging out...');
        setIsLoading(true);
        try {
            await logoutService();

            flushSync(() => {
                queryClient.clear();
                setUser(null);
                // Clear stored bearer token
                removeToken();

            })

        } catch (error) {
            console.error("Logout failed:", error);
            // Still clear local state even if server call fails
            removeToken();
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
            value={{ user, isLoading, userFiscalYear, period, setPeriod, isAuthenticated: !!user, login, logout, fetchProfile, permissions, menuTree }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within AuthProvider')
    return context
}
