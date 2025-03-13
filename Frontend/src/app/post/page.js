'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Calendar, ChevronRight, User, Clock, Heart, Share2 } from "lucide-react";
import { useDarkMode } from "../DarkModeContext";
import Image from 'next/image'

import { UserAuth } from "../context/AuthContext";
import defaultImage from "@/lib/general.png"

const BACKEND_URL = process.env.NEXT_BACKEND_URL || 'http://localhost:5000';

const PostsPage = () => {
  const [posts, setPosts] = useState([]);
  const router = useRouter();
  const { darkMode } = useDarkMode()
  const { user } = UserAuth();
  const [shareSupported, setShareSupported] = useState(false);

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

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/posts/`);
        const data = await response.json();
        // Sort posts by createdAt in descending order (latest first)
        const sortedPosts = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPosts(sortedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  const handleCreatePost = () => {
    if(!user){
      alert("For Creating a Post You have to log in :)")
      return
    }
    router.push("/post/createpost");
  };

  const handleViewPost = (postId) => {
    router.push(`/post/viewpost?id=${encodeURIComponent(postId)}`);
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-300"}`}>
      {/* Header Section */}
      <div className="bg-gradient-to-r py-8 mb-3 ">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-4xl font-bold ${darkMode ? "text-white" : "text-gray-700"} mb-2`}>Community Discussions</h1>
              <p className={`${darkMode ? "text-white" : "text-gray-600"} text-lg`}>Share your thoughts with the community</p>
            </div>
              <button
                onClick={handleCreatePost}
                className="flex items-center md:gap-2 bg-white text-yellow-600 px-2 py-1 text-[10px] md:px-6 md:py-3 rounded-full hover:bg-gray-300 transition-all duration-100 shadow-lg font-medium"
              >
                <Plus size={20} />
                <span>Start Discussion</span>
              </button>
          </div>
        </div>
      </div>

      {/* Posts Container */}
      <div className="container mx-auto px-4 -mt-6 mb-6">
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post._id}
              onClick={() => handleViewPost(post._id)}
              className={`${darkMode ? "bg-gray-700 text-gray-100" : "bg-white text-gray-900"} rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100 group overflow-hidden`}
            >
              <div className="p-6">
                <div className="flex gap-6">
                  {/* Left Section - User Info */}
                  <div className="flex-shrink-0 flex flex-col items-center space-y-2 w-20">
                    <Image
                      src={post.thumbnail || defaultImage}
                      alt={post.title || "Default"}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full object-cover border-2 border-yellow-100"
                    />
                    <span className="text-sm font-medium text-center line-clamp-1">
                      {post.author || "Anonymous"}
                    </span>
                  </div>

                  {/* Right Section - Post Content */}
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-xl font-semibold group-hover:font-extrabold transition-colors">
                        {post.title}
                      </h2>
                      <ChevronRight
                        className="group-hover:text-yellow-500 group-hover:translate-x-1 transition-all"
                        size={24}
                      />
                    </div>

                    {/* Post Preview */}
                    <p className="mb-4 line-clamp-2">
                      Click to read more and join the discussion...
                    </p>

                    {/* Post Metadata */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock size={16} />
                          <span>Posted {new Date(post.createdAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                        {post.category && (
                          <span className="bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full text-xs font-medium">
                            {post.category}
                          </span>
                        )}
                      </div>

                      {/* Like and Share Options */}
                      <div className="flex items-center gap-4 px-4 py-2 rounded-full hover:text-gray-100 hover:bg-red-400 transition-all">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering post view
                            handleShare(post._id);
                          }}
                          className="flex items-center gap-1"
                        >
                          <Share2 size={20} />
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {posts.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm mt-6">
            <div className="w-20 h-20 rounded-full bg-yellow-50 flex items-center justify-center mx-auto mb-4">
              <User size={32} className="text-yellow-500" />
            </div>
            <h3 className="text-xl font-medium text-gray-800">No discussions yet</h3>
            <p className="text-gray-500 mt-2 mb-6">Be the first to start a conversation!</p>
            <button
              onClick={handleCreatePost}
              className="inline-flex items-center gap-2 bg-yellow-500 text-white px-8 py-3 rounded-full hover:bg-yellow-600 transition-colors"
            >
              <Plus size={20} />
              <span>Create First Post</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default PostsPage;