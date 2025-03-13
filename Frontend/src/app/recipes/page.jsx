"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { UserAuth } from "../context/AuthContext";
import { Heart } from "lucide-react";
import Loader from "@/Components/loader";

const RecipesPage = () => {
  const [recipes, setRecipes] = useState([]);
  const router = useRouter();
  const { user } = UserAuth();

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/api/recipes?limit=100`
        );
        setRecipes(response.data);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };

    fetchRecipes();
  }, []);

  const handleRecipeClick = (recipe) => {
    router.push(`/view?id=${encodeURIComponent(recipe._id)}`);
  };

  const handlePostRecipeClick = async () => {
    try {
      // Wait for 3 seconds to check user status
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (user) {
        router.push("/postrecipe");
      } else {
        alert("Only Registered Users can Post :)");
        router.push("/LoginPage");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const likeClick = async (e, recipeId) => {
    e.stopPropagation(); // Prevent triggering the recipe card click

    if (!user) {
      alert("Please login to like recipes");
      return;
    }

    const userId = user.email; // Use user email as the unique userId
    const recipe = recipes.find((recipe) => recipe._id === recipeId);
    if (!recipe) return;

    // Check if the user already liked the recipe
    const alreadyLiked =
      Array.isArray(recipe.likes) && recipe.likes.some((like) => like.userId === userId);

    if (alreadyLiked) {
      alert("You have already liked this recipe!");
      return;
    }

    // Optimistically update the UI for like count and heart color
    setRecipes((prevRecipes) =>
      prevRecipes.map((recipe) =>
        recipe._id === recipeId
          ? { ...recipe, likes: [...recipe.likes, { userId }] }
          : recipe
      )
    );

    // Send the like request to the backend
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/api/recipes/${recipeId}/like`,
        { userId }
      );

      // Update the recipes state with the new likes after server response
      setRecipes((prevRecipes) =>
        prevRecipes.map((recipe) =>
          recipe._id === recipeId
            ? { ...recipe, likes: response.data.likes }
            : recipe
        )
      );
    } catch (error) {
      console.error("Error liking recipe:", error);
      // Revert UI change if there was an error
      setRecipes((prevRecipes) =>
        prevRecipes.map((recipe) =>
          recipe._id === recipeId ? { ...recipe, likes: recipe.likes.slice(0, -1) } : recipe
        )
      );
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Header with Title and Post Recipe Button */}
      <div className="flex justify-between items-center m-6 mb-10">
        <h1 className="text-3xl font-bold">Recipes</h1>
        <button
          onClick={handlePostRecipeClick}
          className="bg-blue-500 text-white ml-2 md:ml-0 md:text-sm text-xs px-4 py-2 rounded-xl hover:bg-blue-600"
        >
          Post New Recipe
        </button>
      </div>
      {recipes.length === 0 && (<div className="w-full"><Loader/></div>)}
      {/* Recipe Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        

        {recipes.length>0 && ( <>
          {recipes.map((recipe) => (
            <div
              key={recipe._id}
              className="border rounded-lg p-4 cursor-pointer hover:shadow-lg"
              onClick={() => handleRecipeClick(recipe)}
            >
              {/* Cover Image */}
              <img
                src={recipe.coverImage}
                alt={recipe.title}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              {/* Title and Likes */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{recipe.title}</h2>
                <div className="flex items-center">
                  <button onClick={(e) => likeClick(e, recipe._id)}>
                    <Heart
                      fill={
                        Array.isArray(recipe.likes) &&
                        recipe.likes.some((like) => like.userId === user?.email)
                          ? "#ec4899"
                          : "none"
                      }
                      stroke={
                        Array.isArray(recipe.likes) &&
                        recipe.likes.some((like) => like.userId === user?.email)
                          ? "#ec4899"
                          : "currentColor"
                      }
                      className="w-6 h-6"
                    />
                  </button>
                  <span className="text-lg ml-2">
                    {Array.isArray(recipe.likes) ? recipe.likes.length : 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
          </>
      )}
      </div>
    </div>
  );
};

export default RecipesPage;
