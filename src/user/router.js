const express = require("express");
const asyncHandler = require("../utils/async-handler");
const router = express.Router();
const userService = require("./service");
const { JoiSchemas: userJoiSchemas } = require("./model/user.schema");
const JWT = require("../utils/jwt");
const mongoose = require("mongoose");
const JwtMiddleware = require("../middleware/jwt-handler");
const auth = require("../middleware/auth");
const { imageUploadConfig } = require("../utils/s3-multer");
const profileUpload = imageUploadConfig("user");
const { User } = require("./model/user.schema");
const ReviewService = require("../review/service");

// 토큰 유효성 검사
router.get("/token-check", JwtMiddleware.checkToken, (req, res) => {
  res.status(200).json({
    status: 200,
    message: "Token is valid",
  });
});

// 회원가입
router.post(
  "/signup",
  asyncHandler(async (req, res) => {
    try {
      const { error } = userJoiSchemas.user.validate(req.body);

      // 유효성 검사
      if (error) {
        throw {
          status: 400,
          message: "Validation Error",
          error: error.details.map((detail) => detail.message),
        };
      }

      // 회원가입 성공
      const user = await userService.createUser(req.body);

      res.status(201).json({
        status: 201,
        message: "회원가입 성공",
      });
    } catch (error) {
      if (error.code === 11000 && error.keyPattern.email) {
        // 이메일 중복 에러
        return res.status(400).json({
          status: 400,
          message: "중복된 이메일",
          error: "이미 등록된 이메일 주소입니다.",
        });
      }
      console.error(error);
      res.status(error.status || 500).json({
        status: error.status || 500,
        message: error.message || "Internal Server Error",
        error: error.error || "요청 처리 중에 오류가 발생했습니다.",
      });
    }
  })
);

// 로그인
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // 사용자와 관리자를 모두 확인
    const userLogin = await userService.authenticateUser(email, password, [
      "User",
      "Admin",
    ]);

    // 로그인 안됨
    if (!userLogin.success) {
      // 가입되지 않은 이메일
      if (userLogin.fail == "email") {
        console.log("가입되지 않은 이메일입니다.", email);
        return res.status(401).json({
          status: 401,
          message: "가입되지 않은 이메일입니다.",
        });
      } else if (userLogin.fail == "password") {
        console.log("비밀번호가 올바르지 않습니다.", email);
        return res.status(401).json({
          status: 401,
          message: "비밀번호가 올바르지 않습니다.",
        });
      }
    }

    const { user } = userLogin;
    const { role } = user;

    const tokenPayload = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };

    const token = JWT.createToken(tokenPayload);

    // 관리자계정인 경우
    if (role === "ADMIN") {
      console.log("관리자 로그인 성공");
      await User.findByIdAndUpdate(user._id, { role: "ADMIN" });
    }

    res.status(200).json({
      status: 200,
      message: "로그인 성공",
      data: { token, userId: user._id, role },
    });
  })
);

// 회원 정보 조회
router.get(
  "/:userId",
  asyncHandler(async (req, res) => {
    const userId = req.params.userId;

    try {
      const user = await userService.getUserById(userId);

      if (!user) {
        return res.status(404).json({
          status: 404,
          message: "회원이 존재하지 않습니다.",
        });
      }

      return res.status(200).json({
        status: 200,
        message: "조회 성공",
        data: { ...user.toObject(), password: undefined },
      });
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        status: 400,
        message: "Invalid UserId",
      });
    }
  })
);

// 회원 정보 수정
router.patch(
  "/:userId",
  JwtMiddleware.checkToken,
  profileUpload.single("profilePicture"),
  async (req, res) => {
    try {
      const userId = req.token.userId;

      const updatedUserInfo = req.body;

      if (req.file) {
        updatedUserInfo.profilePicture = req.file.location;
      }

      const updatedUser = await userService.updateUser(userId, updatedUserInfo);

      res.status(200).json({
        status: 200,
        message: "사용자 업데이트 성공",
        data: updatedUser,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 500,
        message: "내부 서버 오류",
        error: "사용자 업데이트 중에 오류가 발생했습니다.",
      });
    }
  }
);

// 회원탈퇴
router.delete(
  "/:userId",
  JwtMiddleware.checkToken,
  asyncHandler(async (req, res) => {
    const userId = req.token.userId;

    try {
      const user = await userService.deleteUser(userId);

      if (!user) {
        res.status(404).json({
          status: 404,
          message: "회원이 존재하지 않습니다.",
        });
      } else {
        res.status(200).json({
          status: 200,
          message: "회원탈퇴 성공",
          data: user,
        });
      }
    } catch (error) {
      res.status(400).json({
        status: 400,
        message: "회원탈퇴 실패",
      });
    }
  })
);

// 이메일 중복 확인
router.get(
  "/check-email/:email",
  asyncHandler(async (req, res) => {
    const email = req.params.email;

    try {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        // 중복된 이메일이 이미 존재할 경우
        return res.status(200).json({
          status: 200,
          message: "이메일 중복되었습니다(사용불가)",
          data: { isDuplicate: true },
        });
      }

      // 중복된 이메일이 없을 경우
      res.status(200).json({
        status: 200,
        message: "중복되지 않은 이메일입니다(사용가능)",
        data: { isDuplicate: false },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 500,
        message: "내부 서버 오류",
        error: "이메일 중복 확인 중에 오류가 발생했습니다.",
      });
    }
  })
);

// 닉네임 중복 확인
router.get(
  "/check-nickname/:nickname",
  asyncHandler(async (req, res) => {
    const nickname = req.params.nickname;

    try {
      const existingUser = await User.findOne({ nickname });

      if (existingUser) {
        // 중복된 닉네임이 이미 존재할 경우
        return res.status(200).json({
          status: 200,
          message: "닉네임 중복되었습니다(사용불가)",
          data: { isDuplicate: true },
        });
      }

      // 중복된 닉네임이 없을 경우
      res.status(200).json({
        status: 200,
        message: "중복되지 않은 닉네임입니다(사용가능)",
        data: { isDuplicate: false },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 500,
        message: "내부 서버 오류",
        error: "닉네임 중복 확인 중에 오류가 발생했습니다.",
      });
    }
  })
);

module.exports = router;
