// CodeBlock.jsx
import React, { useState, useRef, useEffect } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/hljs";
import copy from "copy-to-clipboard";

const CodeBlock = ({ code, language }) => {
  const [buttonText, setButtonText] = useState("Copy code");
  const preRef = useRef(null);
  const codeBlockId = useRef(
    `codeblock-${Math.random().toString(36).substring(2, 15)}`
  ).current;

  const copyToClipboard = () => {
    const codeElement = document.getElementById(codeBlockId);

    if (codeElement) {
      const codeText = codeElement.innerText || codeElement.textContent || "";

      try {
        copy(codeText);
        setButtonText("Copied!");
        setTimeout(() => setButtonText("Copy code"), 3000);
      } catch (err) {
        console.error("Failed to copy code: ", err);
        setButtonText("Copy failed");
      }
    } else {
      console.error("Code element not found!");
    }
  };

  return (
    <div className="code-block">
      <SyntaxHighlighter
        language={language}
        style={dracula}
        ref={preRef}
        id={codeBlockId}
      >
        {code}
      </SyntaxHighlighter>
      <button onClick={copyToClipboard}>{buttonText}</button>
    </div>
  );
};

export default CodeBlock;
