const express = require("express");
const asyncHandler = require("../utils/async-handler");
const { Review } = require("./model/review.schema");
const ReviewService = require("./service");
const JwtMiddleware = require("../middleware/jwt-handler");
const router = express.Router();

// 리뷰 작성
router.post(
  "/",
  JwtMiddleware.checkToken,
  asyncHandler(async (req, res) => {
    try {
      const { title, content, rating, images } = req.body;
      const userId = req.token.userId;

      const createReview = await ReviewService.createReview({
        user_id: userId,
        title,
        content,
        rating,
        images,
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
  })
);

// 리뷰 리스트 조회
router.get(
  "/",
  asyncHandler(async (req, res) => {
    try {
      const reviews = await ReviewService.getAllReviews();
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

// 리뷰 수정 - 400에러, 코드 수정하기
router.put(
  "/:reviewId",
  JwtMiddleware.checkToken,
  asyncHandler(async (req, res) => {
    try {
      const reviewId = req.token.userId;
      const updatedReview = await ReviewService.updateReview(
        reviewId,
        req.body
      );

      res.status(201).json({
        status: 201,
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
    const deletedReview = await ReviewService.deleteReview(req.token.reviewId);
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
