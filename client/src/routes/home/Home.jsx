import { Link } from "react-router-dom";
import "./home.css";
import { TypeAnimation } from "react-type-animation";
import { useState } from "react";

const Home = () => {
  const [typingStatus, setTypingStatus] = useState("human1");

  return (
    <div className="home">
      <img src="/orbital.png" alt="" className="orbital" />
      <div className="left">
        <h1>NOEL AI</h1>
        <h2>SuperCharge your creativity and productivity</h2>
        <h3>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Et suscipit
          labore quaerat, dolorem similique dignissimos adipisci deleniti
        </h3>
        <Link to="/dashboard">Get Started</Link>
      </div>
      <div className="right">
        <div className="imgContainer">
          <div className="bgContainer">
            <div className="bg"></div>
          </div>
          <img src="./bot.png" alt="" className="bot" />
          <div className="chat">
            <img
              src={
                typingStatus === "human1"
                  ? "/human1.jpeg"
                  : typingStatus === "human2"
                  ? "/human2.jpeg"
                  : "bot.png"
              }
              alt=""
            />
            <TypeAnimation
              sequence={[
                "Human:We produce food for Mice",
                2000,
                () => {
                  setTypingStatus("bot");
                },
                "Bot:We produce food for Hamsters",
                2000,
                () => {
                  setTypingStatus("human2");
                },
                "Human2:We produce food for Guinea Pigs",
                2000,
                () => {
                  setTypingStatus("bot");
                },
                "Bot:We produce food for Chinchillas",
                2000,
                () => {
                  setTypingStatus("human1");
                },
              ]}
              wrapper="span"
              repeat={Infinity}
              cursor={true}
              omitDeletionAnimation={true}
            />
          </div>
        </div>
      </div>
      <div className="terms">
        <img src="/logo.png" alt="" />
        <div className="links">
          <Link to={"/"}>Terms of Services</Link>
          <span></span>
          <Link to={"/"}>Privacy policy</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
