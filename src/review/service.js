const mongoose = require("mongoose");
const { User, Admin } = require("../user/model/user.schema");
const Review = require("./model/review.schema");
const Cafe = require("../cafe/model/cafe.schema");

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

      await this.updateCafeRating(cafe_id);

      return writeReview;
    } catch (error) {
      throw error;
    }
  }

  static async getAllReviews({ page = 1, itemsPerPage = 10, sortBy }) {
    try {
      let sortOption = {};
      if (sortBy === 'latest') sortOption = { createdAt: -1 };
      else if(sortBy === 'popular') sortOption = { rating: -1, createdAt: -1 };

      console.log(sortOption);
      const reviews = await Review.find()
        .sort(sortOption)
        .skip((page - 1) * itemsPerPage)
        .limit(itemsPerPage)
        .populate({
          path: "cafe_id",
          select: "name",
        });

      const totalReviews = await Review.countDocuments();

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
          select: "name",
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

      await this.updateCafeRating(updatedReview.cafe_id);

      return updatedReview;
    } catch (error) {
      throw error;
    }
  }

  static async updateCafeRating(cafeId) {
    try {
      const reviews = await Review.find({ cafe_id: cafeId });

      if (reviews.length > 0) {
        const totalRating = reviews.reduce(
          (sum, review) => sum + review.rating,
          0
        );
        const averageRating = totalRating / reviews.length;

        const updatedCafe = await Cafe.findByIdAndUpdate(cafeId, {
          rating: parseFloat(averageRating.toFixed(1)),
        });
      } else {
        // 리뷰가 없을 경우 rating = 0
        await Cafe.findByIdAndUpdate(cafeId, { rating: 0 });
      }
    } catch (error) {
      console.error("카페 평점 업데이트 중 오류 발생:", error);
      throw error;
    }
  }

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

      await this.updateCafeRating(result.cafe_id);

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
