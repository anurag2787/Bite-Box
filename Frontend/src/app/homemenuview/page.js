"use client";
import React, { useState, useEffect } from "react";
import { useDarkMode } from "../DarkModeContext";
import hrecipes from '../../lib/Homepagerecipe.json';

function RecipeDisplay({ recipe, darkMode }) {
  if (!recipe) {
    return <p>Recipe not found!</p>;
  }

  const instructions = recipe.instruction.split('\n');

  const extractYouTubeId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]*\/\S+\/|\S+\/|\S+\/v=|v\/|e(?:mbed)?\/|watch\?v=|embed\/v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
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
        <div className="relative h-[200px] md:h-[500px] w-full group">
          <img
            src={recipe.imageLink}
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
          </div>
        </div>
        <div className="p-4 md:p-8 space-y-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h1 className="text-3xl font-bold text-gray-600 dark:text-gray-300 drop-shadow-lg mb-2">
              Recipe :
            </h1>
            <div className="mt-4 space-y-4 pl-3 md:pl-6">
              {instructions.map((step, index) => (
                <p key={index} className="text-gray-700 dark:text-gray-300">
                  {step}
                </p>
              ))}
            </div>
          </div>
          {youtubeId && (
            <div className="p-8 space-y-8 flex justify-center items-center">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <iframe
                  width="560"
                  height="315"
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-[300px] h-[200px] md:w-full md:h-[400px] aspect-video"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Page() {
  const [recipe, setRecipe] = useState(null);
  const { darkMode } = useDarkMode();

  useEffect(() => {
    // Get the ID from the URL using URLSearchParams
    const params = new URLSearchParams(document.location.search);
    const id = params.get('id');
    
    if (id) {
      const foundRecipe = hrecipes.find((r) => r.id === parseInt(id));
      setRecipe(foundRecipe);
    }
  }, []);

  // Show loading state
  if (!recipe) {
    return (
      <div className="min-h-screen w-full py-12 px-4 flex items-center justify-center">
        <div className="text-lg">Loading recipe...</div>
      </div>
    );
  }

  return <RecipeDisplay recipe={recipe} darkMode={darkMode} />;
}

export default Page;