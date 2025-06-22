"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { apiClient } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password1: string,
    password2: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check if user is authenticated on app start
    const token = localStorage.getItem("auth_token");
    if (token) {
      apiClient.setToken(token);
      setIsAuthenticated(true);
      // Set cookie for middleware
      document.cookie = `auth_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    try {
      const response = await apiClient.login({ username, password });
      setIsAuthenticated(true);
      document.cookie = `auth_token=${response.key}; path=/; max-age=${7 * 24 * 60 * 60}`;
      return;
    } catch (error) {
      apiClient.clearToken();
      document.cookie =
        "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      setIsAuthenticated(false);
      throw error;
    }
  };

  const register = async (
    username: string,
    email: string,
    password1: string,
    password2: string,
  ): Promise<void> => {
    try {
      const response = await apiClient.register({
        username,
        email,
        password1,
        password2,
      });
      setIsAuthenticated(true);
      document.cookie = `auth_token=${response.key}; path=/; max-age=${7 * 24 * 60 * 60}`;
      return;
    } catch (error) {
      apiClient.clearToken();
      document.cookie =
        "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      // Even if logout fails on server, we should clear local state
      console.error("Logout error:", error);
    } finally {
      // Clear cookie
      document.cookie =
        "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      setIsAuthenticated(false);
      queryClient.clear();
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
