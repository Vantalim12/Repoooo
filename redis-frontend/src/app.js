// src/app.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext.js";

// Layouts
import MainLayout from "./layouts/MainLayout.js";
import AuthLayout from "./layouts/AuthLayout.js";

// Auth Pages
import Login from "./pages/auth/Login.js";

// Dashboard Pages
import Dashboard from "./pages/dashboard/Dashboard.js";

// Family Heads Pages
import FamilyHeadsList from "./pages/familyHeads/familyHeadsList.js";
import AddFamilyHead from "./pages/familyHeads/AddFamilyHead.js";
import EditFamilyHead from "./pages/familyHeads/EditFamilyHead.js";
import FamilyHeadDetails from "./pages/familyHeads/FamilyHeadDetails.js";

// Residents Pages
import ResidentList from "./pages/residents/ResidentList.js";
import AddResident from "./pages/residents/AddResident.js";
import EditResident from "./pages/residents/EditResident.js";
import ResidentDetails from "./pages/residents/ResidentDetails.js";

// User Profile Pages
import UserProfile from "./pages/profile/UserProfile.js";

// NotFound Page
import NotFound from "./pages/NotFound.js";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/" element={<AuthLayout />}>
        <Route index element={<Navigate to="/login" />} />
        <Route path="login" element={<Login />} />
      </Route>

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />

        {/* Family Heads Routes */}
        <Route path="family-heads">
          <Route index element={<FamilyHeadsList />} />
          <Route path="add" element={<AddFamilyHead />} />
          <Route path="edit/:id" element={<EditFamilyHead />} />
          <Route path="view/:id" element={<FamilyHeadDetails />} />
        </Route>

        {/* Residents Routes */}
        <Route path="residents">
          <Route index element={<ResidentList />} />
          <Route path="add" element={<AddResident />} />
          <Route path="edit/:id" element={<EditResident />} />
          <Route path="view/:id" element={<ResidentDetails />} />
        </Route>

        {/* Profile Route */}
        <Route path="profile" element={<UserProfile />} />
      </Route>

      {/* Not Found Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
