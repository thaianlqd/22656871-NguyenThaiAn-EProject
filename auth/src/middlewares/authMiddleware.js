const jwt = require("jsonwebtoken");
const config = require("../config");

/**
 * Middleware to verify the token
 */

module.exports = function (req, res, next) {
  const token = req.header("authorization");
  console.log("Token received:", token);
  console.log("JWT Secret in middleware:", config.jwtSecret); // Log để kiểm tra

  console.log(token)
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    console.log("Token decoded successfully:", decoded); // Log payload nếu thành công
    req.user = decoded;
    next();
  } catch (e) {
    console.error("JWT Verify Error:", e.message); // Log lỗi chi tiết (ví dụ: "invalid signature")
    res.status(400).json({ message: "Token is not valid" });
  }
};
