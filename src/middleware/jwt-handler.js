const JWT = require("../utils/jwt");

class JwtMiddleware {
  // 토큰 유무 및 토큰 유효성 검사
  static checkToken(req, res, next) {
    const auth = req.header("Authorization");

    if (!auth) {
      return res.status(401).json({ error: "인증 실패 (토큰이 없습니다)" });
    }

    try {
      const token = auth.split(" ")[1];
      const decoded = JWT.verifyToken(token);
      req.token = decoded;

      next();
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  }
}

module.exports = JwtMiddleware;
