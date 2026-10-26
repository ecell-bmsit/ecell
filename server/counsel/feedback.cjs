'use strict';

const fs = require('fs');
const path = require('path');

const MAX_IDEA_LENGTH = 5000;
const DEFAULT_MODEL = 'openai/gpt-oss-20b';
const DISCLAIMER = 'AI feedback is for early exploration only. Verify assumptions with real users and mentors; it is not professional, legal, financial, or investment advice.';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

function getApiKey() {
  return process.env.GROQ_API_KEY;
}

function getModel() {
  return process.env.GROQ_MODEL || DEFAULT_MODEL;
}

async function requestGroq(system, user, maxTokens = 1800) {
  const apiKey = getApiKey();
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

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: getModel(),
      max_tokens: maxTokens,
      temperature: 0.4,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });

  if (!response.ok) {
    let providerMessage = '';
    try {
      const providerBody = await response.json();
      providerMessage = String(providerBody?.error?.message || '').slice(0, 300);
    } catch {
      providerMessage = 'No readable provider error details.';
    }
    console.error('Groq request rejected:', {
      status: response.status,
      model: getModel(),
      message: providerMessage,
    });
    const error = new Error(`Groq request failed with status ${response.status}.`);
    error.statusCode = response.status === 429 ? 429 : 502;
    throw error;
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content || data.choices[0].finish_reason === 'length') {
    throw new Error('Groq returned incomplete feedback.');
  }
  return content;
}


function normalizeIdea(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function validateIdea(idea) {
  if (!idea) return 'Please enter your idea first.';
  if (idea.length > MAX_IDEA_LENGTH) return `Idea must be ${MAX_IDEA_LENGTH} characters or fewer.`;
  return null;
}

function parseModelResponse(content) {
  const parsed = parseJson(content);
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
    understanding: String(parsed.understanding || 'Explore the strongest assumptions behind your idea.'),
    questions: questions.slice(0, 5).map(String),
    constraints: constraints.map(String),
    researchTasks: researchTasks.map(String),
    nextStep: String(parsed.nextStep || 'Use these questions to validate the idea with potential customers.'),
    disclaimer: DISCLAIMER,
  };
}

const COUNCIL_LENSES = [
  ['The Contrarian', 'Find unsupported claims, what is missing, and the most likely failure.'],
  ['The First Principles Thinker', 'Identify the real customer problem and rebuild the idea from the underlying need.'],
  ['The Expansionist', 'Find credible strengths, upside, and adjacent opportunities.'],
  ['The Outsider', 'Read only the submitted evidence and flag confusing language or hidden assumptions.'],
  ['The Executor', 'Find the fastest feasible validation step and the practical barriers to doing it.'],
];

function councilSkill() {
  // The repository skill remains the source of truth for every Counsel request.
  return fs.readFileSync(path.join(__dirname, '..', '..', 'SKILL.md'), 'utf8');
}

function councilRules() {
  const skill = councilSkill();
  const required = ['The Contrarian', 'The First Principles Thinker', 'The Expansionist', 'The Outsider', 'The Executor', 'peer review', 'chairman synthesis'];
  if (required.some((rule) => !skill.toLowerCase().includes(rule.toLowerCase()))) {
    throw new Error('The LLM Council skill is missing required guidance.');
  }
  const advisorGuidance = skill.split('## the five advisors')[1]?.split('## how a council session works')[0]?.trim();
  if (!advisorGuidance) throw new Error('The LLM Council skill has no advisor guidance.');
  return `Follow the LLM Council method from SKILL.md: five independent advisors, anonymous peer review, and chairman synthesis. Ground judgments in submitted evidence and separate facts from assumptions. Advisor guidance from the project skill: ${advisorGuidance}`;
}

function parseJson(content) {
  return JSON.parse(content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''));
}

function cleanList(value, minimum = 1, maximum = 5) {
  const items = Array.isArray(value) ? value.map((item) => String(item || '').trim()).filter(Boolean).slice(0, maximum) : [];
  if (items.length < minimum) throw new Error('Groq returned an incomplete assessment.');
  return items;
}

