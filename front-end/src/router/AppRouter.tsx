import { Navigate, Route, Routes } from "react-router-dom";

import AuthPage from "../pages/auth/AuthPage";

function HomePage() {
  const userName = localStorage.getItem("userName") || "there";

  return (
    <main className="home-page">
      <p className="home-eyebrow">Socially</p>
      <h1>Welcome back, {userName}.</h1>
      <p>Your feed is ready for the next conversation.</p>
    </main>
  );
}

function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRouter;
