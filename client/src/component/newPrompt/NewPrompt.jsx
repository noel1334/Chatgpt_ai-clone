// NewPrompt.jsx
import React, { useEffect, useRef, useState } from "react";
import "./newPrompt.css";
import Upload from "../upload/Upload";
import { IKImage } from "imagekitio-react";
import model from "../../lib/gemini";
import Markdown from "react-markdown";
import AudioRecorder from "../audioRecorder/AudioRecorder";
import CodeBlock from "../../component/CodeBlock/CodeBlock";

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
  const [generating, setGenerating] = useState(false);
  const chat = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [question, answer, img.dbData]);

  useEffect(() => {
    chat.current = model.startChat({
      history: [
        {
          role: "user",
          parts: [
            {
              text: "Hello.  I would like comprehensive and well-explained answers.",
            },
          ],
        },
        {
          role: "model",
          parts: [{ text: "Great to meet you. What would you like to know?" }],
        },
      ],
      generationConfig: {
        // maxOutputTokens: 8000,
        temperature: 0.7,
      },
    });
  }, []);

  const accumulatedTextRef = useRef("");

  const add = async (text) => {
    setQuestion(text);
    accumulatedTextRef.current = "";
    setShowTranscription(false);
    setGenerating(true); // Start loading

    try {
      const result = await chat.current.sendMessageStream([
        `Provide a complete answer including all relevant information: ${text}`,
      ]);

      let fullAnswer = ""; // Accumulate complete answer
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullAnswer += chunkText;
        setAnswer(fullAnswer);
      }
    } catch (error) {
      console.error("Gemini API error:", error);
    } finally {
      setGenerating(false);
    }
    setImg({ isLoading: false, error: "", dbData: {}, aiData: {} });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const text = form.elements.text.value;

    if (!text) return;
    add(text);
  };

  const handleChange = (e) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + "px";
  };

  const detectCode = (text) => {
    const codeRegex = /```([a-zA-Z0-9+#-]+)?\n([\s\S]*?)```/g;
    let matches = [];
    let lastIndex = 0;
    let match;

    while ((match = codeRegex.exec(text)) !== null) {
      const fullMatchIndex = match.index;
      matches.push({
        lang: match[1] || "javascript",
        code: match[2].trim(),
        index: fullMatchIndex,
        length: match[0].length,
      });
      lastIndex = fullMatchIndex + match[0].length;
      codeRegex.lastIndex = lastIndex;
    }

    return matches;
  };

  const splitTextAndCode = (text) => {
    const codeBlocks = detectCode(text);
    const segments = [];
    let currentIndex = 0;

    codeBlocks.forEach((codeBlock) => {
      if (codeBlock.index > currentIndex) {
        segments.push({
          type: "text",
          content: text.substring(currentIndex, codeBlock.index).trim(),
        });
      }
      segments.push({
        type: "code",
        lang: codeBlock.lang,
        content: codeBlock.code,
      });
      currentIndex = codeBlock.index + codeBlock.length;
    });

    if (currentIndex < text.length) {
      segments.push({
        type: "text",
        content: text.substring(currentIndex).trim(),
      });
    }

    return segments;
  };

  return (
    <>
      {/* add new chat */}
      {img.isLoading || generating ? <div>Loading ....</div> : null}
      {img.dbData?.filePath && (
        <IKImage
          urlEndpoint={import.meta.env.VITE_IMAGE_KIt_ENDPOINT}
          path={img.dbData?.filePath}
          width={300}
          transformation={[{ width: 300 }]}
        />
      )}
      {question && <div className="message user"> {question}</div>}
      {answer &&
        splitTextAndCode(answer).map((segment, index) => {
          if (segment.type === "text") {
            return (
              <div key={index} className="message">
                <Markdown>{segment.content}</Markdown>
              </div>
            );
          } else if (segment.type === "code") {
            return (
              <>
                <div key={index} className="message code-block">
                  <CodeBlock code={segment.content} language={segment.lang} />
                </div>
              </>
            );
          }
          return null;
        })}

      {showTranscription && <div className="message ">{transcription}</div>}
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
        <textarea
          type="text"
          name="text"
          placeholder="Ask me anything...."
          onChange={handleChange}
        />
        <button>
          <img src="/arrow.png" alt="" />
        </button>
      </form>
    </>
  );
};

export default NewPrompt;
