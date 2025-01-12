"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useDarkMode } from "../DarkModeContext";
import hrecipes from "../../lib/Homepagerecipe.json";

// Separate component for the search params logic
const RecipeContent = () => {
  const searchParams = useSearchParams();
  const [id, setId] = useState(null);
  const { darkMode } = useDarkMode();

  useEffect(() => {
    const mealId = searchParams.get("id");
    if (mealId) {
      setId(mealId);
    }
  }, [searchParams]);

  // Get the recipe based on the id
  const recipe = id ? hrecipes.find((r) => r.id === parseInt(id)) : null;

  // Handle missing recipe
  if (!recipe) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
        }`}
      >
        <p className="text-xl font-semibold">Recipe not found!</p>
      </div>
    );
  }

  // Split the instructions into steps
  const instructions = recipe.instruction.split("\n");

  // Extract YouTube ID
  const extractYouTubeId = (url) => {
    const regex =
      /(?:youtube\.com\/(?:[^\/\n\s]*\/\S+\/|\S+\/|\S+\/v=|v\/|e(?:mbed)?\/|watch\?v=|embed\/v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const youtubeId = recipe.youtubeLink ? extractYouTubeId(recipe.youtubeLink) : null;

  return (
    <div
      className={`min-h-screen w-full py-12 px-4 transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden transform transition-all hover:scale-[1.01]">
        {/* Recipe Image Section */}
        <div className="relative h-[500px] w-full group">
          <img
            src={recipe.imageLink}
            alt={recipe.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "/placeholder-recipe.jpg"; // Fallback image
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h1 className="text-5xl font-bold text-white drop-shadow-lg mb-2">
              {recipe.title}
            </h1>
          </div>
        </div>

        {/* Recipe Instructions Section */}
        <div className="p-8 space-y-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2 className="text-3xl font-bold text-gray-600 dark:text-gray-300 mb-4">
              Recipe Instructions
            </h2>
            <div className="mt-4 space-y-4 pl-6">
              {instructions.map((step, index) => (
                <p key={index} className="text-gray-700 dark:text-gray-300">
                  {step}
                </p>
              ))}
            </div>
          </div>

          {/* YouTube Video Section */}
          {youtubeId && (
            <div className="flex justify-center items-center">
              <iframe
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full aspect-video"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Loading component
const LoadingComponent = () => (
  <div className="min-h-screen flex items-center justify-center">
    <p className="text-xl font-semibold">Loading...</p>
  </div>
);

// Main page component with Suspense boundary
const Page = () => {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <RecipeContent />
    </Suspense>
  );
};

export default Page;