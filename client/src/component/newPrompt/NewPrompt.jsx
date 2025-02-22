import { useEffect, useRef, useState } from "react";
import "./newPrompt.css";
import Upload from "../upload/Upload";
import { IKImage } from "imagekitio-react";
import model from "../../lib/gemini";
import Markdown from "react-markdown";
import AudioRecorder from "../audioRecorder/AudioRecorder";

const NewPrompt = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const endRef = useRef(null);
  const [img, setImg] = useState({
    isLoading: false,
    error: "",
    dbData: {},
    aiData: {},
  });
  const [transcription, setTranscription] = useState("");
  const [showTranscription, setShowTranscription] = useState(true);
  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "Hello" }],
      },
      {
        role: "model",
        parts: [{ text: "Great to meet you. What would you like to know?" }],
      },
    ],
    generationConfig: {
      // maxOutputTokens: 1000
    },
  });

  useEffect(() => {
    endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [question, answer, img.dbData]);

  const accumulatedTextRef = useRef("");

  const add = async (text) => {
    setQuestion(text);
    accumulatedTextRef.current = "";
    setShowTranscription(false);

    const result = await chat.sendMessageStream(
      Object.entries(img.aiData).length ? [img.aiData, text] : [text]
    );

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      accumulatedTextRef.current += chunkText;

      // Update the state only periodically (e.g., every N characters or after a small delay)
      setAnswer(accumulatedTextRef.current);
    }
    setImg({ isLoading: false, error: "", dbData: {}, aiData: {} });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = e.target.text.value;
    if (!text) return;
    add(text);
  };

  return (
    <>
      {/* add new chat */}
      {img.isLoading && <div>Loading ....</div>}
      {img.dbData?.filePath && (
        <IKImage
          urlEndpoint={import.meta.env.VITE_IMAGE_KIt_ENDPOINT}
          path={img.dbData?.filePath}
          width={300}
          transformation={[{ width: 300 }]}
        />
      )}
      {question && <div className="message user"> {question}</div>}
      {answer && (
        <div className="message">
          <Markdown>{answer}</Markdown>
        </div>
      )}
      {showTranscription && <div className="message ">{transcription}</div>}{" "}
      {/* Conditionally render based on showTranscription */}
      <div className="endChat" ref={endRef}></div>
      <form className="newForm" onSubmit={handleSubmit}>
        <Upload setImg={setImg} />
        <AudioRecorder
          setQuestion={setQuestion}
          add={add}
          transcription={transcription}
          setTranscription={setTranscription}
        />
        <input type="file" name="file" multiple={false} hidden />
        <input type="text" name="text" placeholder="Ask me anything...." />
        <button>
          <img src="/arrow.png" alt="" />
        </button>
      </form>
    </>
  );
};

export default NewPrompt;
