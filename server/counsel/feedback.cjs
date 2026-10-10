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
  const questions = Array.isArray(parsed.questions) ? parsed.questions : [];
  const constraints = Array.isArray(parsed.constraints) ? parsed.constraints : [];
  const researchTasks = Array.isArray(parsed.researchTasks) ? parsed.researchTasks : [];

  if (!parsed.understanding || !parsed.nextStep || questions.length < 3 || questions.length > 5) {
    throw new Error('Groq returned an incomplete feedback structure.');
  }

  return {
    understanding: String(parsed.understanding),
    questions: questions.slice(0, 5).map(String),
    constraints: constraints.map(String),
    researchTasks: researchTasks.map(String),
    nextStep: String(parsed.nextStep),
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
            'questions must contain 3 to 5 useful questions.',
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
    const feedback = await requestCounselFeedback(idea);
    return res.status(200).json(feedback);
  } catch (error) {
    console.error('Counsel feedback error:', {
      message: error.message,
      status: error.statusCode || 500,
      model: process.env.GROQ_MODEL || DEFAULT_MODEL,
    });
    return res.status(error.statusCode || 502).json({
      error: 'AI feedback is temporarily unavailable. Your draft is still here—please try again.',
    });
  }
}

module.exports = {
  MAX_IDEA_LENGTH,
  counselFeedbackHandler,
  normalizeIdea,
  requestCounselFeedback,
  validateIdea,
};
