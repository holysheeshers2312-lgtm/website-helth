import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isInitialized: false, // Track if we've checked the persisted token
            
            login: async (phone, password) => {
                try {
                    const res = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ phone, password })
                    });
                    
                    const data = await res.json();
                    
                    if (data.success) {
                        set({
                            user: data.user,
                            token: data.token,
                            isAuthenticated: true,
                            isInitialized: true
                        });
                        return { success: true };
                    } else {
                        return { success: false, error: data.error || 'Login failed' };
                    }
                } catch (error) {
                    return { success: false, error: 'Network error. Please try again.' };
                }
            },
            
            register: async (name, phone, password, email = '', address = '') => {
                try {
                    const res = await fetch('/api/auth/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, phone, password, email, address })
                    });
                    
                    const data = await res.json();
                    
                    if (data.success) {
                        set({
                            user: data.user,
                            token: data.token,
                            isAuthenticated: true,
                            isInitialized: true
                        });
                        return { success: true };
                    } else {
                        return { success: false, error: data.error || 'Registration failed' };
                    }
                } catch (error) {
                    return { success: false, error: 'Network error. Please try again.' };
                }
            },
            
            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isInitialized: true
                });
            },
            
            verifyToken: async () => {
                const token = get().token;
                if (!token) {
                    set({ isAuthenticated: false, user: null, isInitialized: true });
                    return false;
                }
                
                try {
                    const res = await fetch('/api/auth/me', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    const data = await res.json();
                    
                    if (data.success) {
                        set({
                            user: data.user,
                            isAuthenticated: true,
                            isInitialized: true
                        });
                        return true;
                    } else {
                        // Token is invalid, clear it
                        set({ isAuthenticated: false, user: null, token: null, isInitialized: true });
                        return false;
                    }
                } catch (error) {
                    // Network error or invalid token
                    // Don't clear on network error - might be temporary
                    // Only clear if it's a 401/403
                    if (error.response?.status === 401 || error.response?.status === 403) {
                        set({ isAuthenticated: false, user: null, token: null, isInitialized: true });
                    } else {
                        // Keep the token if it's just a network error
                        set({ isInitialized: true });
                    }
                    return false;
                }
            },
            
            // Initialize auth state on app load
            init: async () => {
                // If already initialized, don't re-initialize
                if (get().isInitialized) {
                    return;
                }
                
                const token = get().token;
                const user = get().user;
                
                // If we have a token and user from persistence, set optimistic auth and verify
                if (token && user) {
                    // Optimistically set as authenticated (for better UX - user sees they're logged in immediately)
                    set({ isAuthenticated: true, isInitialized: false });
                    // Verify the token in the background
                    // This will update isAuthenticated to false if token is invalid
                    await get().verifyToken();
                } else {
                    // No token, definitely not authenticated
                    set({ isAuthenticated: false, isInitialized: true });
                }
            }
        }),
        {
            name: 'auth-storage',
            // Only persist these fields
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                // Don't persist isAuthenticated - we'll verify on load
                // Don't persist isInitialized - always start fresh
            }),
        }
    )
)
