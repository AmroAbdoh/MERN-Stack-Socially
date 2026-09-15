import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Profile from "../pages/Profile/Profile";
import Navbar from "../components/Navbar/Navbar";

function HomePage() {
  const userName = localStorage.getItem("userName") || "there";

  return (
    <>
      <Navbar />
      <main className="home-page">
        <p className="home-eyebrow">Socially</p>
        <h1>Welcome back, {userName}.</h1>
        <p>Your feed is ready for the next conversation.</p>
      </main>
    </>
  );
}

function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRouter;
