import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AdminAuthProvider } from "./context/Authcontext";
import ProtectedRoute from "./components/Protectedroute";

// Layout
import Layout from "./components/layout";

// Screens
import Login from "./screens/Login";
import Logout from "./screens/Logout";
import Dashboard from "./screens/Dashboard";
import Services from "./screens/Services";
import AddService from "./screens/Addservice";
import EditService from "./screens/Editservice";
import AdminUserList from "./screens/Adminuserlist";
import ProviderDetails from "./screens/providerdetail";
import RequesterDetails from "./screens/requesterdetail";
import ChangePassword from "./screens/changepasswordui";
import ForgotPassword from "./screens/forgetpassword";
import ServiceRequestForm from "./screens/servicerequest";
import Pricing from "./screens/pricing";
import PricingRules from "./screens/viewpricing";

function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Routes>

          {/* PUBLIC */}
          <Route path="/" element={<Login />} />
          <Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>

          {/* PROTECTED WITH SIDEBAR */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
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
            <Route path="/users" element={<AdminUserList />} />
            <Route path="/provider-details/:id" element={<ProviderDetails />} />
            <Route path="/requester-details/:id" element={<RequesterDetails />} 
            />
            <Route
          path="/change-password"
          element={<ChangePassword />}
        />

          </Route>

          {/* LOGOUT */}
          <Route path="/logout" element={<Logout />} />

        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  );
}

export default App;