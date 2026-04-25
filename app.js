
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const products = require("./Product");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// Gemini setup
const genAI = new GoogleGenerativeAI("AIzaSyA0SddK36mGvAljFmgo27tibumrFksMIco");

// ✅ Get all products (for frontend)
app.get("/products", (req, res) => {
  res.json(products);
});

// ✅ Recommendation endpoint
app.post("/recommend", async (req, res) => {
  const { query } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model:"gemini-3-flash-preview"});

    const prompt = `
User wants: "${query}"

Available products:
${JSON.stringify(products)}

STRICT RULE:
Return ONLY valid JSON array.
Do not include explanation or text.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Try parsing JSON safely
    let parsed = [];
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.log("Invalid JSON from Gemini:", text);
      return res.json({ result: [] });
    }

    res.json({ result: parsed });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));


