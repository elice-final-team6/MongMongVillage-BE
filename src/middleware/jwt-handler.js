const JWT = require("../utils/jwt");

class JwtMiddleware {
  // 토큰 유무 확인
  static checkToken(req, res, next) {
    const auth = req.header("Authorization");
    if (!auth) {
      return res.status(401).json({ error: "인증 실패 (토큰이 없습니다)" });
    }
    try {
      req.token = JWT.verifyToken(auth.split(" ")[1]);
      next();
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  }
}

module.exports = JwtMiddleware;
