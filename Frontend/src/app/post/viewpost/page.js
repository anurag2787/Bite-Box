"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { useDarkMode } from "../../DarkModeContext";
// Import other necessary dependencies...

const PostDetailsPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const { darkMode } = useDarkMode();
  const { user } = UserAuth();
  const [shareSupported, setShareSupported] = useState(false);

  const userId = user ? user.email : null;

  // Other code logic...

  useEffect(() => {
    const postId = searchParams.get("id");
    if (!postId) {
      setError("Post ID is missing!");
      return;
    }

    const fetchPost = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/posts/${postId}`);
        setPost(response.data);
        setIsLiked(response.data.likes?.some((like) => like.userId === userId));
      } catch (err) {
        setError("Failed to fetch post details");
        console.error(err);
      }
    };

    fetchPost();
  }, [searchParams, userId]);

  // Return JSX rendering your content, similar to what you already have...
};

// Wrap the content with a Suspense boundary
const PostDetailsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PostDetailsPageContent />
    </Suspense>
  );
};

export default PostDetailsPage;
