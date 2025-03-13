const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Stream = require("../models/stream");

// ========================
// STREAM ROUTES
// ========================

// 1. Start a new stream
router.post("/", async (req, res) => {
  try {
    const { userId, username, title, description,thumbnail,streamId } = req.body;

    const stream = new Stream({
      user: userId,
      username,
      title,
      description,
      thumbnail,
      streamId,
    });

    await stream.save();
    res.status(201).json({ message: "Stream started successfully!", stream });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Get all live streams
router.get("/live", async (req, res) => {
  try {
    const liveStreams = await Stream.find({ isLive: true }).populate("user", "username");
    res.status(200).json(liveStreams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Get all ended streams
router.get("/ended", async (req, res) => {
  try {
    const endedStreams = await Stream.find({ isLive: false }).populate("user", "username");
    res.status(200).json(endedStreams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. End a stream
router.put("/:streamId/end", async (req, res) => {
  try {
    const { streamId } = req.params;

    const stream = await Stream.findOne({ streamId: req.params.streamId })
    if (!stream || !stream.isLive) {
      return res.status(404).json({ message: "Live stream not found!" });
    }

    stream.isLive = false;
    stream.endedAt = new Date();
    stream.duration = Math.floor((stream.endedAt - stream.startedAt) / 1000); // Calculate duration in seconds
    await stream.save();

    res.status(200).json({ message: "Stream ended successfully!", stream });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Like a stream
router.put("/:streamId/like", async (req, res) => {
    try {
      const { userId } = req.body;  
      const stream = await Stream.findOne({ streamId: req.params.streamId })
      
      if (!stream) {
        return res.status(404).json({ message: "Stream not found!" });
      }
  
      // Check if the user already liked the stream by searching for the userId in the likes array
      const userAlreadyLiked = stream.likes.some(like => like.userId === userId);
  
      if (userAlreadyLiked) {
        return res.status(400).json({ message: "Already liked this stream!" });
      }
  
      // Add the userId to the likes array if not already liked
      stream.likes.push({ userId });
  
      await stream.save();
      res.status(200).json({ message: "Stream liked successfully!", likes: stream.likes.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
// 6. Unlike a stream
router.put("/:streamId/unlike", async (req, res) => {
    try {
      const { userId } = req.body;  // Get userId from request body
      const stream = await Stream.findOne({ streamId: req.params.streamId })
  
      if (!stream) {
        return res.status(404).json({ message: "Stream not found!" });
      }
  
      // Remove the userId from the likes array
      stream.likes = stream.likes.filter(like => like.userId !== userId);
  
      await stream.save();
  
      res.status(200).json({ message: "Stream unliked successfully!", likes: stream.likes.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  

// 7. Add a comment to a stream
router.post("/:streamId/comment", async (req, res) => {
  try {
    const { userId, text } = req.body;
    const stream = await Stream.findOne({ streamId: req.params.streamId })
    if (!stream) {
      return res.status(404).json({ message: "Stream not found!" });
    }

    stream.comments.push({ user: userId, text });
    await stream.save();
    res.status(201).json({ message: "Comment added successfully!", comments: stream.comments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Get a stream's details (with comments and likes)
router.get("/:streamId", async (req, res) => {
  try {
    const stream = await Stream.findOne({ streamId: req.params.streamId })
      .populate("user")
      .populate({
        path: "comments",
      });

    if (!stream) {
      return res.status(404).json({ message: "Stream not found!" });
    }

    res.status(200).json(stream);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Delete a comment from a stream
router.delete("/:streamId/comment/:commentId", async (req, res) => {
  try {
    const stream = await Stream.findOne({ streamId: req.params.streamId })
    if (!stream) {
      return res.status(404).json({ message: "Stream not found!" });
    }

    const comment = stream.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found!" });
    }

    comment.remove();
    await stream.save();

    res.status(200).json({ message: "Comment deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================
// STREAM JOIN AND LEAVE ROUTES
// ========================

// 10. Join a stream (create a WebRTC session and generate SDP offer)
router.post("/:streamId/join", async (req, res) => {
  try {
    const { userId } = req.body;
    const { streamId } = req.params;

    const stream = await Stream.findOne({ streamId: streamId })
    if (!stream || !stream.isLive) {
      return res.status(404).json({ message: "Stream not live or not found!" });
    }

    // Create a WebRTC offer and associate it with the stream (this could be a signaling server step)
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // Generate an SDP offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    // Store or handle the offer (this could be saved to a database or cached for later use)
    // Here we assume you will return the offer to the client
    res.status(200).json({ offer: offer });

    // Optionally, you can store some session data related to the user joining the stream
    // such as adding the user to a list of participants in your database.
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 11. Leave a stream (close the WebRTC session)
router.post("/:streamId/leave", async (req, res) => {
  try {
    const { userId } = req.body;
    const { streamId } = req.params;

    const stream = await Stream.findOne({ streamId: streamId })
    if (!stream || !stream.isLive) {
      return res.status(404).json({ message: "Stream not found or not live!" });
    }

    // Logic for cleaning up the WebRTC session when the user leaves
    // This could be clearing out session data for the participant, disconnecting from the room, etc.
    // Close the WebRTC peer connection on the backend if necessary

    res.status(200).json({ message: "User left the stream!" });

    // Optionally, you can update the stream's participant list or handle session cleanup.
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//dep
module.exports = router;
