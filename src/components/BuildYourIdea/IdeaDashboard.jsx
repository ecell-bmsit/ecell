import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  CheckCircle,
  AlertCircle,
  Brain,
  FileText,
  PlusCircle,
  LogOut,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Clock,
  Shield,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  AlertTriangle,
  ListChecks,
  Compass,
  Mail
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { LampContainer } from '../ui/lamp';
import AssessmentResult from './AssessmentResult';

const OTP_LENGTH = 6;

const IdeaDashboard = ({ showBackLink = true, redirectWhenAuthenticated = false }) => {
  const navigate = useNavigate();
  const shouldRedirectAfterLogin = useRef(false);
  // -- Auth State -------------------------------------------------------------
  const [authEmail, setAuthEmail] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [authStep, setAuthStep] = useState('email'); // 'email' | 'otp' | 'name'
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [accountName, setAccountName] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // -- Dashboard Tabs ---------------------------------------------------------
  const [activeTab, setActiveTab] = useState('submissions'); // 'submissions' | 'submit' | 'interview'

  // -- Submissions History State ----------------------------------------------
  const [myIdeas, setMyIdeas] = useState([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [ideasError, setIdeasError] = useState('');
  const [expandedIdeaId, setExpandedIdeaId] = useState(null);

  // -- Submit New Idea State --------------------------------------------------
  const [formData, setFormData] = useState({
    email: '',
    title: '',
    idea: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(''); // 'success' | 'error' | ''
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState('');

  // -- AI Counsel State -------------------------------------------------------
  const [counselDraft, setCounselDraft] = useState('');
  const [isGettingFeedback, setIsGettingFeedback] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [aiError, setAiError] = useState('');
  const [interviewSubmissionId, setInterviewSubmissionId] = useState(null);
  const [interviewIdea, setInterviewIdea] = useState('');
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [interviewAnswers, setInterviewAnswers] = useState(Array(5).fill(''));
  const [interviewStep, setInterviewStep] = useState(0);
  const [isGeneratingInterview, setIsGeneratingInterview] = useState(false);
  const [isSubmittingEvaluation, setIsSubmittingEvaluation] = useState(false);
  const [interviewError, setInterviewError] = useState('');
  const [evaluationResult, setEvaluationResult] = useState(null);
  const interviewMessagesRef = useRef(null);
  const interviewEvaluationRef = useRef(null);

  useEffect(() => {
    if (activeTab !== 'interview') return undefined;
    const target = evaluationResult ? interviewEvaluationRef.current : interviewMessagesRef.current;
    if (!target) return undefined;
    const frame = window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeTab, interviewQuestions.length, interviewStep, isGeneratingInterview, isSubmittingEvaluation, evaluationResult]);

  useEffect(() => {
    if (redirectWhenAuthenticated && shouldRedirectAfterLogin.current && !authLoading && authUser) {
      shouldRedirectAfterLogin.current = false;
      navigate('/build-your-idea', { replace: true });
    }
  }, [redirectWhenAuthenticated, authLoading, authUser, navigate]);
  // -- Cooldown timer for OTP -------------------------------------------------
  useEffect(() => {
    if (!resendCooldown) return undefined;
    const timer = window.setInterval(() => {
      setResendCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  // -- Verify session on mount & auth change ----------------------------------
  useEffect(() => {
    let active = true;

    const verifySession = async (session) => {
      if (!session?.access_token || !active) {
        if (active) {
          setAuthUser(null);
          setMyIdeas([]);
        }
        return;
      }

      try {
        const response = await fetch('/api/auth/session', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error('Session verification failed.');
        if (active) {
          if (!data.user.name) {
            setAuthUser(null);
            setAccountName('');
            setAuthStep('name');
            return;
          }
          setAuthUser(data.user);
          setFormData((prev) => ({ ...prev, email: data.user.email }));
        }
      } catch {
        await supabase?.auth.signOut();
        if (active) {
          setAuthUser(null);
          setMyIdeas([]);
        }
      }
    };

    if (!supabase) {
      setAuthLoading(false);
      return () => { active = false; };
    }

    supabase.auth.getSession().then(({ data }) => verifySession(data.session)).finally(() => {
      if (active) setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      void verifySession(session);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // -- Fetch User's Previous Ideas --------------------------------------------
  const fetchMyIdeas = useCallback(async () => {
    if (!authUser) return;
    setLoadingIdeas(true);
    setIdeasError('');

    try {
      const { data: sessionData } = (await supabase?.auth.getSession()) || { data: { session: null } };
      const accessToken = sessionData.session?.access_token;

      // First attempt: direct Supabase authenticated select
      if (supabase && accessToken) {
        const { data, error } = await supabase
          .from('idea_submissions')
          .select('id, created_at, name, email, title, idea, status, ai_gaps, ai_assessment, evaluation_answers')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          setMyIdeas(data);
          setLoadingIdeas(false);
          return;
        }
      }

      // Fallback: fetch through server API
      if (accessToken) {
        const response = await fetch('/api/my-ideas', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const result = await response.json();
        if (response.ok && Array.isArray(result.ideas)) {
          setMyIdeas(result.ideas);
          setLoadingIdeas(false);
          return;
        }
      }

      setMyIdeas([]);
    } catch (err) {
      console.error('Error fetching ideas:', err);
      setIdeasError('Unable to load past submissions. Please try refreshing.');
    } finally {
      setLoadingIdeas(false);
    }
  }, [authUser]);

  // Fetch ideas once authenticated or tab switched to submissions
  useEffect(() => {
    if (authUser) {
      fetchMyIdeas();
    }
  }, [authUser, fetchMyIdeas]);

  // -- Request OTP Handler ----------------------------------------------------
  const handleRequestOtp = async () => {
    const trimmedEmail = authEmail.trim().toLowerCase();
    if (!trimmedEmail) {
      setAuthError('Please enter your college email.');
      return;
    }
    if (!trimmedEmail.endsWith('@bmsit.in')) {
      setAuthError('Access is restricted to BMSIT students (@bmsit.in).');
      return;
    }
    if (authStep === 'otp' && resendCooldown > 0) return;

    setAuthBusy(true);
    setAuthError('');
    setAuthMessage('');
    try {
      const response = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to send the verification code.');

      setAuthStep('otp');
      setResendCooldown(60);
      setAuthMessage(data.message || `A 6-digit code was sent to ${trimmedEmail}`);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to send the verification code.');
    } finally {
      setAuthBusy(false);
    }
  };

  // -- Verify OTP Handler -----------------------------------------------------
  const handleVerifyOtp = async () => {
    if (!authOtp || authOtp.length !== OTP_LENGTH) {
      setAuthError('Please enter the full 6-digit code.');
      return;
    }
    shouldRedirectAfterLogin.current = true;
    setAuthBusy(true);
    setAuthError('');
    setAuthMessage('');
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail.trim().toLowerCase(), token: authOtp.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'The verification code is invalid or expired.');
      if (!supabase) throw new Error('Authentication is not configured for this browser.');

      await supabase.auth.setSession({ access_token: data.access_token, refresh_token: data.refresh_token });
      const { data: currentUserData } = await supabase.auth.getUser();
      const accountNameFromAuth = data.user.name || currentUserData.user?.user_metadata?.full_name || currentUserData.user?.user_metadata?.name || '';
      setAuthOtp('');
      if (!accountNameFromAuth.trim()) {
        setAuthUser(null);
        setAccountName('');
        setAuthStep('name');
        setAuthMessage('Add your name once to finish setting up your account.');
      } else {
        const signedInUser = { ...data.user, name: accountNameFromAuth.trim() };
        setAuthUser(signedInUser);
        setFormData((prev) => ({ ...prev, email: signedInUser.email }));
        setAuthMessage('Email verified successfully! Welcome to your Idea Dashboard.');
        setActiveTab('submissions');
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'The verification code is invalid or expired.');
    } finally {
      setAuthBusy(false);
    }
  };

  // -- Logout Handler ---------------------------------------------------------
  const handleSaveAccountName = async (event) => {
    event.preventDefault();
    const trimmedName = accountName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      setAuthError('Your name must be between 2 and 100 characters.');
      return;
    }
    shouldRedirectAfterLogin.current = true;
    setAuthBusy(true);
    setAuthError('');
    try {
      const { data, error } = await supabase.auth.updateUser({ data: { full_name: trimmedName } });
      if (error || !data.user) throw error || new Error('Unable to save your account name.');
      const signedInUser = { id: data.user.id, email: data.user.email, name: trimmedName };
      setAuthUser(signedInUser);
      setFormData((prev) => ({ ...prev, email: signedInUser.email }));
      setAuthStep('email');
      setAuthMessage('Your account name is saved and will be used on future submissions.');
      setActiveTab('submissions');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to save your account name.');
    } finally {
      setAuthBusy(false);
    }
  };
  const handleLogout = async () => {
    setAuthBusy(true);
    try {
      const { data } = (await supabase?.auth.getSession()) || { data: { session: null } };
      if (data.session?.access_token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${data.session.access_token}` },
        });
      }
      await supabase?.auth.signOut();
      setAuthUser(null);
      setMyIdeas([]);
      setAuthStep('email');
      setAuthEmail('');
      setAccountName('');
      setAuthOtp('');
      setAuthMessage('You have been signed out.');
    } finally {
      setAuthBusy(false);
    }
  };

  // -- Form Input Change Handler ----------------------------------------------
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (submitStatus) setSubmitStatus('');
  };

  // -- Submit New Idea Handler ------------------------------------------------
  const handleSubmitIdea = async (e) => {
    e?.preventDefault();
    setSubmitStatus('');
    setSubmitSuccessMessage('');

    const errors = {};
    const currentEmail = authUser?.email || formData.email;
    if (!formData.title.trim()) errors.title = 'Please enter an idea title';
    else if (formData.title.trim().length < 3) errors.title = 'Title must be at least 3 characters';
    else if (formData.title.trim().length > 120) errors.title = 'Title must be under 120 characters';
    if (!currentEmail?.trim()) errors.email = 'Email address is required';

    if (!formData.idea.trim()) errors.idea = 'Please describe your startup concept';
    else if (formData.idea.trim().length < 50) errors.idea = 'Your idea description must be at least 50 characters';
    else if (formData.idea.trim().length > 5000) errors.idea = 'Idea must be under 5,000 characters';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitStatus('error');
      return;
    }

    const { data: sessionData } = (await supabase?.auth.getSession()) || { data: { session: null } };
    const accessToken = sessionData.session?.access_token;
    if (!accessToken || !authUser) {
      setSubmitStatus('error');
      setFormErrors({ general: 'Session expired. Please re-verify your college email.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/submit-idea', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          email: currentEmail.trim(),
          title: formData.title.trim(),

          idea: formData.idea.trim(),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSubmitStatus('success');
        setSubmitSuccessMessage('Your idea is saved. The E-Cell team will follow up after review.');
        setFormData({ email: authUser?.email || '', title: '', idea: '' });
        setFormErrors({});
        fetchMyIdeas();
        void handleStartEvaluation({ id: data.submissionId, idea: formData.idea.trim() });
      } else {
        setSubmitStatus('error');
        if (data.details) {
          const newErrors = {};
          data.details.forEach((err) => {
            newErrors[err.path] = err.msg;
          });
          setFormErrors(newErrors);
        } else {
          setFormErrors({ general: data.error || 'Failed to submit idea. Please try again.' });
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
      setFormErrors({ general: 'Network error. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // -- AI Counsel Feedback Handler --------------------------------------------
  const handleGetCounselFeedback = async () => {
    const textToAnalyze = counselDraft.trim() || formData.idea.trim();
    if (!textToAnalyze) {
      setAiError('Please enter a draft idea before requesting AI feedback.');
      return;
    }
    if (textToAnalyze.length < 20) {
      setAiError('Please provide a slightly more descriptive idea (at least 20 characters).');
      return;
    }
    if (textToAnalyze.length > 5000) {
      setAiError('Please keep your idea draft within 5,000 characters.');
      return;
    }

    setIsGettingFeedback(true);
    setAiError('');
    setAiFeedback(null);

    try {
      const { data: sessionData } = (await supabase?.auth.getSession()) || { data: { session: null } };
      const accessToken = sessionData.session?.access_token;
      if (!accessToken || !authUser) {
        throw new Error('Verify your college email before requesting AI Counsel feedback.');
      }

      const response = await fetch('/api/counsel/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ idea: textToAnalyze }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to generate AI Counsel feedback.');
      }
      setAiFeedback(data);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Unable to connect to AI Counsel.');
    } finally {
      setIsGettingFeedback(false);
    }
  };

  // -- Load idea into AI Counsel tab ------------------------------------------
  const handleStartEvaluation = async (item) => {
    setInterviewSubmissionId(item.id);
    setInterviewIdea(item.idea);
    setInterviewQuestions([]);
    setInterviewAnswers(Array(5).fill(''));
    setInterviewStep(0);
    setEvaluationResult(null);
    setInterviewError('');
    setIsGeneratingInterview(true);
    setActiveTab('interview');
    try {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (!accessToken) throw new Error('Your session expired. Please sign in again.');
      const response = await fetch('/api/counsel/feedback', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ idea: item.idea }),
      });
      const result = await response.json();
      if (!response.ok || !Array.isArray(result.questions) || result.questions.length !== 5) throw new Error(result.error || 'Unable to start the AI conversation. Please try again.');
      setInterviewQuestions(result.questions);
    } catch (error) {
      setInterviewError(error instanceof Error ? error.message : 'Unable to prepare the evaluation questions.');
    } finally {
      setIsGeneratingInterview(false);
    }
  };

  const handleSubmitEvaluation = async (event) => {
    event.preventDefault();
    if (!interviewAnswers[interviewStep]?.trim()) {
      setInterviewError('Please answer this question before continuing.');
      return;
    }
    setInterviewError('');
    if (interviewStep < interviewQuestions.length - 1) {
      setInterviewStep((step) => step + 1);
      return;
    }
    setIsSubmittingEvaluation(true);
    setInterviewError('');
    try {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (!accessToken) throw new Error('Your session expired. Please sign in again.');
      const response = await fetch('/api/ideas/evaluation', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ submissionId: interviewSubmissionId, answers: interviewAnswers }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'AI evaluation could not be completed.');
      setEvaluationResult(result);
      await fetchMyIdeas();
    } catch (error) {
      setInterviewError(error instanceof Error ? error.message : 'The evaluation could not be completed. Please try again.');
    } finally {
      setIsSubmittingEvaluation(false);
    }
  };

  // -- Load AI Counsel idea into Submit Form ----------------------------------
  const handleTransferToSubmitForm = () => {
    setFormData((prev) => ({
      ...prev,
      idea: counselDraft || formData.idea,
    }));
    setActiveTab('submit');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // -- Format Date Helper -----------------------------------------------------
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  // --- AUTHENTICATION STATE: CHECKING -----------------------------------
  if (redirectWhenAuthenticated && authUser) {
    return (
      <div className="w-full min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-24 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-wide">Build Your Idea</h2>
        <p className="mt-3 text-sm text-neutral-300">Your dashboard is ready whenever you want to work on your ideas.</p>
        <Link to="/build-your-idea" className="mt-6 inline-flex items-center gap-2 rounded-full bg-neutral-600 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-500 transition-colors">
          Open Build Your Idea <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="w-full min-h-screen bg-black text-white flex flex-col items-center justify-center py-24 text-center">
        <div className="w-10 h-10 border-2 border-white/20 border-t-[#ff3b1f] rounded-full animate-spin mb-4" />
        <p className="text-neutral-400 text-sm">Verifying college credentials...</p>
      </div>
    );
  }

  // --- AUTHENTICATION STATE: NOT LOGGED IN (EXACT LANDING PAGE LAMP DESIGN) ---
  if (!authUser) {
    return (
      <div className="w-full min-h-screen bg-black text-white relative idea-section-wrapper" style={{ fontFamily: 'var(--font-body)' }}>
        {/* Navigation Breadcrumb / Top Bar */}
        <div className="absolute top-6 left-6 sm:left-10 z-50" style={{ display: showBackLink ? undefined : 'none' }}>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-white/60 hover:text-white text-sm transition-colors group"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Exact Lamp Container from Landing Page */}
        <div className="w-full relative z-10 -translate-y-12">
          <LampContainer
            className="min-h-screen py-16 md:py-0"
            lampClassName="md:translate-y-48 lg:translate-y-52"
            contentClassName="translate-y-16 sm:translate-y-18 md:translate-y-16 lg:translate-y-20 pt-16 sm:pt-20 md:pt-14 pb-16"
          >
            <h1
              className="w-full mb-8 text-center whitespace-nowrap font-normal uppercase tracking-[-0.04em] leading-none idea-page-title"
              style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 7vw, 5rem)', lineHeight: 1 }}
            >
              BUILD YOUR IDEA
            </h1>
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 sm:space-y-5">
                <motion.div
                  initial={{ opacity: 0.5, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8, ease: 'easeInOut' }}
                  className="w-full max-w-xl space-y-4 py-2 text-left -translate-y-16"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  <p className="text-xl sm:text-2xl md:text-3xl font-semibold leading-snug text-white">Shape your idea into<br />a venture with expert guidance<br />at every step.</p>
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="w-full max-w-[430px] mx-auto lg:max-w-[430px] lg:mr-0"
              >
                <div className="rounded-[8px] bg-transparent border-0 px-6 sm:px-8 pt-8 pb-10 sm:pt-10 sm:pb-12 shadow-none text-left min-h-[400px] sm:min-h-[440px] flex flex-col">
                  
                {/* Step 1: Email Input */}
                {authStep === 'email' && (
                  <div className="pt-8 space-y-8 sm:space-y-9">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
                      <input
                        type="email"
                        value={authEmail}
                        onChange={(e) => {
                          setAuthEmail(e.target.value);
                          setAuthError('');
                        }}
                        placeholder="yourusn@bmsit.in"
                        disabled={authBusy}
                        className="w-full pl-11 pr-2 py-3.5 sm:py-4 rounded-none bg-transparent border-x-0 border-t-0 border-b border-white/50 text-white placeholder-neutral-400 text-sm sm:text-base focus:outline-none focus:border-white focus:ring-0 transition-colors"
                      />
                    </div>

                    {/* Capsule Button Design matching BuildIdeaCTA - moved a bit down */}
                    <div className="w-full">
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        disabled={authBusy || !authEmail.trim()}
                        className="w-full py-4 px-5 rounded-xl bg-[#52525b] text-white font-semibold text-sm hover:bg-[#71717a] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-neutral-700 disabled:text-neutral-400 disabled:cursor-not-allowed shadow-md shadow-[#52525b]/20 disabled:shadow-none"
                        style={{ fontFamily: 'Satoshi, sans-serif' }}
                      >
                        {authBusy ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <span>Send verification code</span>
                            <ArrowRight className="w-4 h-4 shrink-0" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: 6-Digit OTP */}
                {authStep === 'otp' && (
                  <div className="space-y-6 sm:space-y-7">
                    <div className="flex items-center justify-between text-xs text-neutral-400 px-0.5">
                      <span className="truncate">Sent to <strong className="text-white font-mono">{authEmail}</strong></span>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthStep('email');
                          setAuthError('');
                        }}
                        className="text-[#a1a1aa] hover:underline cursor-pointer shrink-0 ml-2 font-semibold"
                      >
                        Change
                      </button>
                    </div>

                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={OTP_LENGTH}
                      value={authOtp}
                      onChange={(e) => {
                        setAuthOtp(e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH));
                        setAuthError('');
                      }}
                      placeholder="??????"
                      disabled={authBusy}
                      className="w-full py-3.5 sm:py-4 px-4 rounded-[4px] bg-black border border-white/70 text-white text-center font-mono text-xl sm:text-2xl tracking-[0.45em] placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
                    />

                    <div className="flex items-center justify-between text-[11px] text-neutral-400 px-0.5">
                      <span>Didn't receive email?</span>
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        disabled={authBusy || resendCooldown > 0}
                        className="text-[#a1a1aa] hover:underline disabled:opacity-40 cursor-pointer"
                      >
                        {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend code'}
                      </button>
                    </div>

                    {/* Capsule Button Design matching BuildIdeaCTA - moved a bit down */}
                    <div className="w-full">
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={authBusy || authOtp.length !== OTP_LENGTH}
                        className="w-full py-4 px-5 rounded-xl bg-[#52525b] text-white font-semibold text-sm hover:bg-[#71717a] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-neutral-700 disabled:text-neutral-400 disabled:cursor-not-allowed shadow-md shadow-[#52525b]/20 disabled:shadow-none"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        {authBusy ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 shrink-0" />
                            <span>Verify & Enter Dashboard</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {authStep === 'name' && (
                  <form onSubmit={handleSaveAccountName} className="space-y-6">
                    <p className="text-sm text-neutral-300">Enter your name once. We?ll save it to your account and use it on your idea submissions.</p>
                    <input type="text" value={accountName} onChange={(event) => { setAccountName(event.target.value); setAuthError(''); }} placeholder="Your full name" maxLength={100} autoComplete="name" disabled={authBusy} className="w-full px-4 py-3.5 rounded-[4px] bg-black border border-white/70 text-white placeholder-neutral-400 focus:outline-none focus:border-white" />
                    <div className="border border-white/70 rounded-[6px] p-[5px] bg-black">
                      <button type="submit" disabled={authBusy || accountName.trim().length < 2} className="w-full py-3.5 px-4 rounded-[3px] bg-neutral-600 text-white font-semibold text-sm hover:bg-neutral-500 disabled:bg-neutral-800 disabled:text-neutral-400 transition-colors">{authBusy ? 'Saving...' : 'Save Account Name'}</button>
                    </div>
                  </form>
                )}
                {/* Error & Success Messages */}
                {authError && (
                  <div className="mt-4 p-3.5 rounded-[4px] bg-black border border-red-500/70 text-red-400 text-xs sm:text-sm flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                )}

                {authMessage && !authError && (
                  <div className="mt-3.5 text-white text-xs sm:text-sm flex items-center gap-2 px-1">
                    <CheckCircle className="w-4 h-4 text-white shrink-0" />
                    <span>{authMessage}</span>
                  </div>
                )}
                </div>
              </motion.div>
            </div>
          </LampContainer>
        </div>
      </div>
    );
  }

  // --- AUTHENTICATED STATE: FULL DASHBOARD ------------------------------
  return (
    <div className="w-full min-h-screen bg-black text-white relative idea-section-wrapper" style={{ fontFamily: 'var(--font-body)' }}>
      {/* Navigation Breadcrumb / Top Bar */}
      <div className="absolute top-6 left-6 sm:left-10 z-50" style={{ display: showBackLink ? undefined : 'none' }}>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-white/60 hover:text-white text-sm transition-colors group"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
      </div>

      {!authLoading && authUser && (
        <div className="absolute top-6 right-6 sm:right-10 z-50">
          <button
            type="button"
            onClick={handleLogout}
            disabled={authBusy}
            className="inline-flex items-center gap-2 px-0 py-2 bg-transparent border-0 text-white/75 hover:text-white text-sm font-medium transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      <div className="w-full min-h-screen relative z-10 pt-28 pb-16">
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Page Hero Title (Authenticated Dashboard View) */}
            <div className="text-left mb-8">
              <h1
                className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-white leading-tight"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Student Venture Portal
              </h1>
            </div>

        {/* --- AUTHENTICATED STATE: FULL DASHBOARD ------------------------------ */}
        {!authLoading && authUser && (
          <div className="space-y-6">


            {/* Tab Navigation */}
            <div className="flex flex-wrap items-center gap-1 p-1.5 rounded-xl bg-white/[0.035] border border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab('submissions')}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  activeTab === 'submissions'
                    ? 'bg-[#52525b] text-white'
                    : 'bg-transparent text-white/60 hover:text-white hover:bg-white/[0.06]'
                }`}
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                <FileText className="w-4 h-4" />
                <span>My Submissions</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-[3px] font-mono ${activeTab === 'submissions' ? 'bg-white/20 text-white' : 'border border-white/20 text-white/70'}`}>
                  {myIdeas.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('submit')}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  activeTab === 'submit'
                    ? 'bg-[#52525b] text-white'
                    : 'bg-transparent text-white/60 hover:text-white hover:bg-white/[0.06]'
                }`}
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit New Idea</span>
              </button>
            </div>

            {/* --- TAB 1: MY SUBMISSIONS (PREVIOUS IDEAS) ------------------------- */}
            {activeTab === 'submissions' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                      Your submitted ideas
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={fetchMyIdeas}
                    disabled={loadingIdeas}
                    className="p-2.5 rounded-lg bg-[#3f3f46] border border-[#52525b] text-white/90 hover:bg-[#52525b] hover:border-[#52525b] transition-all disabled:opacity-50 cursor-pointer"
                    title="Refresh Submissions"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingIdeas ? 'animate-spin text-white' : ''}`} />
                  </button>
                </div>

                {ideasError && (
                  <div className="p-4 rounded-[4px] bg-black border border-red-500/70 text-red-400 text-sm flex items-center justify-between">
                    <span>{ideasError}</span>
                    <button type="button" onClick={fetchMyIdeas} className="text-xs text-white underline cursor-pointer">Try again</button>
                  </div>
                )}

                {loadingIdeas && (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="p-6 rounded-xl bg-black border border-white/10 animate-pulse space-y-3">
                        <div className="h-4 bg-white/20 rounded-[2px] w-1/4" />
                        <div className="h-16 bg-white/10 rounded-[2px] w-full" />
                        <div className="h-4 bg-white/20 rounded-[2px] w-1/3" />
                      </div>
                    ))}
                  </div>
                )}

                {!loadingIdeas && myIdeas.length === 0 && (
                  <div className="text-center py-14 px-6 rounded-xl bg-black border border-white/10">
                    <FileText className="w-8 h-8 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
                      No Ideas Submitted Yet
                    </h3>
                    <p className="text-neutral-400 text-sm max-w-md mx-auto mt-2 leading-relaxed">
                      You haven't pitched any concepts to E-Cell BMSIT yet. Submit your first idea to get started.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                      <div className="border border-[#52525b]/50 rounded-lg p-1 bg-[#52525b]/10">
                        <button
                          type="button"
                          onClick={() => setActiveTab('submit')}
                          className="px-6 py-2.5 rounded-md bg-[#52525b] text-white text-xs sm:text-sm font-semibold uppercase tracking-[0.12em] hover:bg-[#71717a] transition-colors flex items-center gap-2 cursor-pointer"
                          style={{ fontFamily: 'var(--font-heading)' }}
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>Submit Your First Idea</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {!loadingIdeas && myIdeas.length > 0 && (
                  <div className="space-y-4">
                    {myIdeas.map((item, index) => {
                      const isExpanded = expandedIdeaId === item.id;
                      const isLong = item.idea && item.idea.length > 280;

                      return (
                        <div
                          key={item.id || index}
                          className="p-6 sm:p-7 rounded-xl bg-black border border-white/10 space-y-4 text-left"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-mono text-neutral-400">
                                #{item.id ? item.id.slice(0, 8) : `00${index + 1}`}
                              </span>
                              <span className="text-xs text-neutral-400 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                                {formatDate(item.created_at)}
                              </span>
                            </div>

                            {/* Status Badge */}
                            <div>
                              {item.status === 'reviewed' ? (
                                <span className="inline-flex items-center gap-1.5 text-white text-xs font-bold uppercase tracking-wider">
                                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                                  Reviewed by E-Cell
                                </span>
                              ) : item.status === 'archived' ? (
                                <span className="inline-flex items-center gap-1.5 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                                  Archived
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-white text-xs font-semibold uppercase tracking-wider">
                                  <Clock className="w-3.5 h-3.5 text-white" />
                                  Waiting for response
                                </span>
                              )}
                            </div>
                          </div>

                          {item.title && <h3 className="text-lg sm:text-xl font-semibold text-slate-100 leading-snug tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>{item.title}</h3>}
                          {/* Idea Text Content */}
                          <div className="text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap font-sans py-1">
                            {isLong && !isExpanded ? `${item.idea.slice(0, 280)}...` : item.idea}
                          </div>

                          {item.ai_assessment ? (
                            <details className="rounded-xl bg-white/[0.04] p-4 sm:p-5">
                              <summary className="cursor-pointer text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">View your full assessment</summary>
                              <div className="mt-6 border-t border-white/10 pt-6"><AssessmentResult result={item.ai_assessment} /></div>
                            </details>
                          ) : item.ai_gaps && (
                            <div className="rounded-xl bg-white/[0.04] p-4">
                              <p className="text-xs leading-relaxed text-neutral-300 whitespace-pre-wrap">{item.ai_gaps}</p>
                            </div>
                          )}
                          {/* Footer Actions */}
                          <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap items-center justify-between gap-3">
                            {isLong ? (
                              <button
                                type="button"
                                onClick={() => setExpandedIdeaId(isExpanded ? null : item.id)}
                                className="text-xs text-neutral-400 hover:text-white inline-flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                {isExpanded ? (
                                  <><span>Show less</span><ChevronUp className="w-3.5 h-3.5" /></>
                                ) : (
                                  <><span>Read full idea</span><ChevronDown className="w-3.5 h-3.5" /></>
                                )}
                              </button>
                            ) : <div />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* --- TAB 2: SUBMIT NEW IDEA ----------------------------------------- */}
            {activeTab === 'interview' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                <div className="py-5 sm:py-8">
                  <div className="mb-4 flex items-start justify-between gap-4 border-b border-white/10 pb-3">
                    <div className="flex items-start gap-3">

                      <div>
                        <h2 className="text-left text-xl font-semibold tracking-tight text-white sm:text-2xl">AI venture conversation</h2>
                        <p className="mt-1 text-left text-sm text-neutral-400">Your idea is saved. Share a few more details so our team can review it.</p>
                      </div>
                    </div>
                    
                  </div>
                  {isGeneratingInterview && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto flex min-h-[220px] max-w-3xl items-center justify-center">
                      <div className="flex items-center gap-3 text-sm text-neutral-300">
                        <Sparkles className="h-4 w-4 animate-pulse text-neutral-200" />
                        <span>Preparing your conversation</span>
                        <span className="flex gap-1" aria-hidden="true">{[0, 1, 2].map((dot) => <motion.span key={dot} className="h-1.5 w-1.5 rounded-full bg-neutral-300" animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }} transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.15 }} />)}</span>
                      </div>
                    </motion.div>
                  )}
                  {interviewError && <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-5 text-sm text-red-300">{interviewError}</motion.div>}
                  {!isGeneratingInterview && interviewQuestions.length === 5 && (
                    <div className="mx-auto max-w-3xl">
                      <div className="mb-6 flex items-center justify-between gap-3">
                        
                        
                      </div>

                      <div ref={interviewMessagesRef} className="mb-5 min-h-[240px] space-y-8 px-1 py-2" aria-live="polite" style={{ fontFamily: "Satoshi, sans-serif" }}>
                        <AnimatePresence initial={false}>
                          {interviewQuestions.slice(0, interviewStep + 1).map((question, index) => (
                            <React.Fragment key={`turn-${index}`}>
                              <motion.div layout initial={{ opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.28, ease: 'easeOut' }} className="flex items-start gap-3">
                                <span className="mt-1 shrink-0 text-neutral-500"><Brain className="h-4 w-4" /></span>
                                <div className="max-w-[88%] rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.05] px-4 py-3 text-left text-sm leading-7 text-neutral-200">
                                  {question}
                                </div>
                              </motion.div>
                              {(index < interviewStep || (isSubmittingEvaluation && index === interviewStep) || Boolean(evaluationResult)) && (
                                <motion.div layout initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.24, ease: 'easeOut' }} className="flex justify-end">
                                  <div className="max-w-[88%] rounded-2xl rounded-tr-sm border border-white/10 bg-neutral-900 px-4 py-3 whitespace-pre-wrap text-left text-sm leading-7 text-neutral-200">
                                    {interviewAnswers[index]}
                                  </div>
                                </motion.div>
                              )}
                            </React.Fragment>
                          ))}
                          {isSubmittingEvaluation && !evaluationResult && (
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
                              <Brain className="mt-1 h-4 w-4 shrink-0 text-neutral-500" />
                              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.05] px-4 py-3" aria-label="AI Counsel is reviewing your answers">
                                {[0, 1, 2].map((dot) => <motion.span key={dot} className="h-2 w-2 rounded-full bg-neutral-300" animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }} transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.15 }} />)}
                              </div>
                            </motion.div>
                          )}
                          
                        </AnimatePresence>
                      </div>

                      {evaluationResult && (
                        <motion.section ref={interviewEvaluationRef} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mt-10 max-w-3xl border-t border-white/10 pt-7 text-left" style={{ fontFamily: "Satoshi, sans-serif" }}>
                          <AssessmentResult result={evaluationResult} />
                          <p className="mt-6 text-sm font-semibold text-neutral-100">Our Team will Contact you soon.</p>
                        </motion.section>
                      )}
                      {!evaluationResult && (
                        <form onSubmit={handleSubmitEvaluation} className="mt-7">
                          <label htmlFor="interview-answer" className="sr-only">Your answer</label>
                          <textarea
                            id="interview-answer"
                            value={interviewAnswers[interviewStep]}
                            onChange={(event) => setInterviewAnswers((answers) => answers.map((answer, index) => index === interviewStep ? event.target.value : answer))}
                            placeholder="Write your reply..."
                            rows={3}
                            maxLength={3000}
                            disabled={isSubmittingEvaluation}
                            className="w-full resize-y border-0 border-b border-white/20 bg-transparent px-0 py-3 text-sm leading-relaxed text-white placeholder:text-neutral-500 focus:border-white/60 focus:outline-none disabled:opacity-50"
                            required
                          />
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-neutral-500">Share your answer when you are ready</span>
                            <motion.button type="submit" disabled={isSubmittingEvaluation} whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-2 py-2 text-sm font-medium text-neutral-300 transition-colors hover:text-white disabled:cursor-wait disabled:opacity-60">
                              {isSubmittingEvaluation ? 'Reviewing' : interviewStep === interviewQuestions.length - 1 ? 'Finish' : 'Send'}
                              {!isSubmittingEvaluation && <Send className="h-3.5 w-3.5" />}
                            </motion.button>
                          </div>
                        </form>
                      )}
                      {evaluationResult && <motion.button type="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setActiveTab('submissions')} className="mt-5 text-xs font-semibold uppercase tracking-wide text-neutral-400 transition hover:text-white">Back to dashboard</motion.button>}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            {activeTab === 'submit' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl mx-auto"
              >
                <div className="p-6 sm:p-8 rounded-xl bg-black border border-white/10 relative overflow-hidden">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold uppercase tracking-wide text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                      Submit a new idea
                    </h2>
                  </div>

                  {submitStatus === 'success' && (
                    <div className="mb-6 p-4 rounded-[4px] bg-black border border-white/70 text-white text-sm flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-white shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold uppercase tracking-wider text-xs">Submission Confirmed!</p>
                        <p className="text-neutral-300 text-xs mt-1">{submitSuccessMessage}</p>
                      </div>
                    </div>
                  )}

                  {formErrors.general && (
                    <div className="mb-6 p-4 rounded-[4px] bg-black border border-red-500/70 text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{formErrors.general}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmitIdea} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
                      <div>
                        <label className="block text-left text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">Account Name</label>
                        <div className="w-full py-3.5 bg-transparent border-x-0 border-t-0 border-b border-white/50 text-left text-neutral-300 text-sm">{authUser?.name}</div>
                      </div>
                      <div>
                        <label className="block text-left text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">Verified College Email</label>
                        <input type="email" value={authUser?.email || formData.email} disabled className="w-full px-0 py-3.5 bg-transparent border-x-0 border-t-0 border-b border-white/50 text-left text-neutral-400 text-sm cursor-not-allowed font-mono opacity-80" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label htmlFor="idea-title" className="text-xs font-bold uppercase tracking-wider text-neutral-300">Idea Title *</label>
                        <span className="text-xs text-neutral-500">{formData.title.length} / 120</span>
                      </div>
                      <input
                        id="idea-title"
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleFormChange}
                        maxLength={120}
                        placeholder="e.g. SkillSwap: Peer-to-peer skill exchange"
                        disabled={isSubmitting}
                        className={`w-full px-0 py-3 bg-transparent border-x-0 border-t-0 border-b text-white placeholder-neutral-400 focus:outline-none transition-colors text-sm ${formErrors.title ? 'border-red-500' : 'border-white/50 focus:border-white'}`}
                      />
                      {formErrors.title && <p className="text-red-400 text-xs mt-1.5">{formErrors.title}</p>}
                    </div>
                    {/* Startup Idea Description */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                          Startup Concept & Problem Statement *
                        </label>
                        <span className={`text-xs ${formData.idea.length > 5000 ? 'text-red-400' : 'text-neutral-500'}`}>
                          {formData.idea.length} / 5,000 chars
                          {formData.idea.length > 0 && formData.idea.length < 50 && (
                            <span className="text-red-400 ml-1">({50 - formData.idea.length} more needed)</span>
                          )}
                        </span>
                      </div>

                      <textarea
                        name="idea"
                        value={formData.idea}
                        onChange={handleFormChange}
                        rows={7}
                        placeholder="Detail your venture idea, the pain point you are tackling, and your intended solution... (Minimum 50 characters)"
                        disabled={isSubmitting}
                        className={`w-full px-0 py-3 bg-transparent border-x-0 border-t-0 border-b text-white placeholder-neutral-400 focus:outline-none transition-colors text-sm leading-relaxed resize-y min-h-[160px] ${
                          formErrors.idea
                            ? 'border-red-500'
                            : 'border-white/50 focus:border-white'
                        }`}
                      />
                      {formErrors.idea && (
                        <p className="text-red-400 text-xs mt-1.5">{formErrors.idea}</p>
                      )}
                    </div>

                    {/* Action Row */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">

                      <div className="w-full sm:flex-1">
                        <button
                          type="submit"
                          disabled={isSubmitting || formData.title.trim().length < 3 || formData.idea.length < 50}
                          className="w-full py-4 px-6 rounded-full bg-[#52525b] text-white font-semibold text-sm sm:text-base hover:bg-[#71717a] active:scale-[0.99] transition-all disabled:bg-neutral-800 disabled:text-neutral-400 disabled:hover:bg-neutral-800 disabled:cursor-not-allowed shadow-lg shadow-[#52525b]/20 disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer"
                          style={{ fontFamily: 'var(--font-heading)' }}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Submitting to E-Cell...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>Submit idea</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* --- TAB 3: AI COUNSEL ------------------------------------------------- */}
            {activeTab === 'counsel' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full space-y-6"
              >
                {/* 2-Column Responsive Split Layout (Equal 50/50 Width & Identical Height) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
                  
                  {/* -- LEFT COLUMN: ENTER IDEA CONSOLE (50% Width, Matched Height) -- */}
                  <div className="flex flex-col lg:h-[calc(100vh-210px)] min-h-[520px]">
                    <div className="p-6 sm:p-7 rounded-[8px] bg-black border border-white/70 flex flex-col h-full shadow-2xl overflow-hidden">
                      {/* Header */}
                      <div className="mb-5 shrink-0">
                        <div className="min-w-0">
                          <h2
                            className="text-lg sm:text-xl font-bold uppercase tracking-wide text-white leading-tight"
                            style={{ fontFamily: 'var(--font-heading)' }}
                          >
                            AI Counsel
                          </h2>
                        </div>
                      </div>

                      {/* Text Input Area (Flex-1 to fill exact available height) */}
                      <div className="flex-1 flex flex-col min-h-0 space-y-3">
                        <div className="flex items-center justify-between text-xs text-neutral-400 shrink-0">
                          <label className="font-mono uppercase tracking-wider text-[11px] text-neutral-300">
                            IDEA THESIS OR DRAFT
                          </label>
                          {formData.idea && (
                            <button
                              type="button"
                              onClick={() => setCounselDraft(formData.idea)}
                              className="text-white hover:underline text-[11px] font-medium cursor-pointer"
                            >
                              Load from Submit Tab
                            </button>
                          )}
                        </div>

                        <textarea
                          value={counselDraft}
                          onChange={(e) => {
                            setCounselDraft(e.target.value);
                            if (aiError) setAiError('');
                          }}
                          placeholder="Describe your startup concept, target customer, problem, and value proposition..."
                          disabled={isGettingFeedback}
                          className="w-full flex-1 min-h-[140px] px-4 py-3.5 rounded-[4px] bg-black border border-white/70 text-white placeholder-neutral-400 focus:outline-none focus:border-white transition-colors text-sm leading-relaxed resize-none font-mono"
                        />

                        <div className="flex items-center justify-between gap-3 text-xs text-neutral-500 font-mono shrink-0">
                          <span>{counselDraft.length} / 5,000 characters</span>
                          {counselDraft.trim().length > 0 && (
                            <button
                              type="button"
                              onClick={() => setCounselDraft('')}
                              className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
                            >
                              Clear
                            </button>
                          )}
                        </div>

                        {/* Analyze Button */}
                        <div className="border border-white/70 rounded-[6px] p-[5px] bg-black w-full shrink-0">
                          <button
                            type="button"
                            onClick={handleGetCounselFeedback}
                            disabled={isGettingFeedback || !counselDraft.trim()}
                            className="w-full py-4 px-6 rounded-full bg-[#52525b] text-white font-semibold text-sm sm:text-base hover:bg-[#71717a] active:scale-[0.99] transition-all disabled:bg-neutral-800 disabled:text-neutral-400 disabled:hover:bg-neutral-800 disabled:cursor-not-allowed shadow-lg shadow-[#52525b]/20 disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer"
                            style={{ fontFamily: 'var(--font-heading)' }}
                          >
                            {isGettingFeedback ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Counsel is Analyzing...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4" />
                                <span>Analyze with AI Counsel</span>
                              </>
                            )}
                          </button>
                        </div>

                        {aiError && (
                          <div className="p-3 rounded-[4px] bg-black border border-red-500/70 text-red-400 text-xs flex items-center gap-2.5 shrink-0">
                            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                            <span>{aiError}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* -- RIGHT COLUMN: AI RESULT PANE (50% Width, Matched Height) ---- */}
                  <div className="flex flex-col lg:h-[calc(100vh-210px)] min-h-[520px]">
                    <div className="rounded-[8px] bg-black border border-white/70 flex flex-col h-full overflow-hidden shadow-2xl">
                      
                      {/* Result Pane Top Bar */}
                      <div className="px-6 py-4 border-b border-white/70 bg-black flex items-center justify-between gap-4 shrink-0">
                        <div className="flex items-center gap-2.5">
                          {isGettingFeedback ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                              <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-white font-semibold">
                                GENERATING DIAGNOSIS...
                              </span>
                            </>
                          ) : aiFeedback ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                              <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-white font-semibold">
                                ADVISORY CRITIQUE READY
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="w-2 h-2 rounded-full bg-neutral-600" />
                              <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-neutral-400 font-semibold">
                                AWAITING ANALYSIS
                              </span>
                            </>
                          )}
                        </div>

                        {aiFeedback && (
                          <button
                            type="button"
                            onClick={handleTransferToSubmitForm}
                            className="px-3.5 py-1.5 rounded-[4px] border border-neutral-600 bg-neutral-600 text-white hover:bg-neutral-500 active:scale-[0.98] transition-all font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 shrink-0 cursor-pointer"
                            style={{ fontFamily: 'var(--font-heading)' }}
                          >
                            <span>Apply to Form</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Result Pane Scrollable Body (Fits Screen) */}
                      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 counsel-scrollbar">
                        
                        {/* State 1: Awaiting Input / Empty */}
                        {!aiFeedback && !isGettingFeedback && (
                          <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center p-6 sm:p-10 my-auto">
                            <Brain className="w-8 h-8 text-neutral-400 mb-4" />
                            <h3
                              className="text-base sm:text-lg font-bold uppercase tracking-wider text-white"
                              style={{ fontFamily: 'var(--font-heading)' }}
                            >
                              No Analysis Generated Yet
                            </h3>
                            <p className="text-neutral-400 text-xs sm:text-sm max-w-sm mt-2 leading-relaxed font-sans">
                              Write or paste your startup idea on the left, then click <strong className="text-white">"Analyze with AI Counsel"</strong>. Your structured critique, constraint matrix, and validation steps will appear right here without leaving this view.
                            </p>
                          </div>
                        )}

                        {/* State 2: Evaluating Active Loader */}
                        {isGettingFeedback && (
                          <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center p-6 sm:p-10 my-auto space-y-5">
                            <div className="relative">
                              <div className="w-14 h-14 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                              <Brain className="w-6 h-6 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                            </div>
                            <div>
                              <h3
                                className="text-white font-bold text-base sm:text-lg uppercase tracking-wider"
                                style={{ fontFamily: 'var(--font-heading)' }}
                              >
                                Evaluating Venture Viability...
                              </h3>
                              <p className="text-neutral-400 text-xs max-w-md mx-auto mt-2 leading-relaxed">
                                Inspecting problem validity, structural constraints, customer adoption hurdles, and research experiments.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* State 3: Complete Structured Feedback Cards */}
                        {aiFeedback && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                          >
                            {/* Section 1: Core Understanding */}
                            <div className="p-5 rounded-[6px] bg-black border border-white/70 space-y-2">
                              <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider text-xs">
                                <Lightbulb className="w-4 h-4 shrink-0" />
                                <span>1. Core Proposition & Value Thesis</span>
                              </div>
                              <p className="text-neutral-200 text-xs sm:text-sm leading-relaxed">
                                {aiFeedback.understanding}
                              </p>
                            </div>

                            {/* Section 2: Strategic Questions */}
                            <div className="p-5 rounded-[6px] bg-black border border-white/70 space-y-2">
                              <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider text-xs">
                                <HelpCircle className="w-4 h-4 shrink-0" />
                                <span>2. Strategic Questions to Answer</span>
                              </div>
                              <div className="space-y-2">
                                {aiFeedback.questions?.map((item, idx) => (
                                  <div key={idx} className="p-3 rounded-[4px] bg-black border border-white/40 text-xs sm:text-sm text-neutral-200 flex items-start gap-2.5">
                                    <span className="w-4 h-4 rounded-[2px] bg-white text-black text-[10px] flex items-center justify-center shrink-0 font-bold mt-0.5">
                                      {idx + 1}
                                    </span>
                                    <span className="leading-relaxed">{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Section 3: Constraints & Risks */}
                            <div className="p-5 rounded-[6px] bg-black border border-white/70 space-y-2">
                              <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider text-xs">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <span>3. Key Constraints & Structural Risks</span>
                              </div>
                              <div className="space-y-2">
                                {aiFeedback.constraints?.map((item, idx) => (
                                  <div key={idx} className="p-3 rounded-[4px] bg-black border border-white/40 text-xs sm:text-sm text-neutral-200 flex items-start gap-2.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0 mt-2" />
                                    <span className="leading-relaxed">{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Section 4: Research Tasks */}
                            <div className="p-5 rounded-[6px] bg-black border border-white/70 space-y-2">
                              <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider text-xs">
                                <ListChecks className="w-4 h-4 shrink-0" />
                                <span>4. Validation & Research Experiments</span>
                              </div>
                              <div className="space-y-2">
                                {aiFeedback.researchTasks?.map((item, idx) => (
                                  <div key={idx} className="p-3 rounded-[4px] bg-black border border-white/40 text-xs sm:text-sm text-neutral-200 flex items-start gap-2.5">
                                    <span className="w-4 h-4 rounded-[2px] bg-white text-black text-[10px] flex items-center justify-center shrink-0 font-bold mt-0.5">
                                      ?
                                    </span>
                                    <span className="leading-relaxed">{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Section 5: Next Step */}
                            <div className="p-5 rounded-[6px] bg-black border border-white/70 space-y-2">
                              <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider text-xs">
                                <Compass className="w-4 h-4 shrink-0" />
                                <span>5. Recommended Immediate Next Step</span>
                              </div>
                              <p className="text-white text-xs sm:text-sm font-medium leading-relaxed">
                                {aiFeedback.nextStep}
                              </p>
                            </div>

                            {/* Disclaimer */}
                            <div className="p-3 rounded-[4px] bg-black border border-white/40 text-neutral-400 text-[11px] leading-relaxed text-center">
                              {aiFeedback.disclaimer || 'AI feedback is for early exploration only. Verify assumptions with real users and mentors; it is not professional, legal, financial, or investment advice.'}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
            </div>
          </div>
        </div>
    );
};

export default IdeaDashboard;


















