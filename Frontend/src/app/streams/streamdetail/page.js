"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useDarkMode } from "../../DarkModeContext";
import { 
  Heart, 
  MessageCircle, 
  Clock, 
  Calendar,
  Send,
  User,
  ThumbsUp,
  Share2
} from "lucide-react";
import { format } from "date-fns";
import { UserAuth } from "../../context/AuthContext";
import Loader from "@/Components/loader";

const StreamDetailPage = () => {
  const router = useRouter();
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const { darkMode } = useDarkMode();
  const { user } = UserAuth();

  const userId = user ? user.email : null;
  // const searchParams = new URLSearchParams(router.query);
  useEffect(() => {
    // Move URL params extraction inside useEffect
    const params = new URLSearchParams(window.location.search);
    const streamId = params.get("id");
    
    if (!streamId) {
      setError("Stream ID is missing!");
      setLoading(false);
      return;
    }
    
    const fetchStream = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/streams/${streamId}`);
        setStream(response.data);
        setIsLiked(response.data.likes?.some(like => like.userId === userId));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching stream:", err);
        setError("Failed to fetch stream details");
        setLoading(false);
      }
    };
    
    fetchStream();
  }, [userId]);

  const handleLike = async () => {
    if (!userId || !stream) return;

    try {
      const endpoint = isLiked ? 'unlike' : 'like';
      await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/streams/${stream.streamId}/${endpoint}`, {
        userId,
      });
      
      setStream(prevStream => ({
        ...prevStream,
        likes: isLiked 
          ? prevStream.likes.filter(like => like.userId !== userId)
          : [...prevStream.likes, { userId }]
      }));
      setIsLiked(!isLiked);
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !stream) return;

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/api/streams/${stream.streamId}/comment`,
        { userId, text: commentText }
      );
      setStream(prevStream => ({
        ...prevStream,
        comments: response.data.comments
      }));
      setCommentText("");
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen">
      <Loader/>
    </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}>
        <p className="text-red-500 text-xl font-semibold">{error}</p>
      </div>
    );
  }

  if (!stream) return null;

  const formattedStartDate = format(new Date(stream.startedAt), "MMMM dd, yyyy 'at' h:mm a");
  const formattedEndDate = format(new Date(stream.endedAt), "h:mm a");
  const durationInMinutes = Math.floor(stream.duration / 60);

  return (
    <div className={`min-h-screen py-8 px-4 ${
      darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
    }`}>
      <div className="max-w-6xl mx-auto">
        {/* Main Content Container */}
        <div className={`rounded-xl overflow-hidden shadow-lg ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}>
          {/* Stream Thumbnail */}
                <div className="relative aspect-video max-w-4xl mx-auto">
                <img
                  src={stream.thumbnail || "/placeholder-stream.jpg"}
                  alt={stream.title}
                  className="w-full h-full object-cover rounded-2xl pt-5"
                />
                </div>

                {/* Stream Info Section */}
          <div className="p-8 space-y-6">
            {/* Title and Actions */}
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">{stream.title}</h1>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{stream.username}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{durationInMinutes} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formattedStartDate} - {formattedEndDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    isLiked
                      ? "bg-red-500 text-white"
                      : darkMode
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                  <span>{stream.likes?.length || 0}</span>
                </button>

                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                    darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </div>
            </div>

            {/* Description */}
            {stream.description && (
              <div className={`p-4 rounded-lg ${
                darkMode ? "bg-gray-700" : "bg-gray-50"
              }`}>
                <p className="whitespace-pre-wrap">{stream.description}</p>
              </div>
            )}

            {/* Comments Section */}
            <div className="space-y-6 mt-8">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-6 h-6" />
                <h2 className="text-xl font-bold">
                  Comments ({stream.comments?.length || 0})
                </h2>
              </div>

              {/* Comment Input */}
              <div className="flex gap-4">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className={`flex-grow p-4 rounded-lg resize-none h-24 ${
                    darkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-gray-50 text-gray-900 border-gray-200"
                  } border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                <button
                  onClick={handleAddComment}
                  className={`self-end px-6 py-3 rounded-lg flex items-center gap-2 ${
                    darkMode
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-blue-500 hover:bg-blue-600"
                  } text-white transition-colors`}
                >
                  <Send className="w-4 h-4" />
                  Post
                </button>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {stream.comments?.map((comment, index) => (
                  <div
                    key={comment.streamId || index}
                    className={`p-4 rounded-lg ${
                      darkMode ? "bg-gray-700" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            darkMode ? "bg-gray-600" : "bg-gray-200"
                          }`}>
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium">{comment.user}</p>
                          </div>
                        </div>
                        <p className={darkMode ? "text-gray-300" : "text-gray-700"}>
                          {comment.text}
                        </p>
                      </div>
                      <button
                        className={`p-2 rounded-full ${
                          darkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamDetailPage;