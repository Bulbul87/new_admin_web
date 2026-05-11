import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { loginAdmin, signupAdmin } from "../service/auth.service";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    phone: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAdminAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
};

interface Props {
  children: ReactNode;
}

export const AdminAuthProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  // ✅ LOAD FROM localStorage
  const loadStoredAuth = () => {
    try {
      const storedToken = localStorage.getItem("adminToken");
      const storedUser = localStorage.getItem("adminUser");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.log("Load auth error", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ LOGIN
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const res = await loginAdmin(email, password);

      const user = res?.user;
      const authToken = res?.accessToken;

      if (!user || !authToken) {
        throw new Error("Invalid login response");
      }

      // ✅ STORE
      localStorage.setItem("adminToken", authToken);
      localStorage.setItem("adminUser", JSON.stringify(user));
      localStorage.setItem("adminRole", user.role);

      setUser(user);
      setToken(authToken);
    } catch (err) {
      console.log("Login error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ REGISTER
  const register = async (
    name: string,
    email: string,
    phone: string,
    password: string
  ) => {
    try {
      setIsLoading(true);

      const res = await signupAdmin({
        name,
        email,
        phone,
        password,
        role: "admin",
      });

      const user = res?.user;
      const authToken = res?.accessToken;

      if (!user || !authToken) {
        throw new Error("Invalid signup response");
      }

      localStorage.setItem("adminToken", authToken);
      localStorage.setItem("adminUser", JSON.stringify(user));
      localStorage.setItem("adminRole", user.role);

      setUser(user);
      setToken(authToken);
    } catch (err) {
      console.log("Signup error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ LOGOUT
  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("adminRole");

    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};