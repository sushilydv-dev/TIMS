import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { normalizeRole } from "../utils/role";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refreshToken") || null);
  const [loading, setLoading] = useState(true);

  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }

  // Load user profile on mount if token exists
  useEffect(() => {
    const fetchUserProfile = async () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${storedToken}`;
        const response = await axios.get("/api/auth/profile");
        setUser({
          ...response.data,
          role: normalizeRole(response.data.role),
          Student: response.data.Student
            ? { id: response.data.Student.id }
            : null,
        });
        setToken(storedToken);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        // Clear invalid token
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Login action
  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await axios.post("/api/auth/login", { email, password, rememberMe });
      const { token: userToken, refreshToken: userRefreshToken, ...userData } = response.data;
      const normalizedUser = {
        ...userData,
        role: normalizeRole(userData.role),
      };

      localStorage.setItem("token", userToken);
      if (rememberMe && userRefreshToken) {
        localStorage.setItem("refreshToken", userRefreshToken);
      } else {
        localStorage.removeItem("refreshToken");
      }
      axios.defaults.headers.common["Authorization"] = `Bearer ${userToken}`;
      setToken(userToken);
      setRefreshToken(userRefreshToken || null);
      setUser(normalizedUser);
      return { token: userToken, ...normalizedUser };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Logout action
  const logout = async () => {
    const storedRefreshToken = localStorage.getItem("refreshToken");
    if (storedRefreshToken) {
      try {
        await axios.post("/api/auth/logout", { refreshToken: storedRefreshToken });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    setToken(null);
    setRefreshToken(null);
  };

  // Refresh token action
  const refreshAccessToken = async () => {
    const storedRefreshToken = localStorage.getItem("refreshToken");
    if (!storedRefreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await axios.post("/api/auth/refresh-token", { refreshToken: storedRefreshToken });
      const { token: newToken, refreshToken: newRefreshToken, ...userData } = response.data;
      
      localStorage.setItem("token", newToken);
      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
      }
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      setToken(newToken);
      setRefreshToken(newRefreshToken || null);
      
      const normalizedUser = {
        ...userData,
        role: normalizeRole(userData.role),
      };
      setUser(normalizedUser);
      
      return newToken;
    } catch (error) {
      console.error("Token refresh error:", error);
      // If refresh fails, logout the user
      logout();
      throw error;
    }
  };

  const establishSession = (userToken, userData) => {
    const normalizedUser = {
      ...userData,
      role: normalizeRole(userData.role),
    };
    localStorage.setItem("token", userToken);
    axios.defaults.headers.common["Authorization"] = `Bearer ${userToken}`;
    setToken(userToken);
    setUser(normalizedUser);
    return normalizedUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        loading,
        login,
        logout,
        establishSession,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
