import { Link } from "react-router-dom";
import "./chatList.css";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { useOutletContext } from "react-router-dom";

const ChatList = () => {
  const baseUrl = import.meta.env.VITE_REACT_APP_BASE_URL;
  const { getToken, userId, isLoaded, isSignedIn } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useOutletContext();

  const { isPending, error, data } = useQuery({
    queryKey: ["userChats", userId],
    enabled: isLoaded && isSignedIn && !!userId,
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error("No token available");
      }
      const response = await fetch(`${baseUrl}/api/userChats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error ${response.status}: ${errorText}`);
      }
      return response.json();
    },
    select: (chats) => {
      return [...chats].reverse();
    },
  });

  if (!isLoaded) {
    return <div>Loading Clerk...</div>;
  }

  if (!isSignedIn) {
    return <div>Please sign in to see your chats.</div>;
  }

  if (!userId) {
    return <div>Loading user information...</div>;
  }

  const handleClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="chatList">
      <span className="title">DASHBOARD</span>
      <Link to={"/dashboard"} onClick={handleClick}>
        create a new chat
      </Link>
      <Link to={"/"} onClick={handleClick}>
        Explore Noel AI
      </Link>
      <Link to={"/"} onClick={handleClick}>
        Contact
      </Link>
      <hr />
      <span className="title">RECENT CHATS</span>
      <div className="list">
        {isPending
          ? "Loading..."
          : error
          ? `Something went wrong: ${error.message}`
          : data?.map((chat) => (
              <Link
                to={`/dashboard/chats/${chat._id}`}
                key={chat._id}
                onClick={handleClick}
              >
                {chat.title || "Untitled Chat"}
              </Link>
            ))}
      </div>
      <hr />
      <div className="upgrade">
        <img src="/logo.png" alt="" />
        <div className="tests">
          <span>upgrade Noel AI pro</span>
          <span>get unlimited access to all features </span>
        </div>
      </div>
    </div>
  );
};

export default ChatList;
