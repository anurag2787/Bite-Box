const express = require('express');
const router = express.Router();
const Recipe = require('../models/recipe');

// POST route to create a new recipe
router.post('/recipes', async (req, res) => {
  try {
    const { title, content, coverImage, username, email, category, youtube } = req.body;

    // Validate required fields
    if (!title || !content || !coverImage || !username || !email || !category) {
      return res.status(400).send('All fields are required');
    }

    // Create a new recipe document
    const newRecipe = new Recipe({
      title,
      content,
      coverImage,
      youtube,
      author: username,
      email,
      category,
    });

    await newRecipe.save();
    res.status(200).send('Recipe posted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// GET route to fetch all recipes
router.get('/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.status(200).json(recipes);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});
// GET route to fetch a recipe by _id
router.get('/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = await Recipe.findById(id );
    if (!recipe) {
      return res.status(404).send('Recipe not found');
    }
    res.status(200).json(recipe);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});
 // GET route to fetch a specific recipe by ID
// router.get('/recipes/:autoid', async (req, res) => {
//   try {
//     const { autoid } = req.params;
//     const recipe = await Recipe.findOne({autoid: autoid});
//     if (!recipe) {
//       return res.status(404).send('Recipe not found');
//     }
//     res.status(200).json(recipe);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Server error');
//   }
// });
// POST route to like a recipe
router.put('/recipes/:id/like', async (req, res) => {
  try {
       const { userId } = req.body;
       const recipe = await Recipe.findById(req.params.id);
       if (!recipe) {
         return res.status(404).json({ message: "Recipe not found!" });
       }
   
       // Check if the user already liked the post
       if (!recipe.likes.some((like) => like.userId === userId)) {
         // Add the user to likes
         recipe.likes.push({ userId });
   
           } else {
         return res.status(400).json({ message: "Already liked this recipe!" });
       }
   
       await recipe.save();
       res.status(200).json({ message: "Recipe liked!", likes: recipe.likes.length });
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
});

// GET route to fetch recipes by author
router.get('/recipes/:email', async (req, res) => {
  const { email } = req.query;
  try {
    const recipe = await Recipe.findOne( req.params.email );
    if (!recipes.length) {
      return res.status(404).send('No recipes found for this author');
    }
    res.status(200).json(recipe);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
