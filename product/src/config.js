// require("dotenv").config();

// module.exports = {
//   port: process.env.PORT || 3001,
//   mongoURI: process.env.MONGODB_PRODUCT_URI || "mongodb://localhost/products",
//   rabbitMQURI: process.env.RABBITMQ_URI || "amqp://localhost",
//   exchangeName: "products",
//   queueName: "products_queue",
// };


//test: 

require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3001,
  mongoURI: process.env.MONGODB_PRODUCT_URI || "mongodb://localhost:27017/ThaianProductService",  
  rabbitMQURI: process.env.RABBITMQ_URI || "amqp://guest:guest@localhost:5672",  
  exchangeName: "products",
  queueName: "products_queue",
};