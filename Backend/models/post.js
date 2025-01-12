const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    text: { type: String, required: true },
    replies: [{ type: this }], // For nested replies
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    username: {type:String},
    title: { type: String, required: true },
    thumbnail: { type: String },
    content: { type: String, required: true },
    slug: { type: String, unique: true }, // Add slug field with unique constraint
    likes: [
      {
        userId: { type: String, required: true },
      },
    ],
    dislikes: [
      {
        userId: { type: String, required: true },
      },
    ],
    comments: [commentSchema],
  },
  { timestamps: true }
);

postSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric characters with "-"
      .replace(/^-+|-+$/g, "") // Trim leading/trailing "-"
      + "-" + Date.now(); // Append a timestamp to ensure uniqueness
  }
  next();
});

module.exports = mongoose.model("Post", postSchema);
