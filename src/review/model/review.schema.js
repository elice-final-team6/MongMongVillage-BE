const mongoose = require("mongoose");
const { Schema } = mongoose;
const {
  Types: { ObjectId },
} = Schema;

const ReviewSchema = new Schema(
  {
    user_id: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      default: "USER",
    },
    title: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    images: [String],
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", ReviewSchema);

module.exports = Review;
