import { Outlet } from "react-router-dom";

import Navbar from "../../components/Navbar/Navbar";

import "./appLayout.css";

function AppLayout() {
  return (
    <div className="app-layout">
      <Navbar />
      <Outlet />
    </div>
  );
}

export default AppLayout;
