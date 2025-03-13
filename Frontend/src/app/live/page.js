'use client';

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

function ViewPage() {
  const videoRef = useRef(null);
  const [streamId, setStreamId] = useState('');
  const [inputStreamId, setInputStreamId] = useState('');
  const [peer, setPeer] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

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

      const { data } = await axios.post('http://localhost:5000/consumer', payload);

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
      } else {
        console.error("Invalid server response:", data);
        setIsConnected(false);
      }
    } catch (error) {
      console.error('View stream error:', error);
      setIsConnected(false);
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
    setIsConnected(false);
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
      <h1 className="text-xl font-bold mb-4">View Stream</h1>
      {!isConnected && (
        <div className="mb-4">
          <input 
            type="text"
            value={inputStreamId}
            onChange={(e) => setInputStreamId(e.target.value)}
            placeholder="Enter Stream ID"
            className="border p-2 mr-2 rounded"
          />
          <button 
            onClick={joinStream}
            className="px-4 py-2 bg-blue-500 text-white rounded"
            disabled={!inputStreamId}
          >
            Join Stream
          </button>
        </div>
      )}
      {isConnected && (
        <div>
          <p className="mb-4">Connected to Stream: {streamId}</p>
          <button 
            onClick={stopViewing}
            className="px-4 py-2 bg-red-500 text-white rounded mb-4"
          >
            Stop Viewing
          </button>
        </div>
      )}
      <video 
        ref={videoRef}
        autoPlay
        playsInline
        className="border border-gray-300 rounded"
        style={{ width: '100%', maxHeight: '300px', backgroundColor: '#f0f0f0' }}
      />
    </div>
  );
}

export default ViewPage;