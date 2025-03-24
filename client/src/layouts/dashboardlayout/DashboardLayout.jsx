// DashboardLayout.jsx
import { Outlet, useNavigate, useOutletContext } from "react-router-dom";
import "./dashboardLayout.css";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react"; // Import useState
import ChatList from "../../component/chatList/ChatList";

const DashboardLayout = () => {
  const { userId, isLoaded } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen] = useOutletContext();
  const [key, setKey] = useState(0); // State variable to force re-render

  useEffect(() => {
    if (isLoaded && !userId) {
      navigate("/login");
    }
  }, [isLoaded, userId, navigate]);

  useEffect(() => {
    // This useEffect will trigger when userId changes, or when a new chat is added.
    // This is a safety net to ensure the ChatList re-renders when the data is refreshed.
    setKey((prevKey) => prevKey + 1);
  }, [userId]);

  if (!isLoaded) return "Loading .....";

  return (
    <div className="dashboardLayout">
      <div className={`menu ${isMenuOpen ? "menu-open" : ""}`}>
        <ChatList key={key} /> {/* Pass the key to ChatList */}
      </div>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
