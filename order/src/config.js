// require('dotenv').config();

// module.exports = {
//     mongoURI: process.env.MONGODB_ORDER_URI || 'mongodb://localhost/orders',
//     rabbitMQURI: 'amqp://localhost',
//     rabbitMQQueue: 'orders',
//     port: 3002
// };
  

  require('dotenv').config();

  module.exports = {
    // Đọc URI từ biến môi trường, nếu không có thì dùng localhost (cho CI)
    mongoURI: process.env.MONGODB_ORDER_URI || 'mongodb://localhost:27017/ThaianOrderService',
    rabbitMQURI: process.env.RABBITMQ_URI || 'amqp://localhost',
    
    // Các queue mà service này tương tác
    orderQueue: 'orders',
    productQueue: 'products',

    port: process.env.PORT || 3002
  };

