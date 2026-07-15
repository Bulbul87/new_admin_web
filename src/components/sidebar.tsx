import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import logo from "../assets/logoimg.png";

import {
  LayoutDashboard,
  BriefcaseBusiness,
  Layers3,
  Users,
  KeyRound,
  LogOut,
  DollarSign,
} from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // =========================
  // MENU
  // =========================

  const menu = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Services",
      path: "/services",
      icon: <BriefcaseBusiness size={20} />,
    },
    {
      name: "Service Catalog",
      path: "/service-catalog",
      icon: <Layers3 size={20} />,
    },
    {
      name: "Pricing",
      path: "/pricing",
      icon: <DollarSign size={20} />,
    },
    {
      name: "Users",
      path: "/users",
      icon: <Users size={20} />,
    },
    {
      name: "Change Password",
      path: "/change-password",
      icon: <KeyRound size={20} />,
    },
  ];

  return (
    <>
      {/* ========================= */}
      {/* SIDEBAR */}
      {/* ========================= */}

      <div
        style={{
          width: 220,
          height: "100vh",

          background:
            "linear-gradient(to bottom, #FFFF6D, #8FDAFA)",

          color: "#14344A",
          padding: 20,

          position: "fixed",
          top: 0,
          left: 0,

          overflowY: "auto",
          zIndex: 1000,

          boxShadow: "2px 0 15px rgba(0,0,0,0.08)",
        }}
      >
        {/* TITLE */}

        <h3
          style={{
            marginBottom: 35,
            color: "#14344A",
            fontWeight: 700,
          }}
        >
          Admin Panel
        </h3>

        {/* MENU */}

        {menu.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,

                padding: "14px 15px",
                marginBottom: 12,

                cursor: "pointer",
                borderRadius: 12,

                transition: "0.3s",

                backgroundColor: isActive
                  ? "#14344A"
                  : "rgba(255,255,255,0.5)",

                color: isActive
                  ? "#fff"
                  : "#14344A",

                fontWeight: 600,
              }}
            >
              {/* ICON */}

              <span
                style={{
                  display: "flex",
                  alignItems: "center",

                  color: isActive
                    ? "#FFFF6D"
                    : "#14344A",
                }}
              >
                {item.icon}
              </span>

              {/* TEXT */}

              <span>{item.name}</span>
            </div>
          );
        })}

        {/* LOGOUT */}

        <div
          onClick={() => navigate("/logout")}
          style={{
            marginTop: 40,

            display: "flex",
            alignItems: "center",
            gap: 12,

            padding: "14px 15px",

            cursor: "pointer",

            backgroundColor: "#14344A",

            color: "#fff",

            borderRadius: 12,

            fontWeight: 600,
          }}
        >
          <LogOut size={20} color="#FFFF6D" />

          <span>Logout</span>
        </div>
      </div>

      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}

      <div
        style={{
          position: "fixed",

          top: 0,
          left: 220,
          right: 0,

          height: 70,

          background:
            "linear-gradient(to right, #FFFF6D, #8FDAFA)",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          zIndex: 999,

          boxShadow:
            "0 2px 12px rgba(0,0,0,0.08)",
        }}
      >
        {/* LOGO */}

        <img
          src={logo}
          alt="Senior America Logo"
          style={{
            height: 48,
            objectFit: "contain",
          }}
        />
      </div>
    </>
  );
};

export default Sidebar;