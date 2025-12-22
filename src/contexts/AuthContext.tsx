import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userService } from '@/services/mongodbService';

interface User {
  _id?: string;
  email: string;
  name?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('saferoute_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('saferoute_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const result = await userService.getUserByEmail(email);
      
      if (!result.success || !result.data) {
        return { success: false, error: 'User not found. Please sign up first.' };
      }

      // Simple password check (in production, use proper hashing)
      if (result.data.password !== password) {
        return { success: false, error: 'Invalid password.' };
      }

      const userData: User = {
        _id: result.data._id,
        email: result.data.email,
        name: result.data.name,
        createdAt: result.data.createdAt,
      };

      setUser(userData);
      localStorage.setItem('saferoute_user', JSON.stringify(userData));
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, name?: string) => {
    try {
      // Check if user already exists
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser.success && existingUser.data) {
        return { success: false, error: 'An account with this email already exists.' };
      }

      // Create new user
      const result = await userService.createUser({
        email,
        name: name || email.split('@')[0],
        preferences: {},
        password, // In production, hash this password
      } as any);

      if (!result.success) {
        return { success: false, error: result.error || 'Failed to create account' };
      }

      // Auto-login after signup
      const userData: User = {
        _id: result.data,
        email,
        name: name || email.split('@')[0],
      };

      setUser(userData);
      localStorage.setItem('saferoute_user', JSON.stringify(userData));
      return { success: true };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { success: false, error: error.message || 'Signup failed' };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('saferoute_user');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
