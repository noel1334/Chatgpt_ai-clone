import { Outlet, useNavigate, useOutletContext } from "react-router-dom"; // Import useOutletContext
import "./dashboardLayout.css";
import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import ChatList from "../../component/chatList/ChatList";

const DashboardLayout = () => {
  const { userId, isLoaded } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen] = useOutletContext();

  useEffect(() => {
    if (isLoaded && !userId) {
      navigate("/login");
    }
  }, [isLoaded, userId, navigate]);

  if (!isLoaded) return "Loading .....";

  return (
    <div className="dashboardLayout">
      <div className={`menu ${isMenuOpen ? "menu-open" : ""}`}>
        <ChatList />
      </div>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
