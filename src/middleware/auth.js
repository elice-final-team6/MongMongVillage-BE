const express = require("express");
const JWT = require("../utils/jwt");

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({ error: "인증 실패: 토큰이 없습니다" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = JWT.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ error: "인증 실패: 유효하지 않은 토큰입니다" });
  }
};

module.exports = auth;
