import "./dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="texts">
        <div className="logo">
          <img src="/logo.png" alt="" />
          <h1>NOEL AI</h1>
        </div>
        <div className="options">
          <div className="option">
            <img src="/chat.png" alt="" />
            <span>Create a New Chat</span>
          </div>
          <div className="option">
            <img src="/image.png" alt="" />
            <span>Analyze Image</span>
          </div>
          <div className="option">
            <img src="/code.png" alt="" />
            <span>Help me with a code</span>
          </div>
        </div>
      </div>
      <div className="formContainer">
        <form>
          <input type="text" placeholder="Ask me anything.... " />
          <button>
            <img src="/arrow.png" alt="" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
