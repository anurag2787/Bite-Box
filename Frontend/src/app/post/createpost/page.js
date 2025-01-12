'use client';

import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../../DarkModeContext'; // Import the dark mode hook
import { UserAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import axios from 'axios';

function Page() { // Updated component name
  const [title, setTitle] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { darkMode, toggleDarkMode } = useDarkMode();
  const { user } = UserAuth();
  const router = useRouter();

  const handlePost = async () => {
    if (!title.trim() || content.trim() === '') {
      alert('All fields are required!');
      return;
    }

    setLoading(true);
    try {
      const userDetails = {
        username: user.displayName,
        userId: user.uid,
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/posts/`, // Corrected the environment variable
        {
          title,
          content,
          thumbnail,
          ...userDetails,
        }
      );

      alert('Your Post has been posted successfully!');
      setTitle('');
      setThumbnail('');
      setContent('');
      router.push('/post');
    } catch (error) {
      console.error("Error posting recipe:", error.response?.data || error.message);
      alert("Failed to post recipe: " + (error.response?.data?.error || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`container mt-10 mx-auto max-w-5xl p-8 shadow-lg rounded-lg ${
        darkMode ? 'dark bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-800'
      }`}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold">Create Your Post</h1>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-2xl font-semibold border-b-2 border-gray-300 dark:border-gray-600 px-4 py-2 focus:border-blue-500 transition placeholder-gray-400 bg-transparent"
          placeholder="Post Title"
          required
        />
      </div>

      <div className="mb-4">
        <input
          type="url"
          value={thumbnail}
          onChange={(e) => setThumbnail(e.target.value)}
          className="w-full text-lg border-b-2 border-gray-300 dark:border-gray-600 px-4 py-2 focus:border-blue-500 transition placeholder-gray-400 bg-transparent"
          placeholder="Image URL (Optional)"
        />
      </div>

      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter Your Thoughts Here..."
          className="min-h-[300px] w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-inner p-4 text-gray-700 dark:text-gray-200"
        />
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={handlePost}
          disabled={loading}
          className={`px-8 py-3 font-semibold rounded-lg shadow-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-600 transition ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Posting...' : 'Post Recipe'}
        </button>
      </div>
    </div>
  );
}

export default Page; // Updated export name
