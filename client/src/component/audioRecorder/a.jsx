import { useState, useEffect, useRef, useCallback } from "react";

const AudioRecorder = ({
  setQuestion,
  add,
  transcription,
  setTranscription,
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
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const recorder = new MediaRecorder(stream);

        recorder.ondataavailable = (event) => {
          setAudioChunks((prev) => [...prev, event.data]);
        };

        recorder.onstop = () => {
          console.log("Recording stopped");
        };

        setMediaRecorder(recorder);
      } catch (error) {
        console.error("Error accessing microphone:", error);
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
      socket.binaryType = "arraybuffer"; // Very important for audio data!
    }
  }, [socket]);

  useEffect(() => {
    // Connect to the WebSocket server
    const newSocket = new WebSocket("ws://localhost:3000");

    newSocket.onopen = () => {
      console.log("WebSocket connected");
      setSocket(newSocket); // Store the socket in state when connected
    };

    newSocket.onclose = () => {
      console.log("WebSocket disconnected");
      setSocket(null); // Clear the socket state
    };

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setSocket(newSocket); // Initial socket setup

    return () => {
      if (newSocket) {
        // Check if socket exists before closing
        newSocket.close();
      }
    };
  }, []);

  useEffect(() => {
    // Send audio data to WebSocket when available
    if (socket && audioChunks.length > 0 && !isRecording) {
      const blob = new Blob(audioChunks, { type: "audio/webm" });
      blob.arrayBuffer().then((buffer) => {
        if (socket.readyState === WebSocket.OPEN) {
          // Check if the socket is open
          socket.send(buffer);
          console.log("Audio data sent to WebSocket");
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
      console.log("Recording started");
      startTranscribing();
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setIsRecording(false);
      console.log("Recording stopped");
      stopTranscribing();
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
      console.log("Speech recognition started");
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
      console.log("Speech recognition ended");
      setListening(false);
    };

    recognition.current.start();
    setListening(true);
  };

  useEffect(() => {
    if (!isRecording && listening) {
      stopTranscribing();
      recognition.current =
        new webkitSpeechRecognition() || new SpeechRecognition();
    }
  }, [isRecording, listening]);

  const stopTranscribing = useCallback(() => {
    if (recognition.current) {
      setListening(false);
      recognition.current.stop();
    }
    setQuestion(transcription);
    add(transcription);
    recognition.current = null;
  }, [setQuestion, transcription, add]);

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
