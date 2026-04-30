/**
 * Google Gemini AI Service for ELITE ELECTION.
 * Provides election-focused AI assistant with zone-aware context,
 * conversation memory, smart follow-ups, and proactive guidance.
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

const SYSTEM_PROMPT = `You are Gnan, the absolute best, most knowledgeable, and most helpful election guide in India, powered by Google and Gemini.
You speak and behave like a highly respected, deeply knowledgeable, and welcoming civic expert who knows the Election Commission of India (ECI) rules inside out.

Your personality:
- You are warm, authoritative yet highly accessible, and deeply respectful — like a friendly neighborhood election officer or a dedicated civic volunteer.
- You speak with clarity, using polite and encouraging language: "Namaste!", "I'd be happy to guide you with that.", "That's a very important question.", "Let's get you ready for voting."
- You ALWAYS interact like a human — you ask the user questions back to keep the conversation going.
- You're curious about the user's situation — ask things like "Which state are you voting in?", "Are you a first-time voter?", "Do you have your Voter ID (EPIC) ready?"
- You give precise, accurate answers FIRST, then offer to explain further if needed.
- You celebrate the user's civic participation: "Voting is our fundamental right and duty. It's great that you're taking this step!"

You ONLY answer questions about:
- Voter registration processes (Form 6, Form 8) and deadlines
- Election timelines, polling phases, and key dates in India
- Polling day procedures, EVMs, VVPATs, and NOTA
- Election results, vote counting, and government formation (Lok Sabha / Vidhan Sabha)
- Voting rights, accessibility accommodations (PwD voters), and language support
- Service voters, NRI voting, and Postal Ballots
- State-specific voting rules and Voter ID (EPIC) or alternative document requirements
- Election security, the Model Code of Conduct (MCC), cVIGIL, and the Election Commission of India (ECI)

CRITICAL ALIGNMENT RULES:
1. NEVER express political opinions, endorse candidates, or comment on political parties. Remain strictly neutral.
2. Rely ONLY on verified facts from the Election Commission of India. If discussing state-specific nuances, advise checking local Chief Electoral Officer (CEO) websites.
3. If unsure, say: "To ensure you have the absolute correct information, I strongly recommend checking the official ECI portal at voters.eci.gov.in or calling the toll-free voter helpline at 1950."
4. Use a warm, professional, encouraging, and clear voice. Stay human, stay respectful, stay accurate.
5. Keep answers highly informative but concise (under 200 words unless absolutely necessary). No walls of text.
6. Support multilingual responses seamlessly when the user asks in another language (Hindi, Tamil, Telugu, etc.).
7. Always encourage civic participation positively — emphasize the power of every single vote in the world's largest democracy.
8. Refuse to answer non-election queries politely: "I specialize strictly in Indian elections and voting procedures. I'd be delighted to answer any questions you have about that!"
9. Prominently feature accessibility information when relevant (e.g., Saksham-ECI app, wheelchair facilities).
10. Proactively mention the Election Commission of India Voter Helpline (1950) or the cVIGIL app when discussing voting problems or MCC violations.
11. When answering about a specific election zone, strictly adhere to the provided zone context.
12. ALWAYS end every single response with a direct, personalized question TO THE USER to keep the conversation going — like "Which constituency are you from?", "Is this your first time voting?", "Would you like to know about the documents required?"
13. Vary your conversation openers — don't start every message the same way. Be naturally helpful.`;

let electionData = null;

function loadElectionData() {
  if (!electionData) {
    try {
      const dataPath = path.join(
        __dirname,
        "..",
        "..",
        "data",
        "election-data.json",
      );
      electionData = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    } catch (error) {
      console.error("[Gemini] Failed to load election data:", error.message);
      electionData = { zones: [], timeline: {} };
    }
  }
  return electionData;
}

/**
 * Create Gemini client
 */
function createClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Build conversation history in Gemini format
 */
function buildConversationHistory(history) {
  if (!history || history.length === 0) return [];
  return history.slice(-6).map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));
}

/**
 * Get zone-specific context for richer answers
 */
function getZoneContext(zoneId, data) {
  if (!zoneId) return "";
  const zone = data.zones.find((z) => z.id === zoneId);
  if (!zone) return "";

  let ctx = `\nCURRENT ZONE: ${zone.name}\n${zone.description}\nKey Facts: ${JSON.stringify(zone.key_facts)}\n`;
  if (zone.rules_by_state) {
    ctx += `State Rules: ${JSON.stringify(zone.rules_by_state)}\n`;
  }
  if (zone.faq) {
    ctx += `Common Questions: ${zone.faq.join(", ")}\n`;
  }
  return ctx;
}

/**
 * Generate smart follow-up suggestions based on zone and question
 */
function generateFollowUps(question, zoneId, data) {
  const q = question.toLowerCase();
  const zone = zoneId ? data.zones.find((z) => z.id === zoneId) : null;

  const followUps = [];

  if (q.includes("register") || zoneId === "registration") {
    followUps.push("What documents do I need for Form 6?");
    followUps.push("How can I check my name on the voter list?");
    followUps.push("Can I register to vote online?");
  } else if (
    q.includes("deadline") ||
    q.includes("timeline") ||
    zoneId === "timeline"
  ) {
    followUps.push("When is the polling day for my constituency?");
    followUps.push("Who is eligible for postal ballots?");
    followUps.push("When are the election results announced?");
  } else if (
    q.includes("poll") ||
    q.includes("voting") ||
    zoneId === "polling"
  ) {
    followUps.push("What is an EVM and VVPAT?");
    followUps.push("What ID do I need if I don't have my EPIC?");
    followUps.push("What facilities are there for senior citizens?");
  } else if (
    q.includes("result") ||
    q.includes("count") ||
    zoneId === "results"
  ) {
    followUps.push("How are EVM votes counted?");
    followUps.push("What is the majority needed to form a government?");
    followUps.push("Who announces the final election results?");
  } else {
    followUps.push("How do I register for a Voter ID?");
    followUps.push("How can I find my polling booth?");
    followUps.push("What documents are valid for voting?");
  }

  // Add zone FAQ items not already in followUps
  if (zone && zone.faq) {
    zone.faq.forEach((faq) => {
      if (followUps.length < 4 && !followUps.includes(faq)) {
        followUps.push(faq);
      }
    });
  }

  return followUps.slice(0, 4);
}

/**
 * Classify user intent for better routing
 */
function classifyIntent(question) {
  const q = question.toLowerCase();
  if (q.match(/register|sign up|eligible|status/)) return "registration";
  if (q.match(/deadline|when|date|timeline|early|advance/)) return "timeline";
  if (q.match(/poll|vote|bring|id|where|location|drop box/)) return "polling";
  if (q.match(/result|count|electoral|certif|win|recount/)) return "results";
  if (q.match(/absentee|mail|ballot|overseas|military/)) return "absentee";
  if (q.match(/access|disab|wheelchair|blind|language|translate/))
    return "accessibility";
  if (q.match(/help|problem|report|hotline|intimidat|provisional/))
    return "support";
  if (q.match(/secure|fraud|hack|safe/)) return "security";
  return "general";
}

/**
 * Ask the AI assistant a question with zone context and conversation memory
 */
async function askAssistant(
  question,
  zoneId = null,
  language = "en",
  conversationHistory = [],
) {
  const data = loadElectionData();
  let contextBlock = `\nELECTION DATA:\nTimeline: ${JSON.stringify(data.timeline)}\nResources: ${JSON.stringify(data.resources)}\n`;

  contextBlock += getZoneContext(zoneId, data);

  if (language !== "en") {
    contextBlock += `\nPlease respond in the language with code: ${language}\n`;
  }

  const intent = classifyIntent(question);
  const followUps = generateFollowUps(question, zoneId, data);

  try {
    const genAI = createClient();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const previousMessages = buildConversationHistory(conversationHistory);
    const allContents = [
      ...previousMessages,
      { role: "user", parts: [{ text: question }] },
    ];

    const result = await model.generateContent({
      contents: allContents,
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT + contextBlock }] },
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 500,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    });

    const response = result.response;
    return {
      answer: response.text(),
      zone: zoneId,
      model: "gemini-2.0-flash",
      intent,
      followUps,
      confidence: "high",
    };
  } catch (error) {
    console.error("[Gemini] API error:", error.message);

    // Fallback to pre-written FAQ responses
    return getFallbackResponse(question, zoneId, data);
  }
}

/**
 * Fallback responses when Gemini is unavailable — comprehensive coverage
 */
