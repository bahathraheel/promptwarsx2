/**
 * Google Gemini AI Service for ELITE ELECTION.
 * Provides election-focused AI assistant with zone-aware context,
 * conversation memory, smart follow-ups, and proactive guidance.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const SYSTEM_PROMPT = `You are ELITE ELECTION GUIDE, a non-partisan, fact-based election assistant.
You ONLY answer questions about:
- Voter registration processes and deadlines
- Election timelines and key dates
- Polling day procedures and requirements
- Election results and certification
- Voting rights and accessibility accommodations
- Absentee and mail-in voting
- State-specific voting rules
- Voter ID requirements

RULES:
1. NEVER express political opinions or endorse any candidates or parties.
2. Always cite specific dates and deadlines from the provided election data.
3. If unsure, say "I'd recommend checking with your local election office or visiting vote.gov for the most current information."
4. Respond in a warm, encouraging, and inclusive tone.
5. Keep answers concise (under 200 words).
6. Support multilingual responses when the user asks in another language.
7. Always encourage civic participation positively.
8. If asked about topics outside elections, politely redirect to election-related topics.
9. Include accessibility information when relevant (e.g., curbside voting, accessible machines).
10. Mention the Election Protection Hotline (1-866-OUR-VOTE) when discussing voting problems.
11. When answering about a specific election zone, provide the most relevant zone-specific details.
12. End each response with one brief suggested follow-up question the user might want to ask next.`;

let electionData = null;

function loadElectionData() {
  if (!electionData) {
    try {
      const dataPath = path.join(__dirname, '..', '..', 'data', 'election-data.json');
      electionData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } catch (error) {
      console.error('[Gemini] Failed to load election data:', error.message);
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
    throw new Error('GEMINI_API_KEY is not set');
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Build conversation history in Gemini format
 */
function buildConversationHistory(history) {
  if (!history || history.length === 0) return [];
  return history.slice(-6).map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));
}

/**
 * Get zone-specific context for richer answers
 */
function getZoneContext(zoneId, data) {
  if (!zoneId) return '';
  const zone = data.zones.find(z => z.id === zoneId);
  if (!zone) return '';

  let ctx = `\nCURRENT ZONE: ${zone.name}\n${zone.description}\nKey Facts: ${JSON.stringify(zone.key_facts)}\n`;
  if (zone.rules_by_state) {
    ctx += `State Rules: ${JSON.stringify(zone.rules_by_state)}\n`;
  }
  if (zone.faq) {
    ctx += `Common Questions: ${zone.faq.join(', ')}\n`;
  }
  return ctx;
}

/**
 * Generate smart follow-up suggestions based on zone and question
 */
