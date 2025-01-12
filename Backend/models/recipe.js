const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema(
  {
    autoid: { type: Number, default: 0, unique: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: { type: String, required: true },
    author: { type: String, required: false },
    email: { type: String, required: false },
    category: { type: String, required: true },
    youtube: {type:String, required: false},
    likes: [
      {
        userId: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

recipeSchema.pre('save', async function(next) {
  if (this.isNew) {
    const lastRecipe = await this.constructor.findOne({}, {}, { sort: { 'autoid': -1 } });
    this.autoid = lastRecipe ? lastRecipe.autoid + 1 : 1;
  }
  next();
});

module.exports = mongoose.model('Recipe', recipeSchema);
