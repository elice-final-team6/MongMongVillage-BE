const express = require("express");
const asyncHandler = require("../utils/async-handler");
const { Review } = require("./model/review.schema");
const ReviewService = require("./service");
const JwtMiddleware = require("../middleware/jwt-handler");
const router = express.Router();

const { imageUploadConfig } = require("../utils/s3-multer");
const reviewsUpload = imageUploadConfig("review");

// 리뷰 작성
router.post(
  "/",
  JwtMiddleware.checkToken,
  reviewsUpload.array("images"),
  async (req, res, next) => {
    try {
      const { title, content, rating, cafe_id } = req.body;
      const userId = req.token.userId;

      const imageUrl = req.files ? req.files.map((file) => file.location) : [];

      const createReview = await ReviewService.createReview({
        user_id: userId,
        cafe_id: cafe_id,
        title,
        content,
        rating,
        images: imageUrl,
      });

      res.status(201).json({
        status: 201,
        message: "리뷰가 작성되었습니다",
        data: createReview,
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({
        status: 400,
        message: "Error",
        error: error.message,
      });
    }
  }
);

// 리뷰 리스트 조회
router.get(
  "/",
  asyncHandler(async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const itemsPerPage = parseInt(req.query.itemsPerPage) || 10;
      const sortBy = req.query.sortBy;

      const { reviews, totalReviews } = await ReviewService.getAllReviews({
        page,
        itemsPerPage,
        sortBy,
      });

      res.status(200).json({
        status: 200,
        message: "Success",
        data: {
          reviews,
          totalReviews,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 500,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  })
);

// 특정 리뷰 조회
router.get(
  "/:reviewId",
  asyncHandler(async (req, res) => {
    try {
      const reviewId = req.params.reviewId;
      const userId = req.query.userId;

      const review = await ReviewService.getReviewById(reviewId, userId);

      if (!review) {
        res.status(404).json({
          status: 404,
          message: "리뷰를 찾을 수 없습니다.",
        });
        return;
      }

      const responseData = {
        status: 200,
        message: "성공",
        data: {
          review,
          user: {
            _id: review.user_id._id,
            nickname: review.user_id.nickname,
            profileImage: review.user_id.profileImage || null,
          },
        },
      };

      res.status(200).json(responseData);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 500,
        message: "내부 서버 오류",
        error: error.message,
      });
    }
  })
);

// 리뷰 수정
router.patch(
  "/:reviewId",
  JwtMiddleware.checkToken,
  reviewsUpload.array("images"),
  asyncHandler(async (req, res) => {
    try {
      const userId = req.token.userId;
      const reviewId = req.params.reviewId;
      const { title, content, rating } = req.body;

      const updatedData = {
        title,
        content,
        rating,
      };

      if (req.files && req.files.length > 0) {
        updatedData.images = req.files.map((file) => file.location);
      }

      const updatedReview = await ReviewService.updateReview(
        userId,
        reviewId,
        updatedData
      );

      res.status(200).json({
        status: 200,
        message: "리뷰가 수정되었습니다",
        data: updatedReview,
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({
        status: 400,
        message: "Error",
        error: error.message,
      });
    }
  })
);

router.delete(
  "/:reviewId",
  JwtMiddleware.checkToken,
  asyncHandler(async (req, res) => {
    const userId = req.token.userId;
    const reviewId = req.params.reviewId;

    const deletedReview = await ReviewService.deleteReview(userId, reviewId);
    if (deletedReview) {
      res.status(200).json({
        status: 200,
        message: "게시글이 삭제되었습니다.",
        data: deletedReview,
      });
    } else {
      res.status(404).json({
        status: 404,
        message: "게시글이 존재하지 않습니다.",
      });
    }
  })
);

// 사용자가 작성한 리뷰
router.get(
  "/:userId/my-reviews",
  JwtMiddleware.checkToken,
  asyncHandler(async (req, res) => {
    try {
      const targetUserId = req.params.userId; // 특정 사용자의 ID
      const page = parseInt(req.query.page) || 1;
      const itemsPerPage = parseInt(req.query.itemsPerPage) || 10;
      const sortBy = req.query.sortBy;

      const reviews = await ReviewService.getReviewsByUser(targetUserId, {
        page,
        itemsPerPage,
        sortBy,
      });

      res.status(200).json({
        status: 200,
        message: "Success",
        data: reviews,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 500,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  })
);

module.exports = router;
