const express = require("express");
const asyncHandler = require("../utils/async-handler");
const { Review } = require("./model/review.schema");
const ReviewService = require("./service");
const JwtMiddleware = require("../middleware/jwt-handler");
const multer = require("multer");
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // 이미지를 저장할 디렉토리 설정
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // 파일명 설정 (현재 시간 + 원본 파일명)
  },
});

const upload = multer({ storage: storage });

// 리뷰 작성
router.post(
  "/",
  JwtMiddleware.checkToken,
  upload.single("image"),
  asyncHandler(async (req, res) => {
    try {
      const { title, content, rating } = req.body;
      const userId = req.token.userId;
      const reviewId = req.params.reviewId;

      // 이미지 데이터
      const imageBuffer = req.file.buffer;

      // 이미지를 업로드하고 URL을 받아옴
      const uploadedURL = await uploadImageToServer(imageBuffer);

      const createReview = await ReviewService.createReview({
        user_id: userId,
        review_id: reviewId,
        title,
        content,
        rating,
        images: [uploadedURL], // 이미지 경로를 배열에 추가
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

// 이미지 업로드 함수
async function uploadImageToServer(imageBuffer) {
  // 이미지 받아와서 반환해줌
  return "uploads/" + Date.now() + "-uploaded.jpg";
}

// 리뷰 리스트 조회
router.get(
  "/",
  JwtMiddleware.checkToken,
  asyncHandler(async (req, res) => {
    try {
      // const userId = req.token.userId;
      const reviewId = req.params.reviewId;

      const reviews = await ReviewService.getAllReviews();
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
  JwtMiddleware.checkToken,
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
"/:reviewId",
  JwtMiddleware.checkToken,
  asyncHandler(async (req, res) => {
    try {
      const userId = req.token.userId;
      const reviewId = req.params.reviewId;
      const updatedReview = await ReviewService.updateReview(
        userId,
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
  });

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
