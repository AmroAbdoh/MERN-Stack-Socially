import type { ReactNode } from "react";

import "./cardLayout.css";

type CardLayoutProps = {
  children: ReactNode;
};

function CardLayout({ children }: CardLayoutProps) {
  return <div className="profile-layout">{children}</div>;
}

export default CardLayout;
