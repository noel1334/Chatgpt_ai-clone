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
          <div className="message ">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut
            excepturi exercitationem consectetur magni fugiat iure possimus
            ullam modi voluptas veniam impedit libero fuga, porro eum veritatis
            ad eaque similique debitis vel incidunt neque repudiandae. Incidunt
            alias quas quam possimus rerum veniam illo dolorem deleniti nihil
            omnis! Inventore labore reiciendis error veritatis ullam? Ea iusto
            magni amet vitae laborum quod?
          </div>
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
