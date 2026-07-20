
import { Routes, Route, Navigate } from "react-router-dom";
import { useAdminAuth } from "../context/Authcontext";

// Screens
import Login from "../screens/Login";
import Dashboard from "../screens/Dashboard";
import Services from "../screens/Services";
import AddService from "../screens/Addservice";
import EditService from "../screens/Editservice";
import Users from "../screens/Adminuserlist";
import ProviderDetails from "../screens/providerdetail";
import RequesterDetails from "../screens/requesterdetail";
import Logout from "../screens/Logout";
import ChangePassword from "../screens/changepasswordui";
import ForgotPassword from "../screens/forgetpassword";
import ServiceRequestForm from "../screens/servicerequest";
import Pricing from "../screens/pricing";
import PricingRules from "../screens/viewpricing";
const AppNavigator = () => {
  const { isLoading, isAuthenticated } = useAdminAuth();

  // 🔄 Loader (same as RN)
  if (isLoading) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h4>Loading...</h4>
      </div>
    );
  }

  return (
    <Routes>

      {/* 🔓 Public */}
      {!isAuthenticated ? (
        <>
          <Route path="/" element={<Login />} />
          <Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>
          <Route path="*" element={<Navigate to="/" />} />
        </>
      ) : (
        <>
          {/* 🔐 Protected */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/services" element={<Services />} />
          <Route
  path="/service-catalog"
  element={<ServiceRequestForm />}
/>
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/view-pricing" element={<PricingRules />} />
          <Route path="/add-service" element={<AddService />} />
          <Route path="/edit-service" element={<EditService />} />
          <Route path="/users" element={<Users />} />
          <Route  path="/provider-details/:id" element={< ProviderDetails />} />
          <Route path="/requester-details/:id" element={<RequesterDetails />} />
          <Route
          path="/change-password"
          element={<ChangePassword />}
        />
          <Route path="/logout" element={<Logout />} />

          {/* default */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </>
      )}

    </Routes>
  );
};

export default AppNavigator;