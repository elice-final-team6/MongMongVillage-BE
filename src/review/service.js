const mongoose = require("mongoose");
const Review = require("./model/review.schema");

class ReviewService {
  // 리뷰 생성
  static async createReview({ user_id, title, content, rating, images }) {
    try {
      const newReview = new Review({
        user_id,
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

  // 전체 리뷰 조회
  static async getAllReviews() {
    try {
      const reviews = await Review.find();
      return reviews;
    } catch (error) {
      throw error;
    }
  }

  // 리뷰 수정 - 구현 안됨
  static async updateReview(reviewId, updatedData) {
    try {
      const isValidObjectId = mongoose.isValidObjectId(reviewId);

      if (!isValidObjectId) {
        throw new Error("Invalid ObjectId");
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

  // 리뷰 삭제 - 구현 안됨
  static async deleteReview(reviewId) {
    try {
      const deletedReview = await Review.findByIdAndDelete(reviewId);
      return deletedReview;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ReviewService;
