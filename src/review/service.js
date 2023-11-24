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

  // 특정 리뷰 조회
  static async getReviewById(reviewId) {
    try {
      const review = await Review.findById(reviewId);
      return review;
    } catch (error) {
      throw error;
    }
  }

  // 리뷰 수정
  static async updateReview(userId, reviewId, updatedData) {
    try {
      const isValidObjectId = mongoose.isValidObjectId(reviewId);

      if (!isValidObjectId) {
        throw new Error("Invalid Review ObjectId");
      }

      // 리뷰가 존재하는지 확인
      const existingReview = await Review.findOne({
        _id: reviewId,
        user_id: userId,
      });

      if (!existingReview) {
        throw new Error("Review not found or user does not have permission");
      }

      // 리뷰 업데이트
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

  // 리뷰 삭제
  static async deleteReview(userId, reviewId) {
    try {
      const isValidObjectId = mongoose.isValidObjectId(reviewId);

      if (!isValidObjectId) {
        throw new Error("Invalid Review ObjectId");
      }

      // 리뷰가 존재하는지 확인
      const existingReview = await Review.findOne({
        _id: reviewId,
        user_id: userId,
      });

      if (!existingReview) {
        throw new Error("Review not found or user does not have permission");
      }

      // 리뷰 삭제
      const deletedReview = await Review.findByIdAndDelete(reviewId);

      return deletedReview;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ReviewService;
