const Joi = require("joi");
const mongoose = require("mongoose");
const { Schema } = mongoose;

// 회원
const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  nickname: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["USER", "ADMIN"],
    default: "USER",
  },
  profilePicture: {
    type: String,
    default: null,
  },
  introduction: {
    type: String,
  },
});

// 관리자
const adminSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  nickname: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["ADMIN"],
    default: "ADMIN",
  },
  profilePicture: {
    type: String,
    default: null,
  },
  introduction: {
    type: String,
  },
});

// 회원 Joi 스키마 정의
const userJoiSchema = Joi.object({
  email: Joi.string().email().required(),
  nickname: Joi.string().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().default("USER"),
});

// 관리자 Joi 스키마 정의
const adminJoiSchema = Joi.object({
  email: Joi.string().email().required(),
  nickname: Joi.string().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid("ADMIN").default("ADMIN"),
});

const User = mongoose.model("User", userSchema);
const Admin = mongoose.model("Admin", adminSchema);

module.exports = {
  User,
  Admin,
  JoiSchemas: {
    user: userJoiSchema,
    admin: adminJoiSchema,
  },
};
