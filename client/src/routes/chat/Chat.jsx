import NewPrompt from "../../component/newPrompt/NewPrompt";
import "./chat.css";

const Chat = () => {
  return (
    <div className="chats">
      <div className="wrapper">
        <div className="chat">
          <div className="message">Test message</div>
          <div className="message user">
            Test message from user Lorem ipsum dolor sit, amet consectetur
            adipisicing elit. Magni, unde ducimus. Magni ex aliquam fugit?
            Quibusdam, rem aut accusamus deserunt harum omnis! Deleniti ab
            itaque quisquam architecto. Inventore, odit non!
          </div>
          <div className="message ">Test message</div>
          <div className="message user">Test message from user</div>
          <div className="message">Test message</div>
          <div className="message user">Test message from user</div>
          <div className="message ">Test message</div>
          <div className="message user">Test message from user</div>
          <div className="message">Test message</div>
          <div className="message user">Test message from user</div>
          <div className="message ">Test message</div>
          <div className="message user">Test message from user</div>
          <div className="message">Test message</div>
          <div className="message user">Test message from user</div>
          <div className="message ">Test message</div>
          <div className="message user">Test message from user</div>
          <div className="message">Test message</div>
          <div className="message user">Test message from user</div>
          <div className="message ">Test message</div>
          <div className="message user">Test message from user</div>
          <div className="message">Test message</div>
          <div className="message user">Test message from user</div>
          <div className="message ">Test message</div>
          <div className="message user">Test message from user</div>
          <NewPrompt />
        </div>
      </div>
    </div>
  );
};

export default Chat;
