"use client";
import React, { useEffect, useState } from "react";
import { useRouter} from "next/navigation";
import axios from "axios";
import { formatDistanceToNow } from 'date-fns';
import { useDarkMode } from "../../DarkModeContext";
import {
  Heart,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Send,
  Clock,
  Share2,
  MoreHorizontal,
  ThumbsUp,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { UserAuth } from "../../context/AuthContext";
import loader from "@/Components/loader";
import Image from 'next/image';
import defaultImage from "@/lib/general.png";

const PostDetailsPage = () => {
  const router = useRouter();
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
  const [postId, setPostId] = useState();

  const userId = user ? user.email : null;

  // Check if the Share API is supported
  useEffect(() => {
    if (navigator.share) {
      setShareSupported(true);
    }
  }, []);

  const handleShare = (id) => {
    const currentUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/viewpost/?id=${id}`;

    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: currentUrl,
      })
        .then(() => console.log("Share successful"))
        .catch((error) => console.error("Error sharing:", error));
    } else {
      // Fallback for unsupported browsers
      if (navigator.clipboard) {
        navigator.clipboard.writeText(currentUrl)
          .then(() => alert("URL copied to clipboard."))
          .catch((error) => console.error("Clipboard error:", error));
      } else {
        alert(`Sharing is not supported in your browser. Copy this URL: ${currentUrl}`);
      }
    }
  };
  const { search } = useRouter();
  const searchParams = new URLSearchParams(search);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryId = params.get("id");
    setPostId(queryId);
    // const postId = searchParams.get("id");
    console.log(postId);
    if (postId === null || postId === undefined) {
      return; 
    }
    // if (!postId) {
    //   setError("Post ID is missing!");
    //   return;
    // }

    const fetchPost = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/posts/${postId}`);
        setPost(response.data);
        setIsLiked(response.data.likes?.some((like) => like.userId === userId));
      } catch (err) {
        setError("Failed to fetch post details");
        console.error(err);
      }
    };

    fetchPost();
  }, [postId, userId]);

  const handleLike = async () => {
    if (!userId || !post) return;

    try {
      await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/posts/${post._id}/like`, { userId });
      setPost((prevPost) => ({
        ...prevPost,
        likes: [...prevPost.likes, { userId }],
      }));
      setIsLiked(true);
    } catch (err) {
      console.error("Error liking the post:", err);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !post) return;

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/api/posts/${post._id}/comment`,
        { userId, text: commentText }
      );
      setPost((prevPost) => ({
        ...prevPost,
        comments: response.data.comments,
      }));
      setCommentText("");
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleAddReply = async (commentId) => {
    if (!replyText.trim() || !post) return;

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/api/posts/${post._id}/comment/${commentId}/reply`,
        { userId, text: replyText }
      );

      setPost((prevPost) => ({
        ...prevPost,
        comments: prevPost.comments.map((comment) =>
          comment._id === commentId ? response.data.comment : comment
        ),
      }));

      setReplyText("");
      setActiveReplyId(null);
    } catch (err) {
      console.error("Error adding reply:", err);
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const sortComments = (comments) => {
    if (sortBy === "newest") {
      return comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return comments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  };

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900 text-white" : "bg-slate-50 text-black"
        }`}>
        <div className="p-6 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3">
          <AlertCircle className="text-red-500 w-6 h-6" />
          <p className="text-red-500 text-xl font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return <div>{loader()}</div>;
  }

  const formattedDate = post.createdAt
    ? format(new Date(post.createdAt), "MMM d, yyyy 'at' h:mm a")
    : "Unknown";

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-300 text-gray-900"
      }`}>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header Section */}
        <header className={`mb-6 rounded-xl p-6 ${darkMode ? "bg-gray-800" : "bg-white"
          } shadow-sm`}>
          <div className="flex items-center justify-between mb-4 overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-12">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
                <div className="absolute inset-0.5 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                  <span className="text-lg font-semibold">{post.user[0]}</span>
                </div>
              </div>
              <div>
                <h2 className="font-semibold text-sm md:text-lg">{post.username || post.user}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{formattedDate}</span>
                </div>
              </div>
            </div>

            {/* For Future is we want to use delete option we can add here */}
            {/* <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <MoreHorizontal className="w-6 h-6" />
            </button> */}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-4">{post.title}</h1>

          <div className={`prose max-w-none mb-6 ${darkMode ? "prose-invert" : ""}`}>
            <p className="text-lg leading-relaxed">{post.content}</p>
          </div>

          {post.thumbnail && (
            <div className="relative w-full md:h-[400px] h-[200px] rounded-xl overflow-hidden mb-6">
              <Image
                src={post.thumbnail || defaultImage}
                alt={post.title}
                layout="fill"
                objectFit="fit"
                className="transition-transform duration-300 hover:scale-105"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
            <div className="flex items-center gap-6">
              <button
                onClick={handleLike}
                disabled={isLiked}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${isLiked
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
              >
                <Heart
                  className={`w-6 h-6 transform transition-transform group-hover:scale-110 ${isLiked ? "fill-current text-pink-500 dark:text-pink-400" : ""
                    }`}
                />
                <span className="font-medium">{post.likes.length}</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">{post.comments.length}</span>
              </button>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            >
              <Share2 className="w-5 h-5" />
              <span className="font-medium">Share</span>
            </button>
          </div>
        </header>

        {/* Comments Section */}
        <section className={`rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"
          } shadow-sm p-6`}>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Add to the discussion</h3>
            <div className="flex flex-col gap-3">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className={`w-full p-4 rounded-xl resize-none h-24 transition-all ${darkMode
                  ? "bg-gray-700 text-white border-gray-600 focus:bg-gray-600"
                  : "bg-gray-100 text-gray-900 border-gray-100 focus:bg-white"
                  } border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="What are your thoughts?"
              />
              <button
                onClick={handleAddComment}
                className="self-end px-6 py-2.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-medium transition-all transform hover:scale-105 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Comment
              </button>
            </div>
          </div>

          {/* Sort Comments UI */}
          <div className="mb-6 flex justify-between items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>

          {/* Comments List */}

          <div className="space-y-6">
            {sortComments(post.comments).map((comment) => (
              <div
                key={comment._id}
                className={`rounded-xl ${darkMode ? "bg-gray-700/50" : "bg-gray-100"
                  } p-5 space-y-4`}
              >
                <div className="flex justify-between items-start gap-4 max-w-full overflow-hidden">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium">{comment.user[0]}</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="md:font-medium text-sm">{comment.user}</span>
                        <span className="text-sm text-gray-500">• {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                      </div>
                      <p className={`mt-1 ${darkMode ? "text-gray-300" : "text-gray-700"
                        }`}>
                        {comment.text}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <button
                          onClick={() => setActiveReplyId(activeReplyId === comment._id ? null : comment._id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-full border border-transparent text-gray-700 bg-gray-200  dark:bg-gray-600 dark:text-white font-medium text-sm hover:bg-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 transform active:scale-95"
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span>Reply</span>
                        </button>
                      </div>

                    </div>
                  </div>
                </div>

                {activeReplyId === comment._id && (
                  <div className="flex gap-3 ml-12 mt-3 max-w-full overflow-hidden">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className={`flex-grow p-3 rounded-xl ${darkMode
                        ? "bg-gray-600 text-white border-gray-500"
                        : "bg-white text-gray-900 border-gray-200"
                        } border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Write a reply..."
                    />
                    <button
                      onClick={() => handleAddReply(comment._id)}
                      className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-all"
                    >
                      Reply
                    </button>
                  </div>
                )}

                {comment.replies?.length > 0 && (
                  <div className="ml-12">
                    <button
                      onClick={() => toggleReplies(comment._id)}
                      className={`flex items-center gap-2 text-sm font-medium ${darkMode ? "text-blue-400" : "text-blue-600"
                        } hover:underline`}
                    >
                      {expandedComments.has(comment._id) ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Hide Replies ({comment.replies.length})
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Show Replies ({comment.replies.length})
                        </>
                      )}
                    </button>

                    {expandedComments.has(comment._id) && (
                      <div className="mt-4 space-y-4 max-w-full overflow-hidden">
                        {comment.replies.map((reply) => (
                          <div
                            key={reply._id}
                            className={`p-4 rounded-xl ${darkMode ? "bg-gray-600/50" : "bg-white"
                              }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-sm font-medium">
                                  {reply.user[0]}
                                </span>
                              </div>
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-medium text-sm">{reply.user}</span>
                                  <span className="text-xs text-gray-500">• 1h ago</span>
                                </div>
                                <p className={`text-sm mt-1 ${darkMode ? "text-gray-300" : "text-gray-700"
                                  }`}>
                                  {reply.text}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PostDetailsPage;