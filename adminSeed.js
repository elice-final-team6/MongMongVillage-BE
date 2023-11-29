const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { User, Admin } = require("./src/user/model/user.schema"); // 모델의 경로에 맞게 수정
require("dotenv").config();

async function seedAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: "admin@mongmong.com" });

    if (existingAdmin) {
      console.log("Admin account already exists.");
      return;
    }

    // 관리자 계정 생성
    const adminData = {
      email: "admin@mongmong.com",
      nickname: "admin",
      password: await bcrypt.hash("adminpw1234", 10),
      role: "ADMIN",
    };

    const admin = await Admin.create(adminData);
    console.log("Admin account created:", admin);
  } catch (error) {
    console.error("Error seeding admin:", error);
  } finally {
    mongoose.disconnect();
  }
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

console.log("MongoDB URL:", process.env.MONGO_URL);

// Run the seeding function
seedAdmin();
