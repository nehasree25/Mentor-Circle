import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-appbg">
      <Sidebar />
      <main className="md:ml-72 pt-20 md:pt-0">
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