function generateFollowUps(question, zoneId, data) {
  const q = question.toLowerCase();
  const zone = zoneId ? data.zones.find(z => z.id === zoneId) : null;

  const followUps = [];

  if (q.includes('register') || zoneId === 'registration') {
    followUps.push('What documents do I need to register?');
    followUps.push('Can I register online in my state?');
    followUps.push('What is the registration deadline?');
  } else if (q.includes('deadline') || q.includes('timeline') || zoneId === 'timeline') {
    followUps.push('When does early voting start?');
    followUps.push('How do I request an absentee ballot?');
    followUps.push('What happens after Election Day?');
  } else if (q.includes('poll') || q.includes('voting') || zoneId === 'polling') {
    followUps.push('What ID do I need to vote?');
    followUps.push('What are my rights at the polling place?');
    followUps.push('Can I get time off work to vote?');
  } else if (q.includes('result') || q.includes('count') || zoneId === 'results') {
    followUps.push('How does the Electoral College work?');
    followUps.push('When are results officially certified?');
    followUps.push('How are recounts handled?');
  } else {
    followUps.push('How do I register to vote?');
    followUps.push('When is Election Day?');
    followUps.push('What should I bring to the polls?');
  }

  // Add zone FAQ items not already in followUps
  if (zone && zone.faq) {
    zone.faq.forEach(faq => {
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
  if (q.includes('register') || q.includes('sign up') || q.includes('eligible')) return 'registration';
  if (q.includes('deadline') || q.includes('when') || q.includes('date') || q.includes('timeline')) return 'timeline';
  if (q.includes('poll') || q.includes('vote') || q.includes('bring') || q.includes('id')) return 'polling';
  if (q.includes('result') || q.includes('count') || q.includes('electoral') || q.includes('certif')) return 'results';
  if (q.includes('absentee') || q.includes('mail') || q.includes('ballot')) return 'absentee';
  if (q.includes('access') || q.includes('disab') || q.includes('wheelchair') || q.includes('blind')) return 'accessibility';
  if (q.includes('help') || q.includes('problem') || q.includes('report') || q.includes('hotline')) return 'support';
  return 'general';
}

/**
 * Ask the AI assistant a question with zone context and conversation memory
 */
async function askAssistant(question, zoneId = null, language = 'en', conversationHistory = []) {
  const data = loadElectionData();
  let contextBlock = `\nELECTION DATA:\nTimeline: ${JSON.stringify(data.timeline)}\nResources: ${JSON.stringify(data.resources)}\n`;

  contextBlock += getZoneContext(zoneId, data);

  if (language !== 'en') {
    contextBlock += `\nPlease respond in the language with code: ${language}\n`;
  }

  const intent = classifyIntent(question);
  const followUps = generateFollowUps(question, zoneId, data);

  try {
    const genAI = createClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const previousMessages = buildConversationHistory(conversationHistory);
    const allContents = [
      ...previousMessages,
      { role: 'user', parts: [{ text: question }] }
    ];

    const result = await model.generateContent({
      contents: allContents,
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT + contextBlock }] },
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 500
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
      ]
    });

    const response = result.response;
    return {
      answer: response.text(),
      zone: zoneId,
      model: 'gemini-2.0-flash',
      intent,
      followUps,
      confidence: 'high'
    };
  } catch (error) {
    console.error('[Gemini] API error:', error.message);

    // Fallback to pre-written FAQ responses
    return getFallbackResponse(question, zoneId, data);
  }
}

/**
 * Fallback responses when Gemini is unavailable — comprehensive coverage
 */
