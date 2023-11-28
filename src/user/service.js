const { User } = require("./model/user.schema");
const bcrypt = require("bcrypt");

class UserService {
  // 회원 생성
  async createUser(userInfo) {
    if (!userInfo.password) {
      throw new Error("Password is required.");
    }

    const existingEmail = await User.findOne({ email: userInfo.email });
    const existingNickname = await User.findOne({
      nickname: userInfo.nickname,
    });

    if (existingEmail) {
      throw {
        status: 400,
        message: "Duplicate email",
        error: "This email address is already registered.",
      };
    }

    if (existingNickname) {
      throw {
        status: 400,
        message: "Duplicate nickname",
        error: "This nickname is already taken.",
      };
    }

    const hashedPassword = await bcrypt.hash(userInfo.password, 10);
    userInfo.password = hashedPassword;

    const user = await User.create(userInfo);
    return user;
  }

  // 사용자 인증
  async authenticateUser(email, password) {
    const userEmail = await User.findOne({ email });

    if (!userEmail) {
      return { success: false, fail: "email" };
    }

    const passwordMatch = await bcrypt.compare(password, userEmail.password);
    if (!passwordMatch) {
      return { success: false, fail: "password" };
    }
    return { success: true, user: userEmail };
  }

  // 회원 정보 조회
  async getUserById(userId) {
    try {
      const user = await User.findById(userId).select("-password");

      // 프로필 이미지도 추가
      if (user) {
        user.profilePicture = user.profilePicture || null;
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  // 회원 정보 수정
  async updateUser(userId, updates) {
    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      throw { status: 404, message: "존재하지 않는 회원입니다." };
    }
    return user;
  }

  // 회원 삭제
  async deleteUser(userId) {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw { status: 404, message: "User not found" };
    }
    return user;
  }
}

module.exports = new UserService();
