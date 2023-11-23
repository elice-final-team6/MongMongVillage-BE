const express = require("express");
const asyncHandler = require("../utils/async-handler");
const router = express.Router();
const userService = require("./service");
const { JoiSchema: userJoiSchema } = require("./model/user.schema");
const JWT = require("../utils/jwt");
const mongoose = require("mongoose");
const JwtMiddleware = require("../middleware/jwt-handler");
const auth = require("../middleware/auth");

// 회원가입
router.post(
  "/signup",
  asyncHandler(async (req, res) => {
    try {
      const { error } = userJoiSchema.validate(req.body);
      // 입력 데이터 유효성 검사
      if (error) {
        return res.status(400).json({
          message: "Validation Error",
          error: error.details.map((detail) => detail.message),
        });
      }

      const user = await userService.createUser(req.body);
      // 회원가입 성공
      res.status(201).json({
        status: 201,
        message: "회원가입 성공",
      });
    } catch (error) {
      if (error.code === 11000 && error.keyPattern.email) {
        // 이메일 중복 에러
        return res.status(400).json({
          status: 400,
          message: "Duplicate email",
          error: "This email address is already registered.",
        });
      }
      // 기타 에러는 콘솔에 로깅
      console.error(error);
      res.status(400).json({
        status: 400,
        message: "Error",
        error: "An error occurred while processing your request.",
      });
    }
  })
);

// 로그인
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const userLogin = await userService.authenticateUser(email, password);

    // 로그인 안됨
    if (!userLogin.success) {
      // 가입되지 않은 이메일
      if (userLogin.fail == "email") {
        return res.status(401).json({
          status: 401,
          message: "가입되지 않은 이메일입니다.",
        });
      } else if (userLogin.fail == "password") {
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

    res.status(200).json({
      status: 200,
      message: "로그인 성공",
      data: token,
    });
  })
);

// // 로그아웃
// router.get(
//   "/logout",
//   auth,
//   asyncHandler(async (req, res) => {
//     try {
//       await User.findByIdAndUpdate(req.user._id, { token: "" });

//       res.status(200).json({
//         status: 200,
//         message: "로그아웃 성공",
//       });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({
//         status: 500,
//         message: "내부 서버 오류",
//         error: "로그아웃 중에 오류가 발생했습니다.",
//       });
//     }
//   })
// );

// 회원 정보 조회
router.get(
  "/:userId",
  JwtMiddleware.checkToken,
  asyncHandler(async (req, res) => {
    const userId = req.token.userId;

    // ObjectId가 유효한지 확인
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        status: 400,
        message: "Invalid ObjectId",
      });
    }

    try {
      const user = await userService.getUserById(userId);

      if (!user) {
        res.status(404).json({
          status: 404,
          message: "회원이 존재하지 않습니다.",
        });
      } else {
        res.status(200).json({
          status: 200,
          message: "조회 성공",
          data: user,
        });
      }
    } catch (error) {
      res.status(400).json({
        status: 400,
        message: "Invalid ObjectId",
      });
    }
  })
);

// 회원 정보 수정
router.patch("/:userId", JwtMiddleware.checkToken, async (req, res) => {
  try {
    const userId = req.token.userId;

    const updatedUserInfo = req.body;

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
});

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

module.exports = router;
