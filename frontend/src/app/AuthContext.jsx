import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { normalizeRole } from "../utils/role";

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
  const login = async (email, password) => {
    try {
      const response = await axios.post("/api/auth/login", { email, password });
      const { token: userToken, ...userData } = response.data;
      const normalizedUser = {
        ...userData,
        role: normalizeRole(userData.role),
      };

      localStorage.setItem("token", userToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${userToken}`;
      setToken(userToken);
      setUser(normalizedUser);
      return { token: userToken, ...normalizedUser };
    } catch (error) {
      console.error("Login error:", error);
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
      const normalizedUser = {
        ...userData,
        role: normalizeRole(userData.role),
      };

      localStorage.setItem("token", userToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${userToken}`;
      setToken(userToken);
      setUser(normalizedUser);
      return { token: userToken, ...normalizedUser };
    } catch (error) {
      console.error("Registration error:", error);
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
        loading,
        login,
        register,
        logout,
        establishSession,
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
