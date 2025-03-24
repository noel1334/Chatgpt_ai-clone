import React, { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import NewPrompt from "../../component/newPrompt/NewPrompt";
import "./chat.css";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import Markdown from "react-markdown";
import { IKImage } from "imagekitio-react";
import CodeBlock from "../../component/CodeBlock/CodeBlock"; // Import CodeBlock component

const Chat = () => {
  const baseUrl = import.meta.env.VITE_REACT_APP_BASE_URL;
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const path = useLocation().pathname;
  const chatId = path.split("/").pop();
  const chatContainerRef = useRef(null);
  const endRef = useRef(null); // ADDED: Ref for the end of chat
  const [hasInitialScroll, setHasInitialScroll] = useState(false);

  useEffect(() => {
    if (!chatId) {
    }
  }, [chatId]);

  const { isPending, error, data, refetch } = useQuery({
    queryKey: ["chat", chatId],
    enabled: isLoaded && isSignedIn && !!chatId,
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error("No token available");
      }
      const response = await fetch(`${baseUrl}/api/chats/${chatId}`, {
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
      try {
        const chatData = await response.json();
        return chatData;
      } catch (jsonError) {
        throw new Error(`Failed to parse JSON: ${jsonError.message}`);
      }
    },
    initialData: { history: [] },
  });

  const scrollToBottom = useCallback(() => {
    // Use scrollIntoView on the endRef
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    // Reset hasInitialScroll when the chatId changes
    setHasInitialScroll(false);
    if (chatId) {
      refetch();
    }
  }, [chatId, refetch]);

  useEffect(() => {
    // Scroll to bottom ONLY ONCE after initial load and if there's history
    if (data?.history && data.history.length > 0 && !hasInitialScroll) {
      scrollToBottom();
      setHasInitialScroll(true); // Prevent subsequent scrolls on data updates
    }
  }, [data, data?.history, hasInitialScroll, scrollToBottom]);

  // Code block detection and splitting functions (moved from NewPrompt)
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

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Something went wrong: {error.message}</div>;
  }

  return (
    <div className="chats">
      <div className="wrapper">
        <div className="chat" ref={chatContainerRef}>
          {data?.history?.map((message, index) => {
            const processedParts = splitTextAndCode(message.parts[0].text);

            return (
              <React.Fragment key={index}>
                {message.img && (
                  <IKImage
                    urlEndpoint={import.meta.env.VITE_IMAGE_KIt_ENDPOINT}
                    path={message.img}
                    height={300}
                    width={300}
                    transformation={[{ width: 300, height: 300 }]}
                    loading="lazy"
                    lqip={{ active: true, quality: 20 }}
                  />
                )}

                {processedParts.map((part, partIndex) => {
                  if (part.type === "text") {
                    return (
                      <div
                        key={`${index}-${partIndex}`}
                        className={
                          message.role === "user" ? "message user" : "message"
                        }
                      >
                        <Markdown>{part.content}</Markdown>
                      </div>
                    );
                  } else if (part.type === "code") {
                    return (
                      <div
                        key={`${index}-${partIndex}`}
                        className="message code-block"
                      >
                        <CodeBlock code={part.content} language={part.lang} />
                      </div>
                    );
                  }
                  return null;
                })}
              </React.Fragment>
            );
          })}
          {/* ADDED: The endRef element INSIDE the chat container */}
          <div ref={endRef} />
          {data && (
            <NewPrompt data={data} scrollChatToBottom={scrollToBottom} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
