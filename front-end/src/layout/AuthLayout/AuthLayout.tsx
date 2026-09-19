import type { ReactNode } from "react";
import ThemeLogo from "../../components/ThemeLogo/ThemeLogo";
import "./authLayout.css";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
}

function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="auth-page-shell">
      <div className="auth-card">
        <div className="auth-visual">
          <div className="auth-visual-content">
            <div className="auth-logo-wrap">
              <ThemeLogo alt="Social Media Platform logo" theme="light" />
            </div>
            <p className="auth-brand-name">Socially</p>
            <p className="auth-eyebrow">Your people, your pulse</p>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
        </div>

        <div className="auth-panel">
          <div className="auth-box">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