function getFallbackResponse(question, zoneId, data) {
  const q = question.toLowerCase();
  const zone = zoneId ? data.zones.find(z => z.id === zoneId) : null;
  const intent = classifyIntent(question);
  const followUps = generateFollowUps(question, zoneId, data);

  if (q.includes('register') || q.includes('registration')) {
    return {
      answer: `To register to vote, visit vote.gov. Most states require registration ${data.timeline.registration_deadline ? 'by ' + data.timeline.registration_deadline : '25-30 days before Election Day'}. You'll need a valid ID and proof of address. Some states offer online registration!`,
      zone: zoneId,
      model: 'fallback',
      intent,
      followUps,
      confidence: 'medium'
    };
  }

  if (q.includes('deadline') || q.includes('when') || q.includes('date')) {
    return {
      answer: `Key dates: Registration deadline: ${data.timeline.registration_deadline}, Early voting starts: ${data.timeline.early_voting_start}, Election Day: ${data.timeline.election_day}. Check your state's specific deadlines at vote.gov.`,
      zone: zoneId,
      model: 'fallback',
      intent,
      followUps,
      confidence: 'medium'
    };
  }

  if (q.includes('absentee') || q.includes('mail') || q.includes('ballot')) {
    return {
      answer: `Absentee ballot request deadline: ${data.timeline.absentee_request_deadline || 'varies by state'}. Many states now offer no-excuse absentee voting. Apply through your state election office or visit vote.gov. Return your ballot before the deadline — don't wait!`,
      zone: zoneId,
      model: 'fallback',
      intent,
      followUps,
      confidence: 'medium'
    };
  }

  if (q.includes('id') || q.includes('identification') || q.includes('bring')) {
    return {
      answer: `ID requirements vary by state. Common accepted forms: driver's license, state ID, passport, or military ID. Some states accept utility bills or bank statements. If you don't have ID, ask about provisional ballots. Check your state's requirements at vote.gov.`,
      zone: zoneId,
      model: 'fallback',
      intent,
      followUps,
      confidence: 'medium'
    };
  }

  if (q.includes('access') || q.includes('disab') || q.includes('wheelchair')) {
    return {
      answer: `All polling places must be accessible under federal law. You can request curbside voting, use accessible voting machines, or bring someone to assist you. If you encounter accessibility issues, call the Disability Rights hotline: 1-888-225-5322.`,
      zone: zoneId,
      model: 'fallback',
      intent,
      followUps,
      confidence: 'medium'
    };
  }

  if (q.includes('electoral') || q.includes('college') || q.includes('how') && q.includes('work')) {
    return {
      answer: `The Electoral College consists of 538 electors. Each state gets electors equal to its Congressional representation. A candidate needs 270 electoral votes to win. Most states use winner-take-all. The Electoral College meets in December: ${data.timeline.electoral_college_vote}.`,
      zone: zoneId,
      model: 'fallback',
      intent,
      followUps,
      confidence: 'medium'
    };
  }

  if (q.includes('result') || q.includes('count') || q.includes('certif')) {
    return {
      answer: `Votes are counted by local election officials, often with bipartisan observers. Results certification: ${data.timeline.results_certification}. Electoral College vote: ${data.timeline.electoral_college_vote}. Inauguration Day: ${data.timeline.inauguration_day}.`,
      zone: zoneId,
      model: 'fallback',
      intent,
      followUps,
      confidence: 'medium'
    };
  }

  if (q.includes('poll') || q.includes('vote') || q.includes('where')) {
    return {
      answer: `On Election Day, bring a valid photo ID (requirements vary by state). Polls typically open 6 AM - 8 PM. If you're in line when polls close, you have the RIGHT to vote. Find your polling place at vote.gov. Need help? Call 1-866-OUR-VOTE.`,
      zone: zoneId,
      model: 'fallback',
      intent,
      followUps,
      confidence: 'medium'
    };
  }

  if (q.includes('help') || q.includes('problem') || q.includes('report')) {
    return {
      answer: `If you encounter any problems voting, you have options: Call the Election Protection Hotline at 1-866-OUR-VOTE (English), 1-888-839-8682 (multilingual), or 1-888-225-5322 (disability rights). You can also report issues to your local election office.`,
      zone: zoneId,
      model: 'fallback',
      intent,
      followUps,
      confidence: 'medium'
    };
  }

  if (zone) {
    return {
      answer: `${zone.assistant_intro || zone.description} ${zone.key_facts.join(' ')} For more details, visit vote.gov or call 1-866-OUR-VOTE.`,
      zone: zoneId,
      model: 'fallback',
      intent,
      followUps,
      confidence: 'low'
    };
  }

  return {
    answer: `I'm your Election Guide! I can help with voter registration, election timelines, polling day procedures, absentee voting, accessibility accommodations, and results. What would you like to know? Visit vote.gov for official information or call 1-866-OUR-VOTE for live help.`,
    zone: zoneId,
    model: 'fallback',
    intent,
    followUps,
    confidence: 'low'
  };
}

/**
 * Get proactive tips based on current zone
 */
function getProactiveTip(zoneId) {
  const tips = {
    welcome: '💡 Did you know? You can ask me about any step in the election process — from registration to results!',
    registration: '💡 Tip: Check your registration status at vote.gov even if you think you\'re already registered. Registrations can be purged.',
    timeline: '💡 Tip: Early voting gives you more flexibility. Check if your state offers it!',
    polling: '💡 Tip: Take a sample ballot with you to save time at the polls. Many states let you look up your ballot online.',
    results: '💡 Tip: Election results may take days to finalize. This is normal — every valid vote gets counted!'
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
  loadElectionData
};
