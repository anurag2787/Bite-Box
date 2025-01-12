"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader } from "lucide-react";
import { useDarkMode } from "../DarkModeContext";

function Page() {
  const searchParams = useSearchParams();
  const [id, setId] = useState(null);
  const [mealDetails, setMealDetails] = useState(null);
  const { darkMode } = useDarkMode();

  // Extract `id` from the query parameters
  useEffect(() => {
    const mealId = searchParams.get("id");
    if (mealId) {
      setId(mealId);
    }
  }, [searchParams]);

  // Fetch meal details when `id` is available
  useEffect(() => {
    if (id) {
      fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
        .then((response) => response.json())
        .then((data) => setMealDetails(data.meals?.[0] || null));
    }
  }, [id]);

  if (!id || !mealDetails) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader size={48} />
      </div>
    );
  }

  // Split the instructions into steps
  const instructions = mealDetails.strInstructions.split(/\r?\n\r?\n/);

  return (
    <div
      className={`min-h-screen w-full py-12 px-4 transition-colors duration-300 ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
        }`}
    >
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden transform transition-all hover:scale-[1.01]">
        <div className="relative h-[500px] w-full group">
          <img
            src={mealDetails.strMealThumb}
            alt={mealDetails.strMeal}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "/placeholder-recipe.jpg"; // Fallback image
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h1 className="text-5xl font-bold text-white drop-shadow-lg mb-2">
              {mealDetails.strMeal}
            </h1>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h1 className="text-3xl font-bold text-gray-600 dark:text-gray-300 drop-shadow-lg mb-2">
              Recipe :
            </h1>
            <ul className="mt-4 space-y-4 pl-6">
              {instructions.map((step, index) => (
                <li key={index} className="text-gray-700 dark:text-gray-300">
                  {step}
                </li>
              ))}
            </ul>

          </div>

          <div className="p-8 space-y-8 flex justify-center items-center">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              {mealDetails.strYoutube ? (
                <iframe
                  width="560"
                  height="315"
                  src={`https://www.youtube.com/embed/${mealDetails.strYoutube.split('v=')[1]}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full aspect-video"
                />
              ) : (
                null
              )}
            </div>
          </div>

          {mealDetails.strSource ? (
            <h1 className="text-base font-bold text-gray-600 dark:text-gray-300 drop-shadow-lg mb-2">
              Source: <a className="text-sm mr-4" href={mealDetails.strSource}>{mealDetails.strSource}</a>
            </h1>) : null
          }


        </div>
      </div>
    </div>
  );
}

export default Page;
