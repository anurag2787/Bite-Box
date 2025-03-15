require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const webrtc = require("wrtc");
const dotenv = require("dotenv")

const streams = new Map();
const app = express();
dotenv.config();
// Middleware
app.use(cors({
  origin: [
    "https://bite-box-chi.vercel.app",
    "https://bite-nsoh1so0t-m-ayank2005s-projects.vercel.app",
    "http://localhost:3000",
    "https://bitebox-w.vercel.app"
    // Add any additional frontend URLs
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const recipeRoutes = require('./routes/recipeRoutes');
const postRoutes = require("./routes/postroutes");
const streamRoutes = require("./routes/streamingRoutes");
const ratingRoutes = require('./routes/ratingroutes');

app.use('/api', recipeRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/streams", streamRoutes);
app.use('/api', ratingRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the Recipe Book API');
})

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));

// Middleware to check if stream exists
const checkStreamExists = (req, res, next) => {
  const { streamId } = req.body;
  if (streamId && !streams.has(streamId)) {
    return res.status(404).json({ error: "Stream not found" });
  }
  next();
};

app.post("/broadcast", async (req, res) => {
  try {
    const streamId = generateStreamId();
    const peer = new webrtc.RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.stunprotocol.org" },
        { urls: "stun:stun.l.google.com:19302" }
      ]
    });

    const stream = new webrtc.MediaStream();
    streams.set(streamId, { peer, stream });

    peer.ontrack = (e) => {
      console.log("Broadcaster added track:", e.track.kind);
      e.streams[0].getTracks().forEach(track => {
        stream.addTrack(track);
      });
    };

    // Handle ICE candidates
    const candidates = [];
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        candidates.push(event.candidate);
      }
    };

    const desc = new webrtc.RTCSessionDescription(req.body.sdp);
    await peer.setRemoteDescription(desc);

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    // Wait for ICE gathering to complete or timeout after 2 seconds
    await new Promise(resolve => {
      const checkComplete = () => {
        if (peer.iceGatheringState === 'complete') {
          resolve();
        }
      };
      
      peer.onicegatheringstatechange = checkComplete;
      checkComplete(); // Check in case it's already complete
      
      // Safety timeout
      setTimeout(resolve, 2000);
    });

    console.log(`Broadcasting started with streamId: ${streamId}`);

    res.json({
      sdp: peer.localDescription,
      streamId: streamId,
      candidates: candidates
    });
  } catch (error) {
    console.error("Error in /broadcast:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post('/consumer', checkStreamExists, async (req, res) => {
  try {
    const { streamId } = req.body;
    const streamData = streams.get(streamId);

    const peer = new webrtc.RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.stunprotocol.org" },
        { urls: "stun:stun.l.google.com:19302" }
      ]
    });

    // Handle ICE candidates
    const candidates = [];
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        candidates.push(event.candidate);
      }
    };

    const desc = new webrtc.RTCSessionDescription(req.body.sdp);
    await peer.setRemoteDescription(desc);

    // Make sure we have tracks to add
    if (streamData.stream.getTracks().length === 0) {
      console.log("Warning: No tracks in stream to forward");
    } else {
      console.log(`Forwarding ${streamData.stream.getTracks().length} tracks to viewer`);
      streamData.stream.getTracks().forEach(track => {
        peer.addTrack(track, streamData.stream);
      });
    }

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    // Wait for ICE gathering to complete or timeout after 2 seconds
    await new Promise(resolve => {
      const checkComplete = () => {
        if (peer.iceGatheringState === 'complete') {
          resolve();
        }
      };
      
      peer.onicegatheringstatechange = checkComplete;
      checkComplete(); // Check in case it's already complete
      
      // Safety timeout
      setTimeout(resolve, 2000);
    });

    console.log(`Viewer connected to streamId: ${streamId}`);

    res.json({
      sdp: peer.localDescription,
      candidates: candidates
    });
  } catch (error) {
    console.error("Error in /consumer:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

function generateStreamId() {
  return Math.random().toString(36).substring(2, 10);
}

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});