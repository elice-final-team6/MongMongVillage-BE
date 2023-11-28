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
  reviewsUpload.array("images"), // 이미지 업로드 설정 추가
  async (req, res, next) => {
    try {
      const { title, content, rating } = req.body;
      const userId = req.token.userId;

      // 이미지 업로드가 진행되었을 때 이미지 경로를 저장
      const imageUrl = req.files ? req.files.map((file) => file.location) : [];

      const createReview = await ReviewService.createReview({
        user_id: userId,
        title,
        content,
        rating,
        images: imageUrl, // 이미지 경로 추가
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
      const reviewId = req.params.reviewId;
      const sortBy = req.query.sortBy; // 쿼리 매개변수로 sortBy 받음

      // 전체 리뷰 조회 메서드에 필터링 옵션 전달
      const reviews = await ReviewService.getAllReviews({ sortBy });

      res.status(200).json({
        status: 200,
        message: "Success",
        reviewId,
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

// 특정 리뷰 조회
router.get(
  "/:reviewId",
  asyncHandler(async (req, res) => {
    try {
      const reviewId = req.params.reviewId;
      const review = await ReviewService.getReviewById(reviewId);

      if (!review) {
        res.status(404).json({
          status: 404,
          message: "리뷰를 찾을 수 없습니다.",
        });
        return;
      }
      res.status(200).json({
        status: 200,
        message: "성공",
        data: review,
      });
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
  reviewsUpload.array("images"), // 이미지 업로드 설정 추가
  asyncHandler(async (req, res) => {
    try {
      const userId = req.token.userId;
      const reviewId = req.params.reviewId;
      const { title, content, rating } = req.body;

      // 수정할 데이터를 객체에 담음
      const updatedData = {
        title,
        content,
        rating,
      };

      // 이미지가 업로드된 경우에만 업로드된 이미지 경로를 추가
      if (req.files && req.files.length > 0) {
        updatedData.images = req.files.map((file) => file.location);
      }

      const updatedReview = await ReviewService.updateReview(
        userId,
        reviewId,
        updatedData // 수정된 데이터 전달
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
      // 삭제된 게시글이 없는 경우
      res.status(404).json({
        status: 404,
        message: "게시글이 존재하지 않습니다.",
      });
    }
  })
);

module.exports = router;
