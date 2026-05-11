import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/Authcontext";

const Logout: React.FC = () => {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    logout();
    navigate("/");
  }, [logout, navigate]);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <h4>Logging out...</h4>
    </div>
  );
};

export default Logout;