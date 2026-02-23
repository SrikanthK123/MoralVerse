const axios = require('axios');

const moderateContent = async (req, res, next) => {
  const { textContent } = req.body;

  if (!textContent || textContent.trim().length === 0) {
    return res.status(400).json({ message: "Post content cannot be empty." });
  }

  console.log('--- AI Moderation Start ---');
  console.log('Analyzing text:', textContent);

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'system',
            content: `You are a strict AI moderator for "MoralVerse". 
Your goal is to ensure only POSITIVE, CONSTRUCTIVE, and MEANINGFUL moral slogans are allowed.

CRITICAL REJECTION RULES:
1. REJECT cynical, pessimistic, or discouraging messages (e.g., "Dreams are useless", "Life is a waste", "Don't try").
2. REJECT content that promotes a negative mindset or discourages ambition.
3. REJECT content that is meaningless, gibberish, or single random words.
4. REJECT any content promoting hate, toxicity, or dishonesty.

ACCEPTANCE RULES:
- ONLY accept if the tone is POSITIVE and CONSTRUCTIVE.
- Messages must provide a clear moral or motivational lesson.

Response format (JSON ONLY):
{
  "isMoralPositive": true,
  "reason": "Identify the moral value or specific negative/cynical tone"
}`
          },
          {
            role: 'user',
            content: textContent
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://moralverse.com',
          'X-Title': 'MoralVerse'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    console.log('AI Raw Response:', content);

    let moderationResult;
    try {
      const jsonStart = content.indexOf('{');
      const jsonEnd = content.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonString = content.substring(jsonStart, jsonEnd + 1);
        moderationResult = JSON.parse(jsonString);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (e) {
      console.warn("Moderation JSON parse failed.");
      return res.status(500).json({ message: "Moderation processing failed." });
    }

    if (moderationResult.isMoralPositive === false) {
      console.log("Post REJECTED:", moderationResult.reason);
      return res.status(400).json({
        message: "Your post does not meet the moral guidelines of MoralVerse.",
        reason: moderationResult.reason
      });
    }

    console.log("Post ACCEPTED. Reason:", moderationResult.reason);
    req.moderationResult = moderationResult;
    next();

  } catch (error) {
    console.error("Moderation API Error:", error.response?.status, error.message);
    return res.status(error.response?.status || 500).json({
      message: "AI Moderation Service Error",
      reason: "The service is temporarily unavailable or misconfigured. Please try again later."
    });
  }
};

module.exports = { moderateContent };