async function requestCounselFeedback(idea) {
  const system = [
    'You are AI Counsel for E-Cell BMSIT.',
    councilRules(),
    'Help a student pressure-test an early startup idea without accepting, rejecting, or numerically scoring it.',
    'Be encouraging, specific, concise, and honest about uncertainty.',
    'Return only valid JSON with exactly these keys: understanding, questions, constraints, researchTasks, nextStep.',
    'questions must contain exactly 5 useful questions covering customer need, differentiation, revenue, scaling, and execution risks.',
    'constraints and researchTasks should be arrays of short actionable items.',
  ].join(' ');
  return parseModelResponse(await requestGroq(system, idea));
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
      model: getModel(),
    });
    return res.status(error.statusCode || 502).json({
      error: 'AI feedback is temporarily unavailable. Your draft is still here. Please try again.',
    });
  }
}

async function requestIdeaEvaluation(idea, answers) {
  const framedQuestion = JSON.stringify({
    decision: 'What should this founder validate or change before taking the idea further?',
    idea,
    interviewAnswers: answers.map((answer, index) => ({ questionNumber: index + 1, answer: answer.trim() })),
    stakes: 'The student needs honest, specific guidance before spending time or money.',
  });
  const rules = councilRules();
  const advisorResponses = await Promise.all(COUNCIL_LENSES.map(async ([name, lens]) => {
    const system = `${rules} You are ${name}. ${lens} Respond independently in 150-300 words. Name specific evidence and missing evidence. Do not give a final verdict.`;
    return requestGroq(system, framedQuestion, 900);
  }));

  // Rotate labels so a reviewer never sees its own role attached to a response.
  const anonymous = advisorResponses.map((response, index) => ({ label: String.fromCharCode(65 + ((index + 2) % 5)), response }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const reviews = await Promise.all(COUNCIL_LENSES.map(async ([name]) => {
    const system = `${rules} You are ${name}, peer-reviewing five anonymous council responses. Pick the strongest response and why, the biggest blind spot, and what all responses missed. Refer only to response letters. Keep the review under 200 words.`;
    return requestGroq(system, JSON.stringify({ question: framedQuestion, responses: anonymous }), 700);
  }));

  const synthesisSystem = `${rules} You are the chairman. Synthesize the five independent advisors and five anonymous peer reviews. Be direct, evidence-based, specific to the student's idea, and honest about uncertainty. Return ONLY a JSON object with keys: score (integer 0-100 reflecting evidence/readiness, not idea worth), summary (one concise paragraph), strengths (2-4 strings), assumptionMistakes (2-4 strings identifying unsupported or mistaken assumptions, each with why it matters), immediateQuestions (3-5 concrete questions the founder must answer), nextSteps (3-5 ordered, doable actions with validation criteria), gaps (3-5 specific weaknesses), councilAgrees (2-3 strings), councilClashes (0-3 strings explaining genuine disagreement; use [] if none), blindSpots (1-3 strings found through review), recommendation (clear direction with reasoning), firstStep (one concrete action for the next 48 hours). Do not invent disagreements or promise acceptance or investment. No markdown fences.`;
  const content = await requestGroq(synthesisSystem, JSON.stringify({ question: framedQuestion, advisors: COUNCIL_LENSES.map(([name], index) => ({ name, response: advisorResponses[index] })), peerReviews: reviews }), 3200);
  const parsed = parseJson(content);
  const score = Number(parsed.score);
  if (!Number.isInteger(score) || score < 0 || score > 100) throw new Error('Groq returned an invalid readiness score.');
  const requiredText = (key) => {
    const value = typeof parsed[key] === 'string' ? parsed[key].trim() : '';
    if (!value) throw new Error(`Groq omitted ${key} from the assessment.`);
    return value;
  };
  return {
    score,
    summary: requiredText('summary'),
    strengths: cleanList(parsed.strengths, 2, 4),
    assumptionMistakes: cleanList(parsed.assumptionMistakes, 2, 4),
    immediateQuestions: cleanList(parsed.immediateQuestions, 3, 5),
    nextSteps: cleanList(parsed.nextSteps, 3, 5),
    gaps: cleanList(parsed.gaps, 3, 5),
    councilAgrees: cleanList(parsed.councilAgrees, 2, 3),
    councilClashes: cleanList(parsed.councilClashes, 0, 3),
    blindSpots: cleanList(parsed.blindSpots, 1, 3),
    recommendation: requiredText('recommendation'),
    firstStep: requiredText('firstStep'),
  };
}

module.exports = {
  MAX_IDEA_LENGTH,
  counselFeedbackHandler,
  normalizeIdea,
  requestCounselFeedback,
  requestIdeaEvaluation,
  validateIdea,
};


