"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useDarkMode } from "../../DarkModeContext";
import { UserAuth } from "../../context/AuthContext";

const JoinLiveStream = () => {
  const { darkMode } = useDarkMode();
  // const { user } = UserAuth();

  const [isConnected, setIsConnected] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const videoRef = useRef(null);
  const [streamId, setStreamId] = useState(''); // This was missing
  const [inputStreamId, setInputStreamId] = useState('');
  const [peer, setPeer] = useState(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0); // This was missing

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const idFromUrl = urlParams.get("id");
    
    if (idFromUrl) {
      setInputStreamId(idFromUrl);
      console.log(idFromUrl);
    } else {
      // Only show alert if ID is missing
      alert("No ID found in URL. Please add an ID parameter to the URL.");
      // Alternatively, you could redirect to a page with instructions
      // window.location.href = "/instructions"; 
    }
  }, []);

  useEffect(() => {
    const id = inputStreamId;
    
    if (id) {
      console.log(inputStreamId);
    } else {
      // Don't display alert immediately since inputStreamId might be loading
      // Only alert if still empty after some time
      const timer = setTimeout(() => {
        if (!inputStreamId) {
          alert("No input stream ID found. Please refresh the page.");
        }
      }, 1000); // Give time for other effects or data loading to set the ID
      
      return () => clearTimeout(timer); // Clean up timer on unmount
    }
  }, [inputStreamId]);

  async function joinStream() {
    try {
      // Reset video element before creating a new connection
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject = null;
      }

      // Close any existing peer connection
      if (peer) {
        peer.close();
      }

      const newPeer = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.stunprotocol.org" },
          { urls: "stun:stun.l.google.com:19302" }
        ]
      });

      // Set up event handlers before creating the offer
      newPeer.ontrack = (event) => {
        console.log("Track received:", event.streams[0]);
        if (videoRef.current) {
          videoRef.current.srcObject = event.streams[0];
          
          // Add event listener to detect if the video is actually playing
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch(e => console.error("Video play error:", e));
          };
        }
      };

      newPeer.oniceconnectionstatechange = () => {
        console.log("ICE connection state:", newPeer.iceConnectionState);
        if (newPeer.iceConnectionState === 'disconnected' || 
            newPeer.iceConnectionState === 'failed') {
          console.log("ICE connection failed or disconnected, retrying...");
          setIsConnected(false);
          
          // Retry connection if it fails (with a maximum number of attempts)
          if (connectionAttempts < 3) {
            setConnectionAttempts(prev => prev + 1);
            setTimeout(() => joinStream(), 1000);
          }
        } else if (newPeer.iceConnectionState === 'connected' || 
                  newPeer.iceConnectionState === 'completed') {
          setIsConnected(true);
          setIsJoined(true); // Set isJoined to true when connected
          setConnectionAttempts(0);
        }
      };

      // Add transceivers before creating the offer
      newPeer.addTransceiver('video', { direction: 'recvonly' });
      newPeer.addTransceiver('audio', { direction: 'recvonly' });

      const offer = await newPeer.createOffer();
      await newPeer.setLocalDescription(offer);

      const payload = {
        sdp: newPeer.localDescription,
        streamId: inputStreamId
      };

      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API}/consumer`, payload);

      // Handle the server response
      if (data.sdp) {
        const desc = new RTCSessionDescription(data.sdp);
        await newPeer.setRemoteDescription(desc);

        // Process any ICE candidates that came with the response
        if (data.candidates && Array.isArray(data.candidates)) {
          for (const candidate of data.candidates) {
            try {
              await newPeer.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
              console.warn("Error adding received ICE candidate", e);
            }
          }
        }

        setStreamId(inputStreamId);
        setPeer(newPeer);
        setIsConnected(true);
        setIsJoined(true); // Set isJoined to true
      } else {
        console.error("Invalid server response:", data);
        setIsConnected(false);
        setIsJoined(false); // Make sure isJoined is false
      }
    } catch (error) {
      console.error('View stream error:', error);
      setIsConnected(false);
      setIsJoined(false); // Make sure isJoined is false
    }
  }

  const stopViewing = () => {
    if (videoRef.current) {
      if (videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
      videoRef.current.srcObject = null;
    }
    if (peer) {
      peer.close();
      setPeer(null);
    }
    setStreamId('');
    setIsConnected(true); // Reset to true since we're done viewing, not disconnected
    setIsJoined(false); // Set isJoined to false when stopped
    setConnectionAttempts(0);
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopViewing();
    };
  }, []);

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        {isConnected ? (
          <div className="space-y-6">
            <div className={`rounded-lg overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}>
              <div className="aspect-video relative bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {isJoined ? (
              <button
                type="button"
                onClick={stopViewing}
                className="w-full py-3 rounded-lg flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                Leave Stream
              </button>
            ) : (
              <button
                type="button"
                onClick={joinStream}
                className="w-full py-3 rounded-lg flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                Join Stream
              </button>
            )}
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="animate-pulse">
              <div className="text-gray-500 dark:text-gray-400">
                Connecting to stream...
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinLiveStream;