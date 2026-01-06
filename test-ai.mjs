import { GoogleGenerativeAI } from "@google/generative-ai";

// ⚠️ 測試完畢後請記得刪除這個檔案，或把 Key 拿掉，避免外流
const API_KEY = "process.env.GEMINI_API_KEY"; 

const genAI = new GoogleGenerativeAI(API_KEY);

// 我們直接測你原本想用的 flash 模型
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

async function testConnection() {
  console.log("📡 正在嘗試連線到 Google Gemini (1.5 Flash)...");
  try {
    const result = await model.generateContent("你好，如果你能看到這則訊息，請回答 '連線成功'。");
    const response = await result.response;
    const text = response.text();
    console.log("✅ 成功了！AI 回覆：", text);
  } catch (error) {
    console.error("❌ 失敗，錯誤詳細資訊如下：");
    console.error(error);
  }
}

testConnection();