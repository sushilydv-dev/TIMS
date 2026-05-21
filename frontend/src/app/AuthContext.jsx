import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
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
        axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        const response = await axios.get("/api/auth/profile");
        setUser(response.data);
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
  const login = async (email, password) => {
    try {
      const response = await axios.post("/api/auth/login", { email, password });
      const { token: userToken, ...userData } = response.data;

      localStorage.setItem("token", userToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${userToken}`;
      setToken(userToken);
      setUser(userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Register action
  const register = async (username, email, password, otp, role) => {
    try {
      const response = await axios.post("/api/auth/register", {
        username,
        email,
        password,
        otp,
        role,
      });
      const { token: userToken, ...userData } = response.data;

      localStorage.setItem("token", userToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${userToken}`;
      setToken(userToken);
      setUser(userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Logout action
  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
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
