import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Profile from "../pages/Profile/Profile";
import AuthResetPassword from "../pages/auth/AuthenticatedResetPassword";
import PostPage from "../pages/Post/PostPage";
import SearchPage from "../pages/Search/SearchPage";
import Messaging from "../pages/Messaging/Messaging";
import Home from "../pages/Home/Home";
import AppLayout from "../layout/AppLayout/AppLayout";

function ProtectedLayout() {
  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout />;
}

function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/post/:postId" element={<PostPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/messages" element={<Messaging />} />
        <Route path="/auth-reset-password" element={<AuthResetPassword />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRouter;
