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

import AdminUserList from "./screens/Adminuserlist";
import ProviderDetails from "./screens/providerdetail";
import RequesterDetails from "./screens/requesterdetail";
import ChangePassword from "./screens/changepasswordui";
import ForgotPassword from "./screens/forgetpassword";

import Pricing from "./screens/pricing";
import PricingRules from "./screens/viewpricing";
import ServiceCrudScreen from "./screens/service_crud";
import Adminconfigscreen from "./screens/adminconfig";
import SupportTicket from "./screens/SupportTicket";
import ViewAccessCode from "./screens/viewAccesscode";
import AccessCodeList from "./screens/visitlist";
import ProviderOnlineOfflineStatus from "./screens/provideronlineoflinestatus";

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
            <Route path="/service-crud" element={<ServiceCrudScreen />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/view-pricing" element={<PricingRules />} />

            <Route path="/users" element={<AdminUserList />} />
            <Route path="/provider-details/:id" element={<ProviderDetails />} />
            <Route path="/requester-details/:id" element={<RequesterDetails />}
            />
            <Route path="/service-access-code" element={<Adminconfigscreen />} />
            <Route path="/support-tickets" element={<SupportTicket />} />
              <Route path="/access-codes" element={<AccessCodeList/>} />
            <Route path="/access-codes/:id" element={<ViewAccessCode />} />
             <Route path="/provider-status" element={<ProviderOnlineOfflineStatus />} />
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