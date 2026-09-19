import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { insforge } from '../services/insforge';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync user session on load (handles normal load + OAuth callback)
  useEffect(() => {
    const initAuth = async () => {
      try {
        // 1. Check InsForge Auth session / OAuth callback
        const { data: authData } = await insforge.auth.getCurrentUser();
        if (authData?.user) {
          // If token in localStorage or from InsForge session
          const token = localStorage.getItem('nexora_token');
          if (token) {
            try {
              const res = await api.getMe();
              if (res?.data?.user) {
                setUser(res.data.user);
                return;
              }
            } catch (e) {}
          }

          // Construct user from InsForge Auth user data
          setUser({
            id: authData.user.id,
            email: authData.user.email,
            name: authData.user.profile?.name || authData.user.email?.split('@')[0] || 'Member',
            avatar_url: authData.user.profile?.avatar_url || null,
            roles: ['CUSTOMER']
          });
          return;
        }

        // 2. Fallback to existing token in localStorage
        const localToken = localStorage.getItem('nexora_token');
        if (localToken) {
          const res = await api.getMe();
          if (res?.data?.user) {
            setUser(res.data.user);
            return;
          }
        }
      } catch (err) {
        console.warn('Auth initialization notice:', err.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // 1. Sign in with Email and Password using InsForge Auth (with fallback to demo credentials)
  const login = async (email, password) => {
    try {
      // Attempt InsForge Auth first
      const { data: authData, error: authError } = await insforge.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (!authError && authData?.user && authData?.accessToken) {
        localStorage.setItem('nexora_token', authData.accessToken);
        try {
          const res = await api.getMe();
          if (res?.data?.user) {
            setUser(res.data.user);
            return { user: res.data.user, token: authData.accessToken };
          }
        } catch {}

        const profileUser = {
          id: authData.user.id,
          email: authData.user.email,
          name: authData.user.profile?.name || authData.user.email?.split('@')[0],
          avatar_url: authData.user.profile?.avatar_url,
          roles: ['CUSTOMER']
        };
        setUser(profileUser);
        return { user: profileUser, token: authData.accessToken };
      }
    } catch (err) {
      console.warn('InsForge sign-in attempt passed to API fallback:', err.message);
    }

    // Fallback for one-click demo credentials and local accounts
    const res = await api.login({ email, password });
    if (res?.data?.token && res?.data?.user) {
      localStorage.setItem('nexora_token', res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  // 2. Sign up with Email and Password using InsForge Auth
  const register = async (formData) => {
    const { email, password, name, phone } = formData;

    // Call InsForge Auth signUp
    const { data: authData, error: authError } = await insforge.auth.signUp({
      email: email.trim(),
      password,
      name: name?.trim() || undefined
    });

    if (authError) {
      // If error or already exists, attempt backend registration
      const res = await api.register(formData);
      if (res?.data?.token && res?.data?.user) {
        localStorage.setItem('nexora_token', res.data.token);
        setUser(res.data.user);
      }
      return res.data;
    }

    // Also notify local DB
    try {
      await api.register(formData);
    } catch {}

    if (authData?.accessToken && authData?.user) {
      localStorage.setItem('nexora_token', authData.accessToken);
      const newUser = {
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.profile?.name || name,
        roles: ['CUSTOMER']
      };
      setUser(newUser);
      return { user: newUser, token: authData.accessToken };
    }

    return authData;
  };

  // 3. Sign in with Google OAuth via InsForge Auth
  const loginWithGoogle = async () => {
    const { data, error } = await insforge.auth.signInWithOAuth('google', {
      redirectTo: `${window.location.origin}/login`
    });

    if (error) {
      throw error;
    }

    // If skipBrowserRedirect was false, SDK redirects automatically.
    // If a URL was returned:
    if (data?.url) {
      window.location.href = data.url;
    }
  };

  // 4. Sign out
  const logout = async () => {
    try {
      await insforge.auth.signOut();
    } catch {}
    localStorage.removeItem('nexora_token');
    setUser(null);
    try {
      api.logout();
    } catch {}
  };

  const updateProfile = async (data) => {
    const res = await api.updateProfile(data);
    if (res?.data?.user) {
      setUser((prev) => ({ ...prev, ...res.data.user }));
    }
    return res.data;
  };

  const isAdmin = Boolean(user?.roles?.includes('ADMIN'));
  const isManager = Boolean(user?.roles?.includes('MANAGER') || isAdmin);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        updateProfile,
        isAuthenticated: Boolean(user),
        isAdmin,
        isManager
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
