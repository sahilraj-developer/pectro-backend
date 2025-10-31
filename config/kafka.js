// config/kafka.js
import { Kafka } from "kafkajs";
import dotenv from "dotenv";

dotenv.config();

const kafka = new Kafka({
  clientId: "medical-app", // 👈 Change to your app name
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: "medical-app-group" });

// -----------------------------
// Connect Producer & Consumer
// -----------------------------
export const connectKafka = async () => {
  try {
    await producer.connect();
    await consumer.connect();
    console.log("✅ Kafka connected successfully");
  } catch (error) {
    console.error("❌ Kafka connection failed:", error);
  }
};
