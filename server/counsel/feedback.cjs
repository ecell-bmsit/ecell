'use strict';

const MAX_IDEA_LENGTH = 5000;
const DEFAULT_MODEL = 'openai/gpt-oss-20b';
const DISCLAIMER = 'AI feedback is for early exploration only. Verify assumptions with real users and mentors; it is not professional, legal, financial, or investment advice.';

function normalizeIdea(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function validateIdea(idea) {
  if (!idea) return 'Please enter your idea first.';
  if (idea.length > MAX_IDEA_LENGTH) return `Idea must be ${MAX_IDEA_LENGTH} characters or fewer.`;
  return null;
}

function parseModelResponse(content) {
  const parsed = JSON.parse(content);
  const questions = Array.isArray(parsed.questions)
    ? parsed.questions.map(String).map((question) => question.trim()).filter(Boolean).slice(0, 5)
    : [];
  const constraints = Array.isArray(parsed.constraints) ? parsed.constraints : [];
  const researchTasks = Array.isArray(parsed.researchTasks) ? parsed.researchTasks : [];

  if (questions.length < 3) {
    throw new Error('Groq returned fewer than three usable interview questions.');
  }

  const fallbackQuestions = [
    'How will you reach and serve more customers as demand grows?',
    'What is the biggest assumption you still need to test with potential customers?',
  ];
  for (const question of fallbackQuestions) {
    if (questions.length === 5) break;
    questions.push(question);
  }
  return {
    understanding: String(parsed.understanding || 'Let’s explore the strongest assumptions behind your idea.'),
    questions: questions.slice(0, 5).map(String),
    constraints: constraints.map(String),
    researchTasks: researchTasks.map(String),
    nextStep: String(parsed.nextStep || 'Use these questions to validate the idea with potential customers.'),
    disclaimer: DISCLAIMER,
  };
}

async function requestCounselFeedback(idea) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    const error = new Error('AI feedback is not configured on the server.');
    error.statusCode = 503;
    throw error;
  }

  if (typeof fetch !== 'function') {
    const error = new Error('The server runtime does not provide fetch.');
    error.statusCode = 500;
    throw error;
  }

  const model = process.env.GROQ_MODEL || DEFAULT_MODEL;
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: [
            'You are AI Counsel for E-Cell BMSIT.',
            'Help a student pressure-test an early startup idea without accepting, rejecting, or numerically scoring it.',
            'Be encouraging, specific, concise, and honest about uncertainty.',
            'Return only valid JSON with exactly these keys: understanding, questions, constraints, researchTasks, nextStep.',
            'questions must contain exactly 5 useful questions covering customer need, differentiation, revenue, scaling, and execution risks.',
            'constraints and researchTasks should be arrays of short actionable items.',
          ].join(' '),
        },
        { role: 'user', content: idea },
      ],
    }),
  });

  if (!response.ok) {
    const error = new Error(`Groq request failed with status ${response.status}.`);
    error.statusCode = response.status === 429 ? 429 : 502;
    throw error;
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') throw new Error('Groq returned no feedback.');

  return parseModelResponse(content);
}

async function counselFeedbackHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const idea = normalizeIdea(req.body?.idea);
  const validationError = validateIdea(idea);
  if (validationError) return res.status(400).json({ error: validationError });

  try {
    if (req.body?.mode === 'evaluate') {
      const answers = Array.isArray(req.body?.answers) ? req.body.answers : [];
      if (answers.length !== 5 || answers.some((answer) => typeof answer !== 'string' || !answer.trim() || answer.length > 3000)) {
        return res.status(400).json({ error: 'Please answer all five questions (up to 3,000 characters each).' });
      }
      const evaluation = await requestIdeaEvaluation(idea, answers);
      return res.status(200).json(evaluation);
    }
    const feedback = await requestCounselFeedback(idea);
    return res.status(200).json(feedback);
  } catch (error) {
    console.error('Counsel feedback error:', {
      message: error.message,
      status: error.statusCode || 500,
      model: process.env.GROQ_MODEL || DEFAULT_MODEL,
    });
    return res.status(error.statusCode || 502).json({
      error: 'AI feedback is temporarily unavailable. Your draft is still hereâ€”please try again.',
    });
  }
}

async function requestIdeaEvaluation(idea, answers) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) { const error = new Error('AI evaluation is not configured on the server.'); error.statusCode = 503; throw error; }
  const model = process.env.GROQ_MODEL || DEFAULT_MODEL;
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, temperature: 0.2, response_format: { type: 'json_object' }, messages: [
      { role: 'system', content: 'You are an early-stage venture evaluator for E-Cell BMSIT. Evaluate the proposal and its five answers fairly. Return JSON with exactly: score (integer 0-100), gaps (array of 3-5 concise specific weaknesses or unanswered risks), summary (one concise paragraph). Score evidence and readiness, not writing style. Do not make an investment decision or promise acceptance.' },
      { role: 'user', content: JSON.stringify({ idea, answers: answers.map((answer) => answer.trim()) }) },
    ] }),
  });
  if (!response.ok) { const error = new Error(`Groq request failed with status ${response.status}.`); error.statusCode = response.status === 429 ? 429 : 502; throw error; }
  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') throw new Error('Groq returned no evaluation.');
  const parsed = JSON.parse(content);
  const score = Number(parsed.score);
  const gaps = Array.isArray(parsed.gaps) ? parsed.gaps.map(String).slice(0, 5) : [];
  if (!Number.isInteger(score) || score < 0 || score > 100 || gaps.length < 3 || !parsed.summary) throw new Error('Groq returned an incomplete evaluation.');
  return { score, gaps, summary: String(parsed.summary) };
}
module.exports = {
  MAX_IDEA_LENGTH,
  counselFeedbackHandler,
  normalizeIdea,
  requestCounselFeedback,
  requestIdeaEvaluation,
  validateIdea,
};


