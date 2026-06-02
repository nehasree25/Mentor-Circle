import { Navigate, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Circles from "./pages/Circles";
import CircleDetail from "./pages/CircleDetail";
import Dashboard from "./pages/Dashboard";
import Mentors from "./pages/Mentors";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

// Placeholder pages
const Peers = () => (
  <div className="space-y-8">
    <h1 className="text-4xl font-bold text-navy">Peers</h1>
    <p className="text-textsecondary text-lg">Connect with other students!</p>
  </div>
);

const AIRecommendations = () => (
  <div className="space-y-8">
    <h1 className="text-4xl font-bold text-navy">AI Recommendations</h1>
    <p className="text-textsecondary text-lg">Personalized suggestions coming soon!</p>
  </div>
);

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
          <Route path="/peers" element={<Peers />} />
          <Route path="/ai" element={<AIRecommendations />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default App;
