import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const askGemini = async (question) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: question }],
            role: "user",
          },
        ],
      }),
    }
  );

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini.";
};

app.post("/ask", async (req, res) => {
  const question = req.body.question;

  if (!question) {
    return res.status(400).json({ error: "Missing 'question' in request body" });
  }

  try {
    const reply = await askGemini(question);
    res.json({ reply });
  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    res.status(500).json({ error: "Failed to get response from Gemini." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
