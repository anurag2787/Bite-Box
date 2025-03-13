'use client'
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { useDarkMode } from "../DarkModeContext";

function Chat() {
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
  const [input, setInput] = useState("");
  const [ready, setReady] = useState(false);
  const [answer, setAnswer] = useState("");
  const [history, setHistory] = useState([]);
  const chatEndRef = useRef(null);
  const historyRef = useRef([]);
  const [quickoption, setQuickoption] = useState(true)
  const [chatbotheader, setChatbotheader] = useState(true)
  const [count, setCount] = useState(0);
  const { darkMode } = useDarkMode()
  

  // More conversational and flexible system prompts
  const SYSTEM_PROMPTS = [
    "You are BiteBox AI, a friendly and professional culinary assistant.",
    "Engage in natural conversation while being helpful and informative.",
    "Use markdown for formatting and emojis for a friendly tone.",
    "You can discuss a wide range of topics, not just cooking, but always be ready to provide culinary insights.",
    "Use emojis to add warmth to your communication when appropriate.",
    "Start conversations casually and be adaptable to the user's tone.",
    "If a user asks about cooking, provide helpful and engaging advice.",
    "Your responses should feel like talking to a knowledgeable friend who loves food."
  ];

  const cleanResponse = (responseText) => {
    // Remove any leading asterisks or colons
    let cleaned = responseText.replace(/^[\*:]+/, '').trim();

    // Ensure the first letter is capitalized
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  };

  const generateInitialGreeting = () => {
    const greetings = [
      "Hey there! 👋 I'm BiteBox AI, your culinary companion. How can I help you today ?",
      "Hi! 🍳 Welcome to BiteBox AI. I'm here to chat about anything food-related or just have a friendly conversation!",
      "Hello! 🥘 Ready to explore some culinary magic or just have a chat? I'm all ears!"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  useEffect(() => {
    setAnswer("Initializing BiteBox AI...");

    const p1 = SYSTEM_PROMPTS.join(" ") +
      " Prepare to interact naturally with the user.";
    const p3 = "Acknowledge your role and be ready for a friendly, helpful conversation.";

    async function generateInitial() {
      try {
        const response = await axios({
          url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_API_KEY}`,
          method: "post",
          headers: { "Content-Type": "application/json" },
          data: {
            contents: [{ role: "user", parts: [{ text: p1 }] }],
          },
        });

        const botResponse = cleanResponse(
          response.data.candidates[0].content.parts[0].text
        );
        historyRef.current.push(
          { role: "user", text: p1 },
          { role: "bot", text: botResponse }
        );

        await generateInitial3();
      } catch (error) {
        console.error("Initialization error:", error);
        setAnswer("Failed to initialize. Please try again.");
      }
    }

    async function generateInitial3() {
      const prompt = `${historyRef.current
        .map((entry) => `${entry.role}: ${entry.text}`)
        .join("\n")}\nUser: ${p3}`;
      try {
        const response = await axios({
          url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_API_KEY}`,
          method: "post",
          headers: { "Content-Type": "application/json" },
          data: {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          },
        });

        const botResponse = cleanResponse(
          response.data.candidates[0].content.parts[0].text
        );
        historyRef.current.push(
          { role: "user", text: p3 },
          { role: "bot", text: generateInitialGreeting() }
        );

        setHistory([...historyRef.current]);
        setInput("");
        setAnswer("Ready to chat!");
        setReady(true);
      } catch (error) {
        console.error("Initialization error:", error);
        setAnswer("Failed to initialize. Please try again.");
      }
    }

    generateInitial();
  }, []);



  //function for quick option
  async function handleDivClick(message) {
    // Set the clicked message to input
    // console.log(message);  
    setInput(message);
    // setQuickoption(false);
    await handleSendMessage(message);

  }
  

  async function handleSendMessage(inputMessage = null) {
    // console.log(count);
    const messageToSend = (inputMessage || input || "").toString();    
    setQuickoption(false);
    if (!ready) {
      alert("Please wait while the AI is preparing...");
      return;
    }

    if (!messageToSend) {
      alert("Please enter a message before sending.");
      return;
    }

    setAnswer("");

    // Generate the conversational prompt
    const prompt = `Conversation Context:
  ${history
        .map((entry) => `${entry.role}: ${entry.text}`)
        .join("\n")}
  User: ${messageToSend}
  
  Respond in a friendly, natural manner. Use markdown for formatting if needed. Add emojis to make the conversation engaging.`;

    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_API_KEY}`,
        method: "post",
        headers: { "Content-Type": "application/json" },
        data: {
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        },
      });

      const botResponse = cleanResponse(
        response.data.candidates[0].content.parts[0].text
        
      );
      console.log(response);
      setHistory((prevHistory) => [
        ...prevHistory,
        { role: "user", text: messageToSend },
        { role: "bot", text: botResponse },
      ]);

      setInput(""); // Clear the input after sending the message
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setCount(count+1);
      if (count == 1) {
        setChatbotheader(false)
      }
    } catch (error) {
      setAnswer("An error occurred. Please try again.");
      alert("Something went wrong. Please rephrase your request.");
    }
    
  }


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  // Enhanced markdown components for professional rendering
  const MarkdownComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={materialDark}
          language={match[1]}
          PreTag="div"
          className="rounded-lg overflow-x-auto"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code
          className={`${className} bg-gray-100 text-red-600 px-1 rounded`}
          {...props}
        >
          {children}
        </code>
      );
    },
    strong: ({ children }) => (
      <strong className="font-bold text-emerald-700">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic text-emerald-600">{children}</em>
    ),
    h1: ({ children }) => (
      <h1 className="text-2xl font-bold text-emerald-700 mb-4 border-b pb-2">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-semibold text-emerald-600 mb-3 border-b pb-1">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-medium text-emerald-500 mb-2">{children}</h3>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside mb-3 pl-4 space-y-1">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside mb-3 pl-4 space-y-1">{children}</ol>
    ),
    p: ({ children }) => (
      <p className=" leading-relaxed">{children}</p>
    ),
    a: ({ node, ...props }) => (
      <a
        {...props}
        className="text-emerald-600 hover:underline hover:text-emerald-800"
        target="_blank"
        rel="noopener noreferrer"
      />
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-emerald-500 pl-4 py-2 my-4 bg-gray-50 italic">
        {children}
      </blockquote>
    ),
  };

  return (
    <div className={`w-full h-[92vh] flex flex-col ${darkMode ? "bg-gray-900 " : "bg-gray-100"} relative`}>
      {/* Header */}
      {chatbotheader ?
        (<div className="fixed w-full sm:w-[80vh] z-50">
          <header className="bg-emerald-600 text-white p-4 pr-4 pl-4 sm:pr-10 sm:pl-10 shadow-md flex justify-between items-center w-[95%] sm:w-[80%] mx-auto mt-3 mb-6 rounded-full">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">BiteBox AI</h1>
              <p className="text-xs sm:text-sm text-white/80">Your Culinary Companion</p>
            </div>
            <div className="text-xs sm:text-sm text-white/80">Powered by Gemini</div>
          </header>
        </div>)
        : null}

      {/* Chat Container */}
      <div className={`flex-1 overflow-y-auto p-6 mt-4 space-y-4`}>
        {history.length > 2 &&
          history.slice(4).map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                }`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl shadow-md ${message.role === "user"
                  ? `${darkMode ? "bg-emerald-700" : "bg-emerald-500"} text-white`
                  : ` border ${darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-800"}`
                  }`}
              >
                <ReactMarkdown
                  components={MarkdownComponents}
                  remarkPlugins={[remarkGfm]}
                  className="prose max-w-full"
                >
                  {message.text}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className={`${darkMode ? "bg-gray-950 " : "bg-white border-t"} p-4 shadow-inner`}>
      {quickoption ? (
        <div className={` ${darkMode ? "text-white" : "text-black"} flex flex-col justify-center items-center`}>
          <div className="text-black w-full px-2">
            <div className="flex items-center justify-center">
              <h2 className={`${darkMode ? "text-white" : "text-black"} font-bold text-base sm:text-xl mb-3 text-center`}>
                Feeling Hungry? Here Are Some Quick Options! 🍔🍕
              </h2>
            </div>
            <div className="flex flex-wrap items-center justify-center space-x-2 sm:space-x-3 text-xs">
              <div
                className={`border border-gray-400 ${darkMode ? "bg-gray-300 " : null} p-2 rounded-full transition ease-in-out hover:scale-105 hover:bg-yellow-100 hover:border-2 mb-2`}
                onClick={() => handleDivClick("Feeling spicy 🌶️. Any ideas?")}
              >
                Craving dessert 🍰. Quick recipe?
              </div>
              <div
                className={`border border-gray-400 ${darkMode ? "bg-gray-300 " : null} p-2 rounded-full transition ease-in-out hover:scale-105 hover:bg-yellow-100 hover:border-2 mb-2`}
                onClick={() => handleDivClick("Got rice and veggies. What to cook?")}
              >
                Got rice and veggies. What to cook?
              </div>
              <div
                className={`border border-gray-400 ${darkMode ? "bg-gray-300 " : null} p-2 rounded-full transition ease-in-out hover:scale-105 hover:bg-yellow-100 hover:border-2 mb-2`}
                onClick={() => handleDivClick("Dish to impress family?")}
              >
                Dish to impress family?
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center space-x-2 sm:space-x-3 text-xs">
              <div
                className={`border border-gray-400 ${darkMode ? "bg-gray-300 " : null} p-2 rounded-full transition ease-in-out hover:scale-105 hover:bg-yellow-100 hover:border-2 mb-2`}
                onClick={() => handleDivClick("Suggest something unique to try!")}
              >
                Suggest something unique to try!
              </div>
              <div
                className={`border border-gray-400 ${darkMode ? "bg-gray-300 " : null} p-2 rounded-full transition ease-in-out hover:scale-105 hover:bg-yellow-100 hover:border-2 mb-2`}
                onClick={() => handleDivClick("Quick 10-min snack?")}
              >
                Quick 10-min snack?
              </div>
            </div>
          </div>
        </div>
      ) : null}

        <div className="flex space-x-4 max-w-4xl mx-auto">
          <input
            type="text"
            className="flex-1 p-3 border text-black  border-gray-400 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all"
            placeholder="Ask me anything about food, cooking, or just chat! 🍽️"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors"
          >
            Send
          </button>
        </div>
        {answer && (
          <p className="text-center text-sm text-gray-500 mt-2">{answer}</p>
        )}
      </div>
    </div>
  );
}

export default Chat;


