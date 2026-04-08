const Groq = require("groq-sdk");

// Initialize Groq with your key
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.askTutor = async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ msg: "Please provide a question." });
        }

        // Call the brand new, incredibly fast Llama 3.3 model
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a friendly, helpful, and highly intelligent AI tutor for students in 8th to 12th grade. Explain concepts simply, step-by-step. If a student asks a math or science question, guide them to the answer rather than just giving the final result. Keep answers concise and readable."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.3-70b-versatile", // 👈 UPDATED TO THE LATEST SUPPORTED MODEL
        });

        // Send the generated text back to the React frontend
        res.json({ answer: chatCompletion.choices[0].message.content });

    } catch (err) {
        console.error("Groq AI Error Details:", err);
        res.status(500).json({ msg: "The AI tutor is currently taking a break. Please try again later!" });
    }
};