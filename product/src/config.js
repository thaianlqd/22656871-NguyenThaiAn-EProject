// require("dotenv").config();

// module.exports = {
//   port: process.env.PORT || 3001,
//   mongoURI: process.env.MONGODB_PRODUCT_URI || "mongodb://localhost/products",
//   rabbitMQURI: process.env.RABBITMQ_URI || "amqp://localhost",
//   exchangeName: "products",
//   queueName: "products_queue",
// };


//test: 

// require("dotenv").config();

// module.exports = {
//   port: process.env.PORT || 3001,
//   mongoURI: process.env.MONGODB_PRODUCT_URI || "mongodb://localhost:27017/ThaianProductService",  
//   rabbitMQURI: process.env.RABBITMQ_URI || "amqp://guest:guest@localhost:5672",  
//   exchangeName: "products",
//   queueName: "products_queue",
// };


//test tiep:
require('dotenv').config();

module.exports = {
    mongoURI: process.env.MONGODB_ORDER_URI || 'mongodb://localhost/orders',
    // SỬA LỖI: Đọc RabbitMQ URI từ biến môi trường
    rabbitMQURI: process.env.RABBITMQ_URI || 'amqp://localhost',
    rabbitMQQueue: 'orders',
    port: 3002
};
