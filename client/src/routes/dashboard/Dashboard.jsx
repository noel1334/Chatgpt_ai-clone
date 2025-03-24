import "./dashboard.css";
import { useAuth } from "@clerk/clerk-react";
import { useState, useRef, useEffect } from "react";
import Upload from "../../component/upload/Upload";
import AudioRecorder from "../../component/audioRecorder/AudioRecorder";
import { IKImage } from "imagekitio-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const baseUrl = import.meta.env.VITE_REACT_APP_BASE_URL;
  const [errorMessage, setErrorMessage] = useState(null);
  const { getToken, userId } = useAuth();
  const [question, setQuestion] = useState("");
  const [img, setImg] = useState({
    isLoading: false,
    error: "",
    dbData: {},
    aiData: {},
  });
  const [transcription, setTranscription] = useState("");
  const [showTranscription, setShowTranscription] = useState(false);
  const [textareaHasText, setTextareaHasText] = useState(false);
  const endRef = useRef(null);
  const [generating, setGenerating] = useState(false);
  const [showSendClear, setShowSendClear] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setShowTranscription(transcription.length > 0);
  }, [transcription]);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const queryClient = useQueryClient();

  // Mutation function
  const postChatMessage = async (text) => {
    const token = await getToken();
    const response = await fetch(`${baseUrl}/api/chats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to post chat message: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    return data._id;
  };

  // Mutation hook
  const createChatMutation = useMutation({
    mutationFn: postChatMessage,
    onSuccess: async (id) => {
      // Invalidate the userChats query
      await queryClient.invalidateQueries({ queryKey: ["userChats", userId] });

      // Optionally, you can also refetch the query immediately (if you want to be extra sure)
      await queryClient.refetchQueries({ queryKey: ["userChats", userId] });

      setQuestion("");
      setTextareaHasText(false);
      setTranscription("");
      setShowTranscription(false);
      setShowSendClear(false);
      setImg({ isLoading: false, error: "", dbData: {}, aiData: {} });
      setErrorMessage(null);
      scrollToBottom();
      navigate(`/dashboard/chats/${id}`);
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      setErrorMessage(error.message);
    },
    onSettled: () => {
      setGenerating(false);
    },
  });

  const handleChange = (e) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + "px";
    setQuestion(e.target.value);
    setTextareaHasText(e.target.value.length > 0);
  };

  const add = (imageData = null) => {
    setShowTranscription(false);
    setShowSendClear(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question && !img.aiData.inlineData) return;
    createChatMutation.mutate(question);
  };

  const handleClear = () => {
    setQuestion("");
    setTextareaHasText(false);
    setTranscription("");
    setShowTranscription(false);
    setShowSendClear(false);
  };

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
          </div>
        </div>
      </div>
      <div className="formContainer">
        {errorMessage && (
          <div className="error-message" style={{ color: "red" }}>
            {errorMessage}
          </div>
        )}
        {showTranscription && (
          <div className="message user">{transcription}</div>
        )}
        {img.isLoading || generating ? <div>Loading ....</div> : null}
        {img.dbData?.filePath && (
          <IKImage
            urlEndpoint={import.meta.env.VITE_IMAGE_KIt_ENDPOINT}
            path={img.dbData?.filePath}
            width={300}
            transformation={[{ width: 300 }]}
          />
        )}
        <div className="endChat" ref={endRef}></div>
        <form className="newForm" onSubmit={handleSubmit}>
          <Upload setImg={setImg} />
          <input type="file" name="file" multiple={false} hidden />
          <textarea
            type="text"
            name="text"
            placeholder="Ask me anything...."
            value={question}
            onChange={handleChange}
          />
          {!textareaHasText && !showSendClear && (
            <AudioRecorder
              setQuestion={setQuestion}
              add={add}
              transcription={transcription}
              setTranscription={setTranscription}
              setShowSendClear={setShowSendClear}
            />
          )}
          {(textareaHasText || showSendClear) && (
            <div className="send-clear-buttons">
              <button type="button" onClick={handleSubmit}>
                <img src="/arrow.png" alt="Send" />
              </button>
              {showTranscription && (
                <button type="button" onClick={handleClear}>
                  Clear
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
