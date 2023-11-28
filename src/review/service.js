const mongoose = require("mongoose");
const Review = require("./model/review.schema");

class ReviewService {
  static async createReview({
    user_id,
    cafe_id,
    title,
    content,
    rating,
    images,
  }) {
    try {
      const newReview = new Review({
        user_id,
        cafe_id,
        title,
        content,
        rating,
        images,
      });

      const writeReview = await newReview.save();
      return writeReview;
    } catch (error) {
      throw error;
    }
  }

  static async getAllReviews({ sortBy }) {
    try {
      let sortOption = {};

      if (sortBy === "latest") {
        sortOption = { createdAt: -1 };
      } else if (sortBy === "popular") {
        sortOption = { rating: -1 };
      }

      const reviews = await Review.find().sort(sortOption).populate({
        path: "cafe_id",
        select: "name",
      });

      return reviews;
    } catch (error) {
      throw error;
    }
  }

  static async getReviewById(reviewId, userId) {
    try {
      const review = await Review.findById(reviewId)
        .populate({
          path: "user_id",
          select: "-password",
        })
        .populate({
          path: "cafe_id",
          select: "name", // 필요한 카페 정보 선택
        });

      if (!review) {
        throw new Error("Review not found");
      }

      if (userId && review.user_id._id.toString() !== userId) {
        throw new Error("User does not have permission to view this review");
      }

      return review;
    } catch (error) {
      throw error;
    }
  }

  static async updateReview(userId, reviewId, updatedData) {
    try {
      const isValidObjectId = mongoose.isValidObjectId(reviewId);

      if (!isValidObjectId) {
        throw new Error("Invalid Review ObjectId");
      }

      const existingReview = await Review.findOne({
        _id: reviewId,
        user_id: userId,
      });

      if (!existingReview) {
        throw new Error("Review not found or user does not have permission");
      }

      const updatedReview = await Review.findByIdAndUpdate(
        reviewId,
        updatedData,
        { new: true }
      );

      return updatedReview;
    } catch (error) {
      throw error;
    }
  }

  // (이전 코드 생략)

  static async deleteReview(userId, reviewId) {
    try {
      const isValidObjectId = mongoose.isValidObjectId(reviewId);

      if (!isValidObjectId) {
        throw new Error("Invalid Review ObjectId");
      }

      const existingReview = await Review.findOne({
        _id: reviewId,
        user_id: userId,
      });

      if (!existingReview) {
        throw new Error("Review not found or user does not have permission");
      }

      const deletedReview = await Review.findByIdAndDelete(reviewId);

      return deletedReview;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ReviewService;
