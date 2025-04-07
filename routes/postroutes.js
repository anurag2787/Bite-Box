const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Post = require("../models/post");
// ========================
// POST ROUTES
// ========================

// 1. Create a new post
router.post("/", async (req, res) => {
  try {
    const { userId, username, title, content,thumbnail } = req.body;
    const post = new Post({
      user: userId,
      username,
      title,
      content,
      thumbnail,
    });
    await post.save();
    res.status(201).json({ message: "Post created successfully!", post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user")
      .populate({
        path: "comments"
      });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Get a single post by ID
router.get("/:postId", async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate("user", "username")
      .populate({
        path: "comments",
      });
    if (!post) {
      return res.status(404).json({ message: "Post not found!" });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// 4. Like a post
router.put("/:postId/like", async (req, res) => {
    try {
      const { userId } = req.body;
      const post = await Post.findById(req.params.postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found!" });
      }
  
      // Check if the user already liked the post
      if (!post.likes.some((like) => like.userId === userId)) {
        // Add the user to likes
        post.likes.push({ userId });
  
        // Remove user from dislikes if present
        post.dislikes = post.dislikes.filter((dislike) => dislike.userId !== userId);
      } else {
        return res.status(400).json({ message: "Already liked this post!" });
      }
  
      await post.save();
      res.status(200).json({ message: "Post liked!", likes: post.likes.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  

// 5. Dislike a post
router.put("/:postId/dislike", async (req, res) => {
    try {
      const { userId } = req.body;
      const post = await Post.findById(req.params.postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found!" });
      }
  
      // Check if the user already disliked the post
      if (!post.dislikes.some((dislike) => dislike.userId === userId)) {
        // Add the user to dislikes
        post.dislikes.push({ userId });
  
        // Remove user from likes if present
        post.likes = post.likes.filter((like) => like.userId !== userId);
      } else {
        return res.status(400).json({ message: "Already disliked this post!" });
      }
  
      await post.save();
      res.status(200).json({ message: "Post disliked!", dislikes: post.dislikes.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  

// 6. Add a comment to a post
router.post("/:postId/comment", async (req, res) => {
  try {
    const { userId, text } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found!" });
    }

    post.comments.push({ user: userId, text });
    await post.save();
    res.status(201).json({ message: "Comment added successfully!", comments: post.comments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Reply to a comment
router.post("/:postId/comment/:commentId/reply", async (req, res) => {
  try {
    const { userId, text } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found!" });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found!" });
    }

    comment.replies.push({ user: userId, text });
    await post.save();
    res.status(201).json({ message: "Reply added successfully!", comment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Delete a post
router.delete("/:postId", async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found!" });
    }
    res.status(200).json({ message: "Post deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Delete a comment
router.delete("/:postId/comment/:commentId", async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found!" });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found!" });
    }

    comment.remove();
    await post.save();
    res.status(200).json({ message: "Comment deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
