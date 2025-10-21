// require("dotenv").config();
// const App = require("./src/app");

// const app = new App();
// app.start();

//test:
const App = require('./src/app');

// Hàm main bất đồng bộ để có thể dùng await
async function main() {
  const app = new App();
  
  // SỬA LỖI: Gọi hàm init() và chờ nó hoàn tất...
  // Bước này sẽ kết nối tới DB và RabbitMQ.
  await app.init(); 
  
  // ...rồi mới bắt đầu start().
  // Mặc dù start() không làm gì nhiều, nó giữ cho process không bị thoát.
  app.start(); 
}

// Chạy hàm main để khởi động service
main();

