// const amqp = require("amqplib");

// class MessageBroker {
//   constructor() {
//     this.channel = null;
//   }

//   async connect() {
//     console.log("Connecting to RabbitMQ...");

//     setTimeout(async () => {
//       try {
//         const connection = await amqp.connect("amqp://guest:guest@thaian_rabbitmq:5672");
//         this.channel = await connection.createChannel();
//         await this.channel.assertQueue("products");
//         console.log("RabbitMQ connected");
//       } catch (err) {
//         console.error("Failed to connect to RabbitMQ:", err.message);
//       }
//     }, 20000); // delay 10 seconds to wait for RabbitMQ to start
//   }

//   async publishMessage(queue, message) {
//     if (!this.channel) {
//       console.error("No RabbitMQ channel available.");
//       return;
//     }

//     try {
//       await this.channel.sendToQueue(
//         queue,
//         Buffer.from(JSON.stringify(message))
//       );
//     } catch (err) {
//       console.log(err);
//     }
//   }

//   async consumeMessage(queue, callback) {
//     if (!this.channel) {
//       console.error("No RabbitMQ channel available.");
//       return;
//     }

//     try {
//       await this.channel.consume(queue, (message) => {
//         const content = message.content.toString();
//         const parsedContent = JSON.parse(content);
//         callback(parsedContent);
//         this.channel.ack(message);
//       });
//     } catch (err) {
//       console.log(err);
//     }
//   }
// }

// module.exports = new MessageBroker();


//test:
const amqp = require("amqplib");
require("dotenv").config();

class MessageBroker {
  constructor() {
    this.channel = null;
  }

  async connect() {
    // Ngăn việc kết nối lại nếu đã có kết nối
    if (this.channel) {
      return;
    }

    console.log("Connecting to RabbitMQ...");
    try {
      // Đọc URI từ biến môi trường, nếu không có thì dùng localhost
      const connection = await amqp.connect(process.env.RABBITMQ_URI || 'amqp://localhost');
      this.channel = await connection.createChannel();
      
      // Khai báo cả 2 queue mà service này tương tác
      await this.channel.assertQueue("orders", { durable: false });
      await this.channel.assertQueue("products", { durable: false });

      console.log("RabbitMQ connected and queues asserted.");
    } catch (err) {
      console.error("Failed to connect to RabbitMQ:", err.message);
      // Ném lỗi ra ngoài để báo cho nơi gọi biết là đã thất bại
      throw err;
    }
  }

  async publishMessage(queue, message) {
    if (!this.channel) {
      console.error("No RabbitMQ channel available to publish.");
      return;
    }
    // Gửi message và log lại
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    console.log(`Message sent to queue: ${queue}`);
  }

  consumeMessage(queue, callback) {
    if (!this.channel) {
      console.error("No RabbitMQ channel available to consume.");
      return;
    }
    // Bắt đầu lắng nghe message
    this.channel.consume(queue, (message) => {
      if (message !== null) {
        callback(JSON.parse(message.content.toString()));
        this.channel.ack(message);
      }
    });
  }
}

// Xuất ra một thực thể duy nhất (singleton)
module.exports = new MessageBroker();

