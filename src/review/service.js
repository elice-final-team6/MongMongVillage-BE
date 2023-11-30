const mongoose = require("mongoose");
const { User, Admin } = require("../user/model/user.schema");
const Review = require("./model/review.schema");
const UserService = require("../user/service");

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

  static async getAllReviews({ page = 1, itemsPerPage = 10, sortBy }) {
    try {
      let sortOption = {};

      if (sortBy === "latest") {
        sortOption = { createdAt: -1 };
      } else if (sortBy === "popular") {
        sortOption = { rating: -1 };
      }

      const reviews = await Review.find()
        .sort(sortOption)
        .skip((page - 1) * itemsPerPage)
        .limit(itemsPerPage)
        .populate({
          path: "cafe_id",
          select: "name",
        });

      const totalReviews = await Review.countDocuments(); // 전체 리뷰 수 조회

      return { reviews, totalReviews };
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
        throw new Error("리뷰가 존재하지 않습니다.");
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

  // static async getReviewsByUser(
  //   userId,
  //   { page = 1, itemsPerPage = 10, sortBy }
  // ) {
  //   try {
  //     let sortOption = {};

  //     if (sortBy === "latest") {
  //       sortOption = { createdAt: -1 };
  //     } else if (sortBy === "popular") {
  //       sortOption = { rating: -1 };
  //     }

  //     const reviews = await Review.find({
  //       user_id: mongoose.Types.ObjectId(userId),
  //     })
  //       .sort(sortOption)
  //       .skip((page - 1) * itemsPerPage)
  //       .limit(itemsPerPage)
  //       .populate({
  //         path: "cafe_id",
  //         select: "name",
  //       });

  //     return reviews;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  static async deleteReview(userId, reviewId) {
    try {
      let options;
      const admin = await Admin.findById({ _id: userId });
      if (admin) options = { _id: reviewId };
      else options = { _id: reviewId, user_id: userId };

      const result = await Review.findOneAndDelete(options);

      if (!result) {
        return {
          status: 404,
          message: "게시글이 존재하지 않습니다.",
        };
      }

      return {
        status: 200,
        message: "게시글이 삭제되었습니다.",
        data: result,
      };
    } catch (error) {
      throw error;
    }
  }

  static async getUserReviews(userId) {
    try {
      const reviews = await Review.find({ user_id: userId });
      return reviews;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

module.exports = ReviewService;
