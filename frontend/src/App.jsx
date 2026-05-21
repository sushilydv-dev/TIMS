import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Homepage } from "./pages/Homepage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import { AuthProvider } from "./app/AuthContext";
import { PrivateRoutes } from "./Routes/PrivateRoutes";
import { PublicRoutes } from "./Routes/PublicRoutes";

export const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
         
          <Route element={<PublicRoutes />}>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

     
          <Route element={<PrivateRoutes />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