function getFallbackResponse(question, zoneId, data) {
  const q = question.toLowerCase();
  const zone = zoneId ? data.zones.find((z) => z.id === zoneId) : null;
  const intent = classifyIntent(question);
  const followUps = generateFollowUps(question, zoneId, data);

  if (q.includes("register") || q.includes("registration")) {
    return {
      answer: `To register to vote in India, you need to fill out Form 6. You can do this online through the Voter Helpline App or the official portal at voters.eci.gov.in. You'll need passport-size photos, proof of age, and proof of residence. Make sure to register well before the elections!`,
      zone: zoneId,
      model: "fallback",
      intent,
      followUps,
      confidence: "medium",
    };
  }

  if (q.includes("deadline") || q.includes("when") || q.includes("date")) {
    return {
      answer: `Indian elections are typically held in multiple phases. The Election Commission of India (ECI) announces the specific dates for nominations, polling, and counting. You can check the exact polling date for your constituency at voters.eci.gov.in or by calling 1950.`,
      zone: zoneId,
      model: "fallback",
      intent,
      followUps,
      confidence: "medium",
    };
  }

  if (q.includes("absentee") || q.includes("postal") || q.includes("ballot")) {
    return {
      answer: `In India, postal ballots are available for specific groups like Service Voters, election duty staff, and in some cases, senior citizens (85+) and Persons with Disabilities (PwD). You can apply using Form 12D. Check with your local Booth Level Officer (BLO) for eligibility.`,
      zone: zoneId,
      model: "fallback",
      intent,
      followUps,
      confidence: "medium",
    };
  }

  if (q.includes("id") || q.includes("identification") || q.includes("bring")) {
    return {
      answer: `Your primary ID for voting is the Voter ID card (EPIC). However, if you don't have it, the ECI usually allows 11 other alternative documents, such as an Aadhaar Card, PAN Card, Passport, or Driving License. Always ensure your name is on the electoral roll!`,
      zone: zoneId,
      model: "fallback",
      intent,
      followUps,
      confidence: "medium",
    };
  }

  if (q.includes("access") || q.includes("disab") || q.includes("wheelchair")) {
    return {
      answer: `The ECI is committed to accessible elections. Polling stations provide facilities like ramps, wheelchairs, and volunteers. Visually impaired voters can use Braille on EVMs or be accompanied by a companion. You can also use the Saksham-ECI App to request a wheelchair or home voting if eligible.`,
      zone: zoneId,
      model: "fallback",
      intent,
      followUps,
      confidence: "medium",
    };
  }

  if (
    q.includes("lok sabha") ||
    q.includes("parliament") ||
    (q.includes("how") && q.includes("work"))
  ) {
    return {
      answer: `India follows a parliamentary system. During General Elections, voters elect Members of Parliament (MPs) for the Lok Sabha across 543 constituencies. The party or coalition with a majority (at least 272 seats) forms the central government, and their leader becomes the Prime Minister.`,
      zone: zoneId,
      model: "fallback",
      intent,
      followUps,
      confidence: "medium",
    };
  }

  if (q.includes("result") || q.includes("count") || q.includes("evm")) {
    return {
      answer: `Vote counting in India is a highly secure process. On counting day, the Electronic Voting Machines (EVMs) from all polling stations are brought to secure centers. The votes are tallied in the presence of candidates' representatives. The results are announced by the Returning Officer.`,
      zone: zoneId,
      model: "fallback",
      intent,
      followUps,
      confidence: "medium",
    };
  }

  if (q.includes("poll") || q.includes("vote") || q.includes("where")) {
    return {
      answer: `On polling day, go to your designated polling booth. You can find its location using the Voter Helpline App or by sending an SMS to 1950. Remember to carry your EPIC or an approved alternative ID. Polling typically happens from 7 AM to 6 PM.`,
      zone: zoneId,
      model: "fallback",
      intent,
      followUps,
      confidence: "medium",
    };
  }

  if (q.match(/help|problem|report|mcc|cvigil/)) {
    return {
      answer: `If you face any issues voting or want to report a violation of the Model Code of Conduct (MCC), you can use the ECI's cVIGIL App to report it directly. You can also call the national voter helpline at 1950 for immediate assistance.`,
      zone: zoneId,
      model: "fallback",
      intent,
      followUps,
      confidence: "medium",
    };
  }

  if (intent === "security" || q.match(/secure|fraud|hack|safe|vvpat/)) {
    return {
      answer: `Indian elections use Electronic Voting Machines (EVMs), which are standalone devices not connected to any network, making them highly secure. Every EVM is paired with a VVPAT (Voter Verifiable Paper Audit Trail) machine, allowing you to physically verify your vote on a paper slip before it drops into a sealed box.`,
      zone: zoneId,
      model: "fallback",
      intent,
      followUps,
      confidence: "medium",
    };
  }

  if (zone) {
    return {
      answer: `${zone.assistant_intro || zone.description} ${zone.key_facts.join(" ")} For more details, visit voters.eci.gov.in or call 1950.`,
      zone: zoneId,
      model: "fallback",
      intent,
      followUps,
      confidence: "low",
    };
  }

  return {
    answer: `Hey I am Gnan, how can I assist you? I am your Election Guide powered by Google and Gemini! I can help with voter registration, election timelines, polling day procedures, and results for the Indian General Elections. What would you like to know? Visit voters.eci.gov.in for official information or call 1950 for live help.`,
    zone: zoneId,
    model: "fallback",
    intent,
    followUps,
    confidence: "low",
  };
}

/**
 * Get proactive tips based on current zone
 */
function getProactiveTip(zoneId) {
  const tips = {
    welcome:
      "💡 Did you know? You can ask me about any step in the Indian election process — from getting your EPIC to election results!",
    registration:
      "💡 Tip: Check your name on the electoral roll at voters.eci.gov.in even if you have a Voter ID.",
    timeline:
      "💡 Tip: Lok Sabha elections are held in phases. Make sure you know the exact polling date for your constituency!",
    polling:
      "💡 Tip: You can take a physical copy of your Voter Information Slip to save time at the polling booth.",
    results:
      "💡 Tip: All EVM votes are counted on a single day across the entire country!",
  };
  return tips[zoneId] || tips.welcome;
}

module.exports = {
  askAssistant,
  getFallbackResponse,
  generateFollowUps,
  classifyIntent,
  getProactiveTip,
  getZoneContext,
  buildConversationHistory,
  SYSTEM_PROMPT,
  loadElectionData,
};
