"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useDarkMode } from "../DarkModeContext";
import loader from "@/Components/loader";
import { Heart } from "lucide-react";
import { format } from "date-fns";
import { UserAuth } from "../context/AuthContext"; // Ensure the correct import

const renderStyledContent = (content) => {
  if (!content || !content.blocks) return null;

  return content.blocks.map((block, index) => {
    const { text, type, inlineStyleRanges } = block;

    let StyledBlock;
    switch (type) {
      case "header-one":
        StyledBlock = (props) => (
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100" {...props} />
        );
        break;
      case "header-two":
        StyledBlock = (props) => (
          <h2 className="text-3xl font-semibold mb-3 text-gray-800 dark:text-gray-200" {...props} />
        );
        break;
      case "blockquote":
        StyledBlock = (props) => (
          <blockquote className="border-l-4 border-gray-400 pl-4 py-2 my-4 italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-r-lg" {...props} />
        );
        break;
      case "unstyled":
      default:
        StyledBlock = (props) => (
          <p className="text-lg leading-relaxed mb-4 text-gray-700 dark:text-gray-300" {...props} />
        );
    }

    let styledText = text;
    if (inlineStyleRanges.length > 0) {
      inlineStyleRanges.forEach((range) => {
        const { offset, length, style } = range;
        const start = styledText.slice(0, offset);
        const middle = styledText.slice(offset, offset + length);
        const end = styledText.slice(offset + length);

        let styledFragment;
        switch (style) {
          case "BOLD":
            styledFragment = <strong className="font-bold text-gray-900 dark:text-gray-100">{middle}</strong>;
            break;
          case "ITALIC":
            styledFragment = <em className="italic text-gray-700 dark:text-gray-300">{middle}</em>;
            break;
          case "UNDERLINE":
            styledFragment = <u className="underline text-gray-800 dark:text-gray-200">{middle}</u>;
            break;
          default:
            styledFragment = middle;
        }

        styledText = <>{start}{styledFragment}{end}</>;
      });
    }

    return <StyledBlock key={index}>{styledText}</StyledBlock>;
  });
};

const RecipeDetailsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const { darkMode } = useDarkMode();
  const { user } = UserAuth(); // Access user from the AuthContext

  const userId = user ? user.email : null; // Use user.email if user is authenticated

  // Extract YouTube ID correctly
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
          `http://localhost:5000/api/recipes/${encodeURIComponent(id)}`
        );
        setRecipe(response.data);
        // Check if user already liked the recipe
        if (userId) {
          const alreadyLiked =
            Array.isArray(response.data.likes) &&
            response.data.likes.some((like) => like.userId === userId);
          setIsLiked(alreadyLiked); // Set initial like state
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

    const userId = user.email; // Use user email as the unique userId

    // Check if the user already liked the recipe
    const alreadyLiked =
      Array.isArray(recipe.likes) &&
      recipe.likes.some((like) => like.userId === userId);

    if (alreadyLiked) {
      alert("You have already liked this recipe!");
      return; // Don't proceed if already liked
    }

    try {
      // Send the like request to the backend
      const response = await axios.put(
        `http://localhost:5000/api/recipes/${recipe._id}/like`,
        { userId }
      );

      // Update the recipe's likes and set the liked state
      setRecipe((prevRecipe) => ({
        ...prevRecipe,
        likes: [...prevRecipe.likes, { userId }] // Add the current user's like to the list
      }));
      setIsLiked(true); // Mark as liked
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
  
  // Check for valid createdAt date
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
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden transform transition-all hover:scale-[1.01]">
        <div className="relative h-[500px] w-full group">
          <img
            src={recipe.coverImage || "/placeholder-recipe.jpg"}
            alt={recipe.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "/placeholder-recipe.jpg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h1 className="text-5xl font-bold text-white drop-shadow-lg mb-2">
              {recipe.title}
            </h1>
            <p className="text-gray-200 text-lg">{recipe.category}</p>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 pb-6 dark:border-gray-700">
            <div className="space-y-2">
              {recipe.author && (
                <p className="text-xl font-medium dark:text-gray-300">
                  Created by:{" "}
                  <span className="text-blue-600 dark:text-blue-400">
                    {recipe.author}
                  </span>
                </p>
              )}
              {recipe.email && (
                <p className="text-gray-600 dark:text-gray-400">
                  Contact: {recipe.email}
                </p>
              )}
              <p className="text-gray-500 dark:text-gray-400">
                Posted on: {formattedDate}
              </p>
            </div>

            <button
              onClick={handleLike}
              disabled={isLiked}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
                isLiked
                  ? "bg-pink-900/20 dark:bg-pink-900/30 text-pink-500 dark:text-pink-400"
                  : "bg-gray-100 dark:bg-gray-700 hover:bg-pink-100 dark:hover:bg-pink-900/30 text-gray-600 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400"
              }`}
            >
              <Heart className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`} />
              <span className="font-medium">{recipe.likes.length} likes</span>
            </button>
          </div>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h1 className="text-4xl font-bold">Instructions</h1>
            {renderStyledContent(parsedContent)}
          </div>
          {youtubeId && (
            <div className="mt-8">
              <h2 className="text-3xl font-semibold">Watch Recipe Video</h2>
              <div className="aspect-w-16 aspect-h-9 h-96 mt-4">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full rounded-lg shadow-lg"
                ></iframe>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailsPage;
