"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useDarkMode } from "../DarkModeContext";
import loader from "@/Components/loader";
import { Heart } from "lucide-react";
import { format } from "date-fns";
import { UserAuth } from "../context/AuthContext";

// Separate the content rendering logic
const renderStyledContent = (content) => {
  // ... (previous renderStyledContent code remains the same)
};

// Create a separate component for the recipe content
const RecipeContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const { darkMode } = useDarkMode();
  const { user } = UserAuth();

  const userId = user ? user.email : null;

  const extractYouTubeId = (url) => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]*\/\S+\/|\S+\/|\S+\/v=|v\/|e(?:mbed)?\/|watch\?v=|embed\/v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  useEffect(() => {
    const id = searchParams.get("id");

    if (!id) {
      setError("Missing required recipe data");
      return;
    }

    const fetchRecipe = async () => {
      try {
        const response = await axios.get(
          `https://bite-box-beta.vercel.app/api/recipes/${encodeURIComponent(id)}`
        );
        setRecipe(response.data);
        if (userId) {
          const alreadyLiked =
            Array.isArray(response.data.likes) &&
            response.data.likes.some((like) => like.userId === userId);
          setIsLiked(alreadyLiked);
        }
      } catch (err) {
        setError("Unable to load recipe details");
        console.error("Error fetching recipe details:", err);
      }
    };

    fetchRecipe();
  }, [searchParams, userId]);

  const handleLike = async () => {
    if (!user || !recipe) return;

    const userId = user.email;

    const alreadyLiked =
      Array.isArray(recipe.likes) &&
      recipe.likes.some((like) => like.userId === userId);

    if (alreadyLiked) {
      alert("You have already liked this recipe!");
      return;
    }

    try {
      await axios.put(
        `https://bite-box-beta.vercel.app/api/recipes/${recipe._id}/like`,
        { userId }
      );

      setRecipe((prevRecipe) => ({
        ...prevRecipe,
        likes: [...prevRecipe.likes, { userId }]
      }));
      setIsLiked(true);
    } catch (err) {
      console.error("Error liking recipe:", err);
    }
  };

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
        }`}
      >
        <p className="text-red-500 text-xl font-semibold">{error}</p>
      </div>
    );
  }

  if (!recipe) {
    return <div>{loader()}</div>;
  }

  const youtubeId = extractYouTubeId(recipe.youtube);
  const parsedContent = recipe.content ? JSON.parse(recipe.content) : null;
  
  const createdDate = recipe.createdAt ? new Date(recipe.createdAt) : new Date();
  const formattedDate = createdDate instanceof Date && !isNaN(createdDate) 
    ? format(createdDate, "MMMM dd, yyyy")
    : "Date not available";

  return (
    <div
      className={`min-h-screen w-full py-12 px-4 transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Rest of the JSX remains the same */}
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden transform transition-all hover:scale-[1.01]">
        {/* ... (previous JSX content remains the same) */}
      </div>
    </div>
  );
};

RecipeContent.displayName = 'RecipeContent';

// Main component with Suspense boundary
const RecipeDetailsPage = () => {
  return (
    <Suspense fallback={<div>{loader()}</div>}>
      <RecipeContent />
    </Suspense>
  );
};

RecipeDetailsPage.displayName = 'RecipeDetailsPage';

export default RecipeDetailsPage;