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
    console.log("Connecting to RabbitMQ...");
    try {
      // SỬA LỖI: Đọc URI từ biến môi trường thay vì hard-code.
      // Trong CI, nó sẽ là "amqp://guest:guest@localhost:5672".
      // Trong Docker Compose, nó sẽ là "amqp://guest:guest@thaian_rabbitmq:5672".
      const amqpServer = process.env.RABBITMQ_URI;
      
      const connection = await amqp.connect(amqpServer);
      this.channel = await connection.createChannel();
      
      // Đảm bảo cả hai queue đều tồn tại
      await this.channel.assertQueue("products");
      await this.channel.assertQueue("orders");

      console.log("RabbitMQ connected and queues asserted.");
    } catch (err) {
      console.error("Failed to connect to RabbitMQ:", err.message);
      // Ném lỗi ra ngoài để `before` hook trong test biết là đã thất bại
      throw err;
    }
  }

  async publishMessage(queue, message) {
    if (!this.channel) {
      console.error("No RabbitMQ channel available to publish.");
      return;
    }

    try {
      this.channel.sendToQueue(
        queue,
        Buffer.from(JSON.stringify(message))
      );
      console.log(`Message sent to queue: ${queue}`);
    } catch (err) {
      console.error("Failed to publish message:", err);
    }
  }

  consumeMessage(queue, callback) {
    if (!this.channel) {
      console.error("No RabbitMQ channel available to consume.");
      return;
    }

    try {
      this.channel.consume(queue, (message) => {
        if (message !== null) {
            const content = message.content.toString();
            const parsedContent = JSON.parse(content);
            callback(parsedContent);
            this.channel.ack(message);
        }
      });
    } catch (err) {
      console.error("Failed to consume message:", err);
    }
  }
}

// Xuất ra một instance duy nhất (singleton)
module.exports = new MessageBroker();
