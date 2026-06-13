import { Navigate, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Circles from "./pages/Circles";
import CircleDetail from "./pages/CircleDetail";
import Dashboard from "./pages/Dashboard";
import Mentors from "./pages/Mentors";
import { PeerDiscovery } from "./pages/PeerDiscovery";
import Profile from "./pages/Profile";
import AIRecommendations from "./pages/AIRecommendations";
import Requests from "./pages/Requests";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/circles" element={<Circles />} />
          <Route path="/circles/:circleId" element={<CircleDetail />} />
          <Route path="/mentors" element={<Mentors />} />
          <Route path="/peers" element={<PeerDiscovery />} />
          <Route path="/ai" element={<AIRecommendations />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default App;
