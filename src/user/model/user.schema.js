const Joi = require("joi");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const {
  Types: { ObjectId },
} = Schema;

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
    default: "USER",
  },
});

// Joi 스키마 정의
const userJoiSchema = Joi.object({
  email: Joi.string().email().required(),
  nickname: Joi.string().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().default("USER"),
});

module.exports = {
  User: mongoose.model("User", userSchema),
  JoiSchema: userJoiSchema,
};
