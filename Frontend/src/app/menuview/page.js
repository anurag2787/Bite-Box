"use client";
import React, { useEffect, useState } from "react";
import { useDarkMode } from "../DarkModeContext";
import Loader from "@/Components/loader";
import { ScreenShare } from "lucide-react";

function Page() {
  const [mealDetails, setMealDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { darkMode } = useDarkMode();

  useEffect(() => {
    const fetchMealDetails = async () => {
      try {
        // Get the ID from URL using URLSearchParams
        const urlParams = new URLSearchParams(document.location.search);
        const mealId = urlParams.get("id");

        if (mealId) {
          const response = await fetch(
            `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`
          );
          const data = await response.json();
          setMealDetails(data.meals?.[0] || null);
        }
      } catch (error) {
        console.error("Error fetching meal details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMealDetails();
  }, []);

  if (isLoading || !mealDetails) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        {/* <Loader className="animate-spin" size={48} /> */}
        <Loader />
      </div>
    );
  }

  // Split the instructions into steps
  const instructions = mealDetails.strInstructions.split(/\r?\n\r?\n/);

  // Extract YouTube video ID
  const getYouTubeId = (url) => {
    return url?.split('v=')?.[1] || '';
  };

  return (
    <div
      className={`min-h-screen w-full py-12 px-4 transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden transform transition-all hover:scale-[1.01]">
        <div className="relative h-[200px] md:h-[500px] w-full group">
          <img
            src={mealDetails.strMealThumb}
            alt={mealDetails.strMeal}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "/placeholder-recipe.jpg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h1 className="text-5xl font-bold text-white drop-shadow-lg mb-2">
              {mealDetails.strMeal}
            </h1>
          </div>
        </div>
        <div className="p-4 md:p-8 space-y-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h1 className="text-3xl font-bold text-gray-600 dark:text-gray-300 drop-shadow-lg mb-2">
              Recipe :
            </h1>
            <ul className="mt-4 space-y-4 pl-3 md:pl-6">
              {instructions.map((step, index) => (
                <li key={index} className="text-gray-700 dark:text-gray-300">
                  {step}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-8 space-y-8 flex justify-center items-center">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              {mealDetails.strYoutube && (
                <iframe
                  width="560"
                  height="315"
                  src={`https://www.youtube.com/embed/${getYouTubeId(mealDetails.strYoutube)}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-[300px] h-[200px] md:w-full md:h-[400px] aspect-video"
                />
              )}
            </div>
          </div>
          {mealDetails.strSource && (
            <h1 className="text-base font-bold text-gray-600 dark:text-gray-300 drop-shadow-lg mb-2">
              Source:{" "}
              <a 
                className="text-sm mr-4 text-slate-500 flex flex-center" 
                href={mealDetails.strSource}
                target="_blank"
                rel="noopener noreferrer"
              >
                {mealDetails.strSource} <ScreenShare className="w-5 ml-2"/>
              </a>
            </h1>
          )}
        </div>
      </div>
    </div>
  );
}

export default Page;