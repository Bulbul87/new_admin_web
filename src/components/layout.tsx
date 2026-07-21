import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";

const Layout = () => {
  return (
    <div style={{ display: "flex" }}>
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div style={{ flex: 1, padding: 20, background:
          "linear-gradient(to bottom right, #f4f8fc, #eef5ff)", }}>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;