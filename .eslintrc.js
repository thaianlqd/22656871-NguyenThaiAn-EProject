module.exports = {
  // Môi trường chạy code
  env: {
    node: true,     // Cho phép các biến toàn cục của Node.js (require, module, process)
    es2021: true,   // Dùng chuẩn ES2021
    mocha: true,    // Cho phép các biến toàn cục của Mocha (describe, it, before, after)
  },
  // Kế thừa bộ quy tắc mặc định và tốt nhất của ESLint
  extends: "eslint:recommended",
  // Cấu hình cho trình phân tích code
  parserOptions: {
    ecmaVersion: "latest", // Luôn dùng phiên bản JavaScript mới nhất
    sourceType: "module",  // Cho phép dùng import/export (dù bạn đang dùng require)
  },
  // Các quy tắc tùy chỉnh (nếu bạn muốn)
  rules: {
    // Ví dụ: Bắt buộc dùng dấu chấm phẩy ở cuối dòng
    // "semi": ["error", "always"],
  },
};
