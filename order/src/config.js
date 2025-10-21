require('dotenv').config();

module.exports = {
    mongoURI: process.env.MONGODB_ORDER_URI || 'mongodb://localhost/orders',
    // rabbitMQURI: 'amqp://localhost',
    rabbitMQURI: process.env.RABBITMQ_URI || 'amqp://guest:guest@localhost:5672',
    rabbitMQQueue: 'orders',
    productQueue: 'products', //test
    port: 3002
};
  
