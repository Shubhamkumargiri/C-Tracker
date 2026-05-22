import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import './CTAI.css';
import { getSavedGithubUsername, getSavedLeetcodeUsername, getSavedDevpostUsername } from '../lib/integrations';

const CTAI = ({ onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth;
    }
    return 1200;
  });

  const [width, setWidth] = useState(() => {
    if (typeof window !== "undefined") {
      return parseInt(localStorage.getItem('ctai-width')) || 400;
    }
    return 400;
  });

  const [orbPosition, setOrbPosition] = useState(() => {
    if (typeof window !== "undefined") {
      const savedX = localStorage.getItem('ctai-orb-x');
      const savedY = localStorage.getItem('ctai-orb-y');
      if (savedX !== null && savedY !== null) {
        const x = parseInt(savedX);
        const y = parseInt(savedY);
        const orbSize = 60;
        const maxX = window.innerWidth - orbSize - 10;
        const maxY = window.innerHeight - orbSize - 10;
        return {
          x: Math.max(10, Math.min(x, maxX)),
          y: Math.max(10, Math.min(y, maxY))
        };
      }
    }
    return null; // Will fallback to CSS default bottom-right positioning initially
  });

  const [isDraggingOrb, setIsDraggingOrb] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const [messages, setMessages] = useState([
    { sender: 'ctai', text: 'Hello, I am CT ai. Your personal career assistant. How can I help you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const abortControllerRef = useRef(null);
  
  // To differentiate between clicking and dragging the orb
  const orbDragStartRef = useRef({ startX: 0, startY: 0, offsetX: 0, offsetY: 0, moved: false });

  // Sync state to parent layout
  useEffect(() => {
    if (onChange) {
      onChange({ isOpen, width, isResizing });
    }
  }, [isOpen, width, isResizing, onChange]);

  // Persist sidebar width to localStorage
  useEffect(() => {
    localStorage.setItem('ctai-width', width);
  }, [width]);

  // Persist orb position to localStorage
  useEffect(() => {
    if (orbPosition) {
      localStorage.setItem('ctai-orb-x', orbPosition.x);
      localStorage.setItem('ctai-orb-y', orbPosition.y);
    }
  }, [orbPosition]);

  // Track window width and clamp orb position on window resize to prevent it from going off-screen
  useEffect(() => {
    const handleWindowResize = () => {
      const currentWidth = window.innerWidth;
      setWindowWidth(currentWidth);
      setOrbPosition((prev) => {
        if (!prev) return null;
        const orbSize = 60;
        const maxX = currentWidth - orbSize - 10;
        const maxY = window.innerHeight - orbSize - 10;
        return {
          x: Math.max(10, Math.min(prev.x, maxX)),
          y: Math.max(10, Math.min(prev.y, maxY))
        };
      });
    };
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

  // Dynamically clamp sidebar width when window size changes to prevent dashboard squishing
  useEffect(() => {
    setWidth((prevWidth) => {
      let maxWidth = windowWidth * 0.75; // Default for large screens
      if (windowWidth <= 960) {
        maxWidth = Math.max(320, windowWidth * 0.45); // Limit sidebar to 45% of width on split/medium screens
      }
      if (prevWidth > maxWidth) {
        return Math.floor(maxWidth);
      }
      return prevWidth;
    });
  }, [windowWidth]);

  // Dragging handler for the circular floating orb (FAB)
  const handleOrbDragStart = (e) => {
    e.preventDefault();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const offsetY = clientY - rect.top;
    
    orbDragStartRef.current = { 
      startX: clientX, 
      startY: clientY, 
      offsetX,
      offsetY,
      moved: false 
    };
    
    setIsDraggingOrb(true);

    const handleOrbDragMove = (moveEvent) => {
      const moveX = moveEvent.clientX || (moveEvent.touches && moveEvent.touches[0].clientX);
      const moveY = moveEvent.clientY || (moveEvent.touches && moveEvent.touches[0].clientY);
      
      const dx = moveX - orbDragStartRef.current.startX;
      const dy = moveY - orbDragStartRef.current.startY;
      
      // If moved more than 5px, it's considered a drag gesture instead of a tap click
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        orbDragStartRef.current.moved = true;
      }
      
      let x = moveX - orbDragStartRef.current.offsetX;
      let y = moveY - orbDragStartRef.current.offsetY;
      
      const orbSize = 60; // FAB is 60px x 60px
      x = Math.max(10, Math.min(x, window.innerWidth - orbSize - 10));
      y = Math.max(10, Math.min(y, window.innerHeight - orbSize - 10));
      
      setOrbPosition({ x, y });
    };
    
    const handleOrbDragEnd = () => {
      setIsDraggingOrb(false);
      document.removeEventListener('mousemove', handleOrbDragMove);
      document.removeEventListener('mouseup', handleOrbDragEnd);
      document.removeEventListener('touchmove', handleOrbDragMove);
      document.removeEventListener('touchend', handleOrbDragEnd);
    };
    
    document.addEventListener('mousemove', handleOrbDragMove);
    document.addEventListener('mouseup', handleOrbDragEnd);
    document.addEventListener('touchmove', handleOrbDragMove, { passive: false });
    document.addEventListener('touchend', handleOrbDragEnd);
  };

  // Click handler for opening the CT AI sidebar
  const handleOrbClick = (e) => {
    if (orbDragStartRef.current.moved) {
      e.preventDefault();
      return;
    }
    setIsOpen(!isOpen);
  };

  // Docked Left Boundary Resizer Handler
  const handleResizeStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const startX = clientX;
    const startWidth = width;
    
    setIsResizing(true);

    const handleResizeMove = (moveEvent) => {
      const moveX = moveEvent.clientX || (moveEvent.touches && moveEvent.touches[0].clientX);
      const dx = moveX - startX;
      
      let newWidth = startWidth - dx;
      let maxWidth = windowWidth * 0.75;
      if (windowWidth <= 960) {
        maxWidth = Math.max(320, windowWidth * 0.45);
      }
      newWidth = Math.max(320, Math.min(newWidth, maxWidth));
      setWidth(newWidth);
    };
    
    const handleResizeEnd = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.removeEventListener('touchmove', handleResizeMove);
      document.removeEventListener('touchend', handleResizeEnd);
    };
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
    document.addEventListener('touchmove', handleResizeMove, { passive: false });
    document.addEventListener('touchend', handleResizeEnd);
  };

  // Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        sendMessage(transcript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Samantha') || v.lang === 'en-US');
      if (preferredVoice) utterance.voice = preferredVoice;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const sendMessage = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setInputValue('');

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      const githubUsername = getSavedGithubUsername();
      const leetcodeUsername = getSavedLeetcodeUsername();
      const devpostUsername = getSavedDevpostUsername();
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/ctai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: text,
          context: {
            github: githubUsername,
            leetcode: leetcodeUsername,
            devpost: devpostUsername
          }
        }),
        signal: abortControllerRef.current.signal
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessages((prev) => [...prev, { sender: 'ctai', text: data.reply }]);
        speakText(data.reply);
      } else {
        setMessages((prev) => [...prev, { sender: 'ctai', text: "Sorry, I encountered an error. Please ensure your API key is configured." }]);
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        setMessages((prev) => [...prev, { sender: 'ctai', text: "Generation stopped." }]);
      } else {
        console.error("Error talking to CT ai:", error);
        setMessages((prev) => [...prev, { sender: 'ctai', text: "Network error. I am unable to connect to my servers." }]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopExecution = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  // Render style object dynamically for the FAB based on drag state
  const orbStyle = orbPosition 
    ? {
        position: 'fixed',
        left: `${orbPosition.x}px`,
        top: `${orbPosition.y}px`,
        bottom: 'auto',
        right: 'auto',
        transition: isDraggingOrb ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease, opacity 0.3s ease, visibility 0.3s ease'
      }
    : {};

  // Docked sidebar layout style (always right docked, clamped to screen width)
  const sidebarStyle = {
    position: 'fixed',
    top: 0,
    right: isOpen ? '0' : `-${Math.min(width, windowWidth) + 40}px`,
    width: `${Math.min(width, windowWidth)}px`,
    maxWidth: '100vw',
    height: '100vh',
    zIndex: 1999,
    borderRadius: 0,
    borderTop: 'none',
    borderBottom: 'none',
    borderRight: 'none',
    transition: isResizing ? 'none' : 'right 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
  };

  return (
    <>
      {/* Draggable Circular Floating Orb (FAB) */}
      <div 
        className={`ctai-floating-icon ${isOpen ? 'ctai-icon-hidden' : ''} ${isSpeaking ? 'speaking' : ''} ${isDraggingOrb ? 'ctai-orb-dragging' : ''}`} 
        style={orbStyle}
        onMouseDown={handleOrbDragStart}
        onTouchStart={handleOrbDragStart}
        onClick={handleOrbClick}
        title="Drag me anywhere or Click to open CT ai!"
      >
        <div className="ctai-core"></div>
        <div className="ctai-ring"></div>
        <div className="ctai-ring-2"></div>
      </div>

      {/* Docked CTAI Sidebar Panel (always docked, resizes the screen) */}
      <div 
        className={`ctai-container ctai-docked-mode ${isOpen ? 'ctai-open' : ''}`}
        style={sidebarStyle}
      >
        {/* Resize drag handle (docked mode = left border only) */}
        <div 
          className="ctai-resize-handle ctai-resize-handle-left"
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
        />

        {/* CTAI Sidebar Header */}
        <div className="ctai-header">
          <div className="ctai-header-title">
            <span className="ctai-logo-dot"></span> CT ai
          </div>
          <div className="ctai-header-actions">
            <button 
              className="ctai-close-btn" 
              onClick={() => setIsOpen(false)}
              title="Close CT ai"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Chat Messages Log Area */}
        <div className="ctai-chat-area">
          {messages.map((msg, index) => (
            <div key={index} className={`ctai-message-wrapper ${msg.sender}`}>
              <div className="ctai-message">
                {msg.sender === 'ctai' ? (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Messaging Input Area */}
        <div className="ctai-input-area">
          <button 
            className={`ctai-mic-btn ${isListening ? 'listening' : ''}`} 
            onClick={toggleListen}
            title="Use Voice Input"
          >
            🎤
          </button>
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask CT ai..."
            className="ctai-input"
            disabled={isLoading}
          />
          {isLoading ? (
            <button className="ctai-stop-btn" onClick={handleStopExecution} title="Stop Response Generation">
              ■
            </button>
          ) : (
            <button className="ctai-send-btn" onClick={() => sendMessage()} disabled={!inputValue.trim()}>
              ➤
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default CTAI;
