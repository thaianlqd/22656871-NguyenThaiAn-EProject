module.exports = {
  env: {
    node: true,
    es2021: true,
    mocha: true,
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  // THÊM TOÀN BỘ PHẦN "RULES" NÀY VÀO
  rules: {
    // Cấu hình lại quy tắc "no-unused-vars"
    "no-unused-vars": [
      "error", // Vẫn báo lỗi nếu có biến không dùng...
      {
        // ...NHƯNG bỏ qua các tham số hàm (args) bắt đầu bằng dấu gạch dưới
        "argsIgnorePattern": "^_", 
      },
    ],
  },
};

