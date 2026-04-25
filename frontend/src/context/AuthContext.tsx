import { createContext, useState, useEffect, useContext } from "react";
import type { ReactNode } from "react";
import axios from "axios";
import type { AxiosInstance } from "axios";

interface User {
  id: string;
  name?: string;
  email: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string, name: string) => Promise<any>;
  logout: () => void;
  loading: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  taskStats: any;
  dailyTaskStats: any;
  fetchTaskStats: () => Promise<void>;
  fetchDailyTaskStats: () => Promise<void>;
  apiClient: AxiosInstance;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [taskStats, setTaskStats] = useState(null);
  const [dailyTaskStats, setDailyTaskStats] = useState(null);

  // Create axios instance with auth header
  const apiClient = axios.create({
    baseURL: API_BASE_URL,
  });

  apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      apiClient
        .get("/auth/me")
        .then((res) => {
          setUser(res.data);
          fetchTaskStats();
          fetchDailyTaskStats();
        })
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
        });
    }
    setLoading(false);
  }, []);

  const fetchTaskStats = async (): Promise<void> => {
    try {
      const res = await apiClient.get("/tasks/stats/summary");
      setTaskStats(res.data);
    } catch (err) {
      console.error("Error fetching task stats:", err);
    }
  };

  const fetchDailyTaskStats = async (): Promise<void> => {
    try {
      const res = await apiClient.get("/daily-tasks/stats/summary");
      setDailyTaskStats(res.data);
    } catch (err) {
      console.error("Error fetching daily task stats:", err);
    }
  };

  const login = async (email: string, password: string): Promise<any> => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      setShowAuthModal(false);
      fetchTaskStats();
      fetchDailyTaskStats();
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<any> => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/register`, {
        email,
        password,
        name,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      setShowAuthModal(false);
      fetchTaskStats();
      fetchDailyTaskStats();
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setTaskStats(null);
    setDailyTaskStats(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        showAuthModal,
        setShowAuthModal,
        isLoggedIn: !!user,
        isAdmin: user?.role === "admin",
        taskStats,
        dailyTaskStats,
        fetchTaskStats,
        fetchDailyTaskStats,
        apiClient,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default AuthContext;
