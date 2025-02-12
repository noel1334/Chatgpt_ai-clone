import { Link } from "react-router-dom";
import "./chatList.css";

const ChatList = () => {
  return (
    <div className="chatList">
      <span className="title">DASHBOARD</span>
      <Link to={"/dashboard"}>create a new chat</Link>
      <Link to={"/"}>Explore Noel AI</Link>
      <Link to={"/"}>Contact</Link>
      <hr />
      <span className="title">RECENT CHATS</span>
      <div className="list">
        <Link to={"/"}>my chat list title</Link>
        <Link to={"/"}>my chat list title</Link>
        <Link to={"/"}>my chat list title</Link>
        <Link to={"/"}>my chat list title</Link>
        <Link to={"/"}>my chat list title</Link>
        <Link to={"/"}>my chat list title</Link>
        <Link to={"/"}>my chat list title</Link>
        <Link to={"/"}>my chat list title</Link>
        <Link to={"/"}>my chat list title</Link>
        <Link to={"/"}>my chat list title</Link>
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
