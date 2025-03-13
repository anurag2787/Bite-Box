"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useDarkMode } from "../../DarkModeContext";
import { UserAuth } from "../../context/AuthContext";
import { Video, Mic, MicOff, Camera, CameraOff, Settings, Heart, Send, X } from "lucide-react";
import { useRouter } from 'next/navigation';

const StartNewLiveStream = () => {
  const { darkMode } = useDarkMode();
  const { user } = UserAuth();
  const [streamId, setStreamId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [peer, setPeer] = useState(null);
  const [streamData, setStreamData] = useState({
    title: "",
    description: "",
    thumbnail: "",
  });
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isStreamStarted, setIsStreamStarted] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [live,setLive] = useState(null);
  
  const localVideoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const router = useRouter();
  const handleStartStream = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      setIsStreamStarted(true);
    } catch (err) {
      console.error("Failed to Load Stream:", err);
      alert("Failed to access camera/microphone. Please check permissions.");
    } finally {
      setIsLoading(false);
    }
  };

  async function startBroadcast() {
    if (!localStream) {
        alert('Please turn on camera first');
        return;
    }

    try {
        const newPeer = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.stunprotocol.org" }]
        });

        // Handle ICE candidates
        newPeer.onicecandidate = async (event) => {
            if (event.candidate) {
                // You might want to send candidates to the server if needed
            }
        };

        localStream.getTracks().forEach(track => newPeer.addTrack(track, localStream));

        newPeer.onnegotiationneeded = async () => {
            const offer = await newPeer.createOffer();
            await newPeer.setLocalDescription(offer);

            const payload = { sdp: newPeer.localDescription };
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API}/broadcast`, payload);

            // setStreamId(data.streamId);
            console.log(data.streamId);
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/streams`, {
              userId: user.email,
              username: user.email,
              title: streamData.title,
              description: streamData.description,
              thumbnail: streamData.thumbnail,
              streamId : data.streamId,
            });
            setStreamId(data.streamId);
            setPeer(newPeer);

            const desc = new RTCSessionDescription(data.sdp);
            await newPeer.setRemoteDescription(desc);
        };
        setLive(true)
    } catch (error) {
        console.error('Broadcast error:', error);
    }
}

  const handleEndStream = async () => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/streams/${streamId}/end`);
      
      // Stop all tracks
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      await stopBroadcast();
      
      setIsStreamStarted(false);
      // Redirect to home page using Next.js router
      router.push('/streams');
    } catch (err) {
      console.error("Failed to end stream:", err);
    }
  };


  const stopBroadcast = () => {
    if (peer) {
      peer.close();
      setPeer(null);
    }
    setStreamId(null);
  };

  const toggleMicrophone = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMicEnabled;
        setIsMicEnabled(!isMicEnabled);
      }
    }
  };

  const toggleCamera = async () => {
    if (isCameraOn) {
      stopCamera();
    } else {
      await handleCameraAccess();
    }
  };


  const handleCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      localVideoRef.current.srcObject = stream;
      setLocalStream(stream);
      setIsCameraOn(true);
    } catch (error) {
      console.error('Camera access error:', error);
    }
  };

  const stopCamera = () => {
    if (localStream) {
      const tracks = localStream.getTracks();
      tracks.forEach(track => track.stop());
      localVideoRef.current.srcObject = null;
      setLocalStream(null);
      setIsCameraOn(false);
    }
  };
  
  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/api/streams/${streamId}/comment`,
        {
          userId: user.email,
          text: commentText,
        }
      );
      setComments(response.data.comments);
      setCommentText("");
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleLikeStream = async () => {
    try {
      if (!hasLiked) {
        await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/streams/${streamId}/like`, {
          userId: user.email,
        });
        setLikes(prev => prev + 1);
      } else {
        await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/streams/${streamId}/unlike`, {
          userId: user.email,
        });
        setLikes(prev => prev - 1);
      }
      setHasLiked(!hasLiked);
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  // useEffect(() => {
  //   // Fetch initial stream data if needed
  //   if (streamId) {
  //     axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/streams/${streamId}`)
  //       .then(response => {
  //         setComments(response.data.comments);
  //         setLikes(response.data.likes.length);
  //         setHasLiked(response.data.likes.some(like => like.userId === user.email));
  //       })
  //       .catch(console.error);
  //   }

  //   return () => {
  //     if (mediaStreamRef.current) {
  //       mediaStreamRef.current.getTracks().forEach(track => track.stop());
  //     }
  //   };
  // }, [streamId, user.email]);

  return (
    <div className={`min-h-screen py-8 px-4 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      <div className="max-w-6xl mx-auto">
        {!isStreamStarted ? (
          <div className={`rounded-lg shadow-lg p-8 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <h1 className="text-2xl font-bold mb-6">Start New Live Stream</h1>

            <form onSubmit={handleStartStream} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Stream Title</label>
                  <input
                    type="text"
                    value={streamData.title}
                    onChange={(e) => setStreamData(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full p-3 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={streamData.description}
                    onChange={(e) => setStreamData(prev => ({ ...prev, description: e.target.value }))}
                    className={`w-full p-3 rounded-lg border h-32 resize-none ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Thumbnail URL</label>
                  <input
                    type="text"
                    value={streamData.thumbnail}
                    onChange={(e) => setStreamData(prev => ({ ...prev, thumbnail: e.target.value }))}
                    className={`w-full p-3 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-lg flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    <Video className="w-5 h-5" />
                    Start Streaming
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className={`rounded-lg overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}>
              <div className="aspect-video relative bg-black">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 px-6 py-3 rounded-full bg-black/50">
                  <button
                    onClick={toggleMicrophone}
                    className={`p-3 rounded-full ${isMicEnabled ? "bg-blue-500" : "bg-red-500"}`}
                  >
                    {isMicEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={toggleCamera}
                    className={`p-3 rounded-full ${isCameraOn ? "bg-blue-500" : "bg-red-500"}`}
                  >
                    {isCameraOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={handleEndStream}
                    className="p-3 rounded-full bg-red-500 hover:bg-red-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            {!live ? (
              <button
              type="submit"
              onClick={startBroadcast}
              disabled={isLoading}
              className="w-full py-3 rounded-lg flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              
                <>
                  <Video className="w-5 h-5" />
                  Start Streaming
                </>
            </button>
            ):(null)}

            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6`}>
              <div className={`lg:col-span-2 space-y-6`}>
                <div className={`p-6 rounded-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                  <h1 className="text-2xl font-bold mb-2">{streamData.title}</h1>
                  <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {streamData.description}
                  </p>
                  <div className="mt-4 flex items-center gap-4">
                    <button
                      onClick={handleLikeStream}
                      className={`p-3 rounded-full ${hasLiked ? 'bg-red-500' : 'bg-gray-500'} hover:bg-red-600 text-white`}
                    >
                      <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} />
                    </button>
                    <span>{likes} likes</span>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                <div className="flex flex-col h-[400px]">
                  <h2 className="text-xl font-bold mb-4">Live Chat</h2>
                  <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                    {comments.map((comment, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-sm">{comment.user}</div>
                          <p className="text-sm break-words">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                      className={`flex-1 p-2 rounded-lg border ${
                        darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
                      }`}
                      placeholder="Type a message..."
                    />
                    <button
                      onClick={handleAddComment}
                      className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StartNewLiveStream;