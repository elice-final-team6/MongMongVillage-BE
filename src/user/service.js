const { User, Admin } = require("./model/user.schema");
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
  async authenticateUser(email, password, roles) {
    for (const role of roles) {
      let foundUser;

      if (role === "User") {
        foundUser = await User.findOne({ email });
      } else if (role === "Admin") {
        foundUser = await Admin.findOne({ email });
      }

      if (foundUser) {
        const passwordMatch = await bcrypt.compare(
          password,
          foundUser.password
        );
        if (passwordMatch) {
          // 비밀번호 일치하는 경우
          return { success: true, user: foundUser };
        } else {
          // 비밀번호 일치하지 않는 경우
          return { success: false, fail: "password" };
        }
      }
    }

    // 모두 찾지 못한 경우
    console.log("가입되지 않은 이메일입니다.", email);
    return { success: false, fail: "email" };
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
