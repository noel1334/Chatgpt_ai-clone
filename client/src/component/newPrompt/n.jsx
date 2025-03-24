import React, { useEffect, useRef, useState } from "react";
import "./newPrompt.css";
import Upload from "../upload/Upload";
import { IKImage } from "imagekitio-react";
import model from "../../lib/gemini";
import Markdown from "react-markdown";
import AudioRecorder from "../audioRecorder/AudioRecorder";
import CodeBlock from "../CodeBlock/CodeBlock";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";

const NewPrompt = ({ data, scrollChatToBottom }) => {
  // Receive data and scrollChatToBottom callback
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
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
  const formRef = useRef(null);
  const [textareaHasText, setTextareaHasText] = useState(false);
  const [showSendClear, setShowSendClear] = useState(false);
  const baseUrl = import.meta.env.VITE_REACT_APP_BASE_URL;
  const [errorMessage, setErrorMessage] = useState(null);
  const { getToken, userId } = useAuth();

  const queryClient = useQueryClient();

  const postChatMessage = async ({ chatId, question, answer, img }) => {
    // Accept 'data' argument
    const token = await getToken();
    const url = `${baseUrl}/api/chats/${chatId}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        question: question.length ? question : undefined,
        answer,
        img: img?.filePath || undefined,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to post chat message: ${response.status} - ${errorText}`
      );
    }

    return response.json();
  };

  const createChatMutation = useMutation({
    mutationFn: postChatMessage,
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ["chat", data._id] });
      // Snapshot the previous value
      const previousChat = queryClient.getQueryData(["chat", data._id]);
      // Optimistically update to the new value
      queryClient.setQueryData(["chat", data._id], (old) => ({
        ...old,
        history: [
          ...old.history,
          {
            role: "user",
            parts: [{ text: question }],
            img: img.dbData?.filePath || undefined,
          },
          {
            role: "model",
            parts: [{ text: newData.answer }],
          },
        ],
      }));

      // Return a context object with the snapshotted value
      return { previousChat };
    },
    onError: (err, newData, context) => {
      console.error("Mutation error:", err);
      // If the mutation fails, use the context-value to roll back
      queryClient.setQueryData(["chat", data._id], context.previousChat);
      setErrorMessage(error.message);
    },
    onSettled: () => {
      // Always refetch after error or success:
      queryClient.invalidateQueries({ queryKey: ["chat", data._id] });
      setGenerating(false);

      setQuestion("");
      setTextareaHasText(false);
      setTranscription("");
      setShowTranscription(false);
      setShowSendClear(false); // hide the icons
      setAnswer(""); //Reset the answer state.
      formRef.current.reset();
      setImg({
        isLoading: false,
        error: "",
        dbData: {},
        aiData: {},
      });
    },
  });

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

  const add = async (text, imageData = null) => {
    accumulatedTextRef.current = "";
    setShowTranscription(false);
    setGenerating(true);

    let messageContent = `Provide a complete answer including all relevant information: ${text}`;
    let parts = [{ text: messageContent }];

    if (imageData) {
      parts = [
        { text: messageContent },
        {
          inlineData: {
            data: imageData.data,
            mimeType: imageData.mimeType,
          },
        },
      ];
    }

    try {
      const result = await chat.current.sendMessageStream(parts);

      let fullAnswer = "";
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullAnswer += chunkText;
        setAnswer(fullAnswer);
      }
      //createChatMutation.mutate(data);
      createChatMutation.mutate({
        chatId: data._id,
        question: text,
        answer: fullAnswer,
        img: img.dbData,
      });
    } catch (error) {
      console.error("Gemini API error:", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const text = question;

    if (!text && !img.aiData.inlineData) return;

    add(text, img.aiData.inlineData);
  };

  const handleChange = (e) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    setQuestion(e.target.value);
    setTextareaHasText(e.target.value.length > 0);
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

  const handleClear = () => {
    setQuestion(""); // reset question
    setTextareaHasText(false); //reset boolean
    setTranscription(""); //clear transcription
    setShowTranscription(false); //hide transcription
    setShowSendClear(false); // hide the icons
  };

  useEffect(() => {
    scrollChatToBottom();
  }, [answer, scrollChatToBottom]);

  return (
    <>
      {/* add new chat */}
      {img.isLoading || generating ? <div>Loading ....</div> : null}
      {img.dbData?.filePath && (
        <IKImage
          urlEndpoint={import.meta.env.VITE_IMAGE_KIt_ENDPOINT}
          path={img.dbData?.filePath}
          width={300}
          height={300}
          transformation={[{ width: 300 }]}
          loading="lazy"
        />
      )}
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
      <form className="newForm" onSubmit={handleSubmit} ref={formRef}>
        {/* Pass scrollChatToBottom HERE */}
        <Upload setImg={setImg} scrollChatToBottom={scrollChatToBottom} />
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
            <button
              type="submit"
              disabled={img.isLoading || generating}
              className={img.isLoading || generating ? "disabled-button" : ""}
            >
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
    </>
  );
};

export default NewPrompt;
