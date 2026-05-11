import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Services", path: "/services" },
    { name: "Users", path: "/users" },
    { name: "Change Password", path: "/change-password" },
  ];

  return (
    <div
      style={{
        width: 220,
        height: "100vh",
        backgroundColor: "#14344A",
        color: "#fff",
        padding: 20,
      }}
    >

      <h4 style={{ marginBottom: 30 }}>
        Admin Panel
      </h4>

      {/* Menu */}
      {menu.map((item) => (

        <div
          key={item.path}
          onClick={() => navigate(item.path)}
          style={{
            padding: "10px 15px",
            marginBottom: 10,
            cursor: "pointer",
            borderRadius: 6,
            transition: "0.3s",

            backgroundColor:
              location.pathname === item.path
                ? "#34B7EA"
                : "transparent",
          }}
        >
          {item.name}
        </div>

      ))}

      {/* Logout */}
      <div
        onClick={() => navigate("/logout")}
        style={{
          marginTop: 40,
          padding: "10px 15px",
          cursor: "pointer",
          backgroundColor: "#1C355D",
          borderRadius: 6,
        }}
      >
        Logout
      </div>

    </div>
  );
};

export default Sidebar;