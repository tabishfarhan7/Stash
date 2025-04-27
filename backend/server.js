const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

app.post('/generate-packing-list', async (req, res) => {
  try {
    const { destination, startDate, endDate, tripType, activities } = req.body;
    if (!destination || !startDate || !endDate || !tripType) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const prompt = `Create a detailed packing list for a trip with these details:
    - Destination: ${destination}
    - Trip Duration: ${startDate} to ${endDate}
    - Trip Type: ${tripType}
    - Planned Activities: ${activities || 'Not specified'}
    
    Provide the packing list in HTML format with the following sections:
    1. Essential Items (passport, tickets, money, etc.)
    2. Clothing (organized by weather and activities)
    3. Toiletries
    4. Electronics
    5. Miscellaneous Items
    6. Special Items (based on activities)
    
    Make the list comprehensive but tailored to the trip details. Include quantities where appropriate.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ packingList: text });
  } catch (error) {
    console.error('Error generating packing list:', error);
    res.status(500).json({ error: "Failed to generate packing list" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});