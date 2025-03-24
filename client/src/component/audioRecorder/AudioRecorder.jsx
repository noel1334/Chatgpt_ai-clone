import { useState, useEffect, useRef, useCallback } from "react";

const AudioRecorder = ({
  setQuestion,
  add,
  transcription,
  setTranscription,
  setShowSendClear,
}) => {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [socket, setSocket] = useState(null);
  const [listening, setListening] = useState(false);

  const recognition = useRef(null);

  useEffect(() => {
    const getMicrophone = async () => {
      try {
        // **Request Microphone Permission**
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (event) => {
          setAudioChunks((prev) => [...prev, event.data]);
        };

        recorder.onstop = () => {};

        setMediaRecorder(recorder);
      } catch (error) {
        console.log("getUserMedia error handler executed"); // Log inside error handler
        console.error("Error accessing microphone:", error);
        // **Handle Permission Denied Error**
        if (
          error.name === "NotAllowedError" ||
          error.name === "PermissionDeniedError"
        ) {
          alert(
            "Microphone access denied. Please check your browser settings."
          );
        }
      } finally {
        // console.log("getUserMedia finished (try/catch/finally)");
      }
    };

    getMicrophone();

    return () => {
      if (mediaRecorder) {
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      }
      if (socket) {
        socket.close();
      }
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.binaryType = "arraybuffer";
    }
  }, [socket]);

  useEffect(() => {
    // Send audio data to WebSocket when available
    if (socket && audioChunks.length > 0 && !isRecording) {
      const blob = new Blob(audioChunks, { type: "audio/webm" });
      blob.arrayBuffer().then((buffer) => {
        if (socket.readyState === WebSocket.OPEN) {
          // Check if the socket is open
          socket.send(buffer);
        } else {
          console.warn("WebSocket is not open. Audio data not sent.");
        }
        setAudioChunks([]);
      });
    }
  }, [audioChunks, socket, isRecording]);

  useEffect(() => {
    if (audioChunks.length > 0 && !isRecording) {
      const blob = new Blob(audioChunks, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    }
  }, [audioChunks, isRecording]);

  const startRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "inactive") {
      setAudioChunks([]);
      mediaRecorder.start();
      setIsRecording(true);
      startTranscribing();
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setIsRecording(false);
      stopTranscribing();
      setShowSendClear(true);
      setQuestion(transcription);
    }
  };

  const startTranscribing = () => {
    setTranscription("");
    recognition.current =
      new webkitSpeechRecognition() || new SpeechRecognition();
    recognition.current.continuous = true;
    recognition.current.interimResults = true;
    recognition.current.lang = "en-US";

    recognition.current.onstart = () => {
      setListening(true);
    };

    recognition.current.onresult = (event) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        interimTranscript += event.results[i][0].transcript;
      }
      setTranscription(interimTranscript);
    };

    recognition.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
    };

    recognition.current.onend = () => {
      setListening(false);
    };

    recognition.current.start();
    setListening(true);
  };

  const stopTranscribing = useCallback(() => {
    if (recognition.current) {
      setListening(false);
      recognition.current.stop();
    }
    //stop audio from playing again
    recognition.current = null;
  }, [setQuestion, transcription, add]);

  // useEffect(() => { // REMOVE THIS ENTIRE EFFECT
  //   if (!isRecording && listening) {
  //     stopTranscribing();
  //     recognition.current =
  //       new webkitSpeechRecognition() || new SpeechRecognition();
  //   }
  // }, [isRecording, listening]);

  return (
    <div>
      {isRecording ? (
        <button onClick={stopRecording} disabled={!isRecording}>
          <span>🛑</span>
        </button>
      ) : (
        <button onClick={startRecording} disabled={isRecording}>
          <span>🎤</span>
        </button>
      )}
    </div>
  );
};

export default AudioRecorder;
