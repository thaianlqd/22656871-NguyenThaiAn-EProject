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


//=> thai an - update:
const amqp = require("amqplib");
require("dotenv").config();

class MessageBroker {
  constructor() {
    this.channel = null;
    this.connection = null;
  }

  async connect() {
    try {
      console.log("Product Service: Connecting to RabbitMQ...");
      
      // Đọc URI từ biến môi trường
      const amqpServer = process.env.RABBITMQ_URI || "amqp://guest:guest@localhost:5672";
      this.connection = await amqp.connect(amqpServer);
      this.channel = await this.connection.createChannel();

      // SỬA LỖI: Đảm bảo cả hai hàng đợi đều được khai báo là "bền" (durable: true)
      // để thống nhất với service 'order'.
      await this.channel.assertQueue("products", { durable: true });
      await this.channel.assertQueue("orders", { durable: true });

      console.log("Product Service: RabbitMQ connected and queues asserted.");
    } catch (err) {
      console.error("Product Service: Failed to connect to RabbitMQ:", err.message);
      // Ném lỗi ra ngoài để quá trình khởi động biết và dừng lại
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
      console.error(`Error publishing message to ${queue}:`, err);
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
          const content = JSON.parse(message.content.toString());
          callback(content);
          this.channel.ack(message);
        }
      });
    } catch (err) {
      console.error(`Error consuming message from ${queue}:`, err);
    }
  }

  async close() {
    if (this.connection) {
        await this.connection.close();
        console.log("RabbitMQ connection closed.");
    }
  }
}

// Export một instance duy nhất (singleton)
module.exports = new MessageBroker();


