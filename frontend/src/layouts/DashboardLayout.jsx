import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-appbg">
      <Navbar />
      <main className="pt-20">
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
