"use client";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { LampContainer } from "@/components/ui/lamp";
import { Send, CheckCircle, AlertCircle, Quote } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const OTP_LENGTH = 6;

export function IdeaSectionHeader() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    idea: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGettingFeedback, setIsGettingFeedback] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<any>(null);
  const [aiError, setAiError] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [authStep, setAuthStep] = useState<'email' | 'otp'>('email');
  const [authUser, setAuthUser] = useState<{ id?: string; email: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!resendCooldown) return undefined;
    const timer = window.setInterval(() => {
      setResendCooldown((remaining) => Math.max(remaining - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    let active = true;

    const verifySession = async (session: { access_token?: string } | null) => {
      if (!session?.access_token || !active) {
        if (active) setAuthUser(null);
        return;
      }

      try {
        const response = await fetch('/api/auth/session', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error('Session verification failed.');
        if (active) setAuthUser(data.user);
      } catch {
        await supabase?.auth.signOut();
        if (active) setAuthUser(null);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (submitStatus) setSubmitStatus('');
    if (aiError) setAiError('');
  };

  const handleGetFeedback = async () => {
    const idea = formData.idea.trim();
    if (!idea) {
      setAiError('Write a draft idea before asking for feedback.');
      return;
    }
    if (idea.length > 5000) {
      setAiError('Please keep your idea within 5,000 characters.');
      return;
    }

    setIsGettingFeedback(true);
    setAiError('');
    try {
      const { data: sessionData } = await supabase?.auth.getSession() || { data: { session: null } };
      const accessToken = sessionData.session?.access_token;
      if (!accessToken || !authUser) throw new Error('Verify your college email before requesting AI feedback.');

      const response = await fetch('/api/counsel/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ idea }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to get AI feedback.');
      setAiFeedback(data);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Unable to get AI feedback.');
    } finally {
      setIsGettingFeedback(false);
    }
  };

  const handleRequestOtp = async () => {
    if (authStep === 'otp' && resendCooldown > 0) return;
    setAuthBusy(true);
    setAuthError('');
    setAuthMessage('');
    try {
      const response = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to send the verification code.');
      setAuthStep('otp');
      setResendCooldown(60);
      setAuthMessage(data.message || 'Check your college email for the verification code.');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to send the verification code.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleVerifyOtp = async () => {
    setAuthBusy(true);
    setAuthError('');
    setAuthMessage('');
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, token: authOtp }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'The verification code is invalid or expired.');
      if (!supabase) throw new Error('Authentication is not configured for this browser.');
      await supabase.auth.setSession({ access_token: data.access_token, refresh_token: data.refresh_token });
      setAuthUser(data.user);
      setFormData((current) => ({ ...current, email: data.user.email }));
      setAuthOtp('');
      setAuthMessage('College email verified. AI Counsel is ready.');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'The verification code is invalid or expired.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleLogout = async () => {
    setAuthBusy(true);
    try {
      const { data } = await supabase?.auth.getSession() || { data: { session: null } };
      if (data.session?.access_token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${data.session.access_token}` },
        });
      }
      await supabase?.auth.signOut();
      setAuthUser(null);
      setAuthStep('email');
      setAuthMessage('You have been signed out.');
    } finally {
      setAuthBusy(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    else if (formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.idea.trim()) newErrors.idea = 'Idea is required';
    else if (formData.idea.trim().length < 50) newErrors.idea = 'Idea must be at least 50 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setSubmitStatus('');
    if (!validateForm()) { setSubmitStatus('validation_error'); return; }
    const { data: sessionData } = await supabase?.auth.getSession() || { data: { session: null } };
    const accessToken = sessionData.session?.access_token;
    if (!accessToken || !authUser) {
      setSubmitStatus('auth_error');
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
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ email: '', name: '', idea: '' });
        setErrors({});
      } else {
        setSubmitStatus('error');
        if (data.details) {
          const newErrors: Record<string, string> = {};
          data.details.forEach((err: any) => { newErrors[err.path] = err.msg; });
          setErrors(newErrors);
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusMessage = () => {
    switch (submitStatus) {
      case 'success': return { type: 'success', icon: CheckCircle, message: 'Thank you for sharing your idea! We will review it and reach out shortly.' };
      case 'validation_error': return { type: 'error', icon: AlertCircle, message: 'Please check the form and correct any errors before submitting.' };
      case 'auth_error': return { type: 'error', icon: AlertCircle, message: 'Please verify your college email before submitting an idea.' };
      default: return { type: 'error', icon: AlertCircle, message: 'Something went wrong. Please try again later.' };
    }
  };

  const statusInfo = submitStatus ? getStatusMessage() : null;

  return (
    <div className="w-full bg-black relative z-10 text-white font-sans idea-section-wrapper">
      <LampContainer>
        <motion.h1
          style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1rem, 4.4vw, 4.5rem)' }}
          className="mt-8 w-full min-w-0 px-1 sm:px-4 bg-gradient-to-br from-white to-neutral-400 py-4 bg-clip-text text-center tracking-normal text-transparent opacity-100 translate-y-0 build-idea-text"
        >
          <span className="whitespace-nowrap">BUILD YOUR</span>
          <span className="hidden md:inline"> </span>
          <br className="md:hidden" />
          IDEA
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="block text-center text-neutral-400 max-w-xl mt-4 text-sm sm:text-base md:text-xl px-4 mx-auto w-full"
        >
          Turn your idea into reality with the right guidance and support.
        </motion.p>
      </LampContainer>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 mt-8 md:-mt-48 lg:-mt-64 relative z-20">
        <div className="flex flex-col lg:flex-row gap-16">

          {/* Quote Section - Desktop only */}
          <div className="hidden lg:block lg:basis-2/5 w-full">
            <div className="idea-quote-box bg-[#080808] border border-neutral-800 p-12 lg:sticky lg:top-8 rounded-2xl">
              <div className="relative">
                <Quote className="absolute -top-6 -left-6 w-16 h-16 text-orange-400 idea-quote-icon" />
                <blockquote
                  style={{ fontFamily: 'var(--font-heading)' }}
                  className="text-3xl leading-relaxed mb-8 text-white font-bold"
                >
                  People who are crazy enough to think they can change the world are the ones who do.
                  <footer className="text-lg text-neutral-400 mt-4 font-normal">— Steve Jobs</footer>
                </blockquote>
                <hr className="border-neutral-800 mb-6" />
                <div style={{ fontFamily: 'var(--font-heading)' }} className="space-y-5 text-neutral-300 text-lg leading-relaxed">
                  <p>Got an idea but don't know where to start?</p>
                  <div className="text-2xl text-white font-medium pt-6">
                    We help you build, refine, and launch it. Your idea stays yours.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:basis-3/5 w-full flex flex-col justify-center">

            {/* Mobile-only header */}
            <div className="lg:hidden text-center mb-8 px-2">
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Got an idea?</h2>
              <p className="text-neutral-400 text-sm">We help you build, refine, and launch it.</p>
            </div>

            {/* Desktop: original black box wrapper | Mobile: no box */}
            <div className="lg:bg-black lg:border lg:border-neutral-800 lg:p-12 p-2">
              <div className="lg:space-y-10 space-y-4">

                {/* Verify access before showing the idea fields */}
                <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-white">Verify your college email</h3>
                      <p className="text-sm text-neutral-400">AI Counsel is available after email verification.</p>
                    </div>
                    {authUser && (
                      <button type="button" onClick={handleLogout} disabled={authBusy} className="text-sm text-orange-300 hover:text-orange-200 disabled:opacity-50">
                        Log out
                      </button>
                    )}
                  </div>

                  {!authUser && !authLoading && (
                    <>
                      <input
                        type="email"
                        value={authEmail}
                        onChange={(event) => { setAuthEmail(event.target.value); setAuthError(''); }}
                        placeholder="your college email address"
                        disabled={authBusy || authStep === 'otp'}
                        className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-60"
                      />
                      {authStep === 'otp' && (
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={OTP_LENGTH}
                          value={authOtp}
                          onChange={(event) => { setAuthOtp(event.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH)); setAuthError(''); }}
                          placeholder="6-digit code"
                          disabled={authBusy}
                          className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-60"
                        />
                      )}
                      <div className="flex flex-wrap gap-3">
                        <button type="button" onClick={authStep === 'email' ? handleRequestOtp : handleVerifyOtp} disabled={authBusy || !authEmail || (authStep === 'otp' && authOtp.length !== OTP_LENGTH)} className="rounded-full bg-orange-400 px-5 py-3 font-bold text-black disabled:opacity-50">
                          {authBusy ? 'Please wait...' : authStep === 'email' ? 'Send code' : 'Verify code'}
                        </button>
                        {authStep === 'otp' && (
                          <button type="button" onClick={handleRequestOtp} disabled={authBusy || resendCooldown > 0} className="rounded-full border border-neutral-600 px-5 py-3 text-sm text-neutral-200 disabled:opacity-50">
                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                          </button>
                        )}
                      </div>
                    </>
                  )}

                  {authLoading && <p className="text-sm text-neutral-400">Checking your session...</p>}
                  {authUser && <p className="text-sm text-green-300">Verified: {authUser.email}</p>}
                  {authMessage && <p className="text-sm text-orange-200">{authMessage}</p>}
                  {authError && <p className="text-sm text-red-300">{authError}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:gap-8 gap-4">
                  <div className="lg:space-y-3">
                    {/* Desktop label */}
                    <label className="hidden lg:block text-sm font-bold text-white uppercase tracking-wider">
                      Full Name *
                    </label>
                    <input
                      type="text" name="name" value={formData.name}
                      onChange={handleInputChange}
                      className={`idea-input w-full
                        lg:bg-transparent lg:px-6 lg:py-4 lg:border lg:border-solid lg:rounded-none lg:placeholder-neutral-600 lg:focus:border-white
                        bg-neutral-900 px-5 py-4 border-none rounded-xl placeholder-neutral-500 focus:ring-2 focus:ring-orange-400
                        text-white focus:outline-none transition-all duration-200
                        ${errors.name ? 'lg:border-red-500 ring-2 ring-red-400' : 'lg:border-neutral-700'}`}
                      placeholder="Full Name *" disabled={isSubmitting || !authUser}
                    />
                    {errors.name && <p className="text-red-500 text-xs lg:text-sm mt-1 pl-2">{errors.name}</p>}
                  </div>
                  <div className="lg:space-y-3">
                    {/* Desktop label */}
                    <label className="hidden lg:block text-sm font-bold text-white uppercase tracking-wider">
                      Email Address *
                    </label>
                    <input
                      type="email" name="email" value={formData.email}
                      onChange={handleInputChange}
                      className={`idea-input w-full
                        lg:bg-transparent lg:px-6 lg:py-4 lg:border lg:border-solid lg:rounded-none lg:placeholder-neutral-600 lg:focus:border-white
                        bg-neutral-900 px-5 py-4 border-none rounded-xl placeholder-neutral-500 focus:ring-2 focus:ring-orange-400
                        text-white focus:outline-none transition-all duration-200
                        ${errors.email ? 'lg:border-red-500 ring-2 ring-red-400' : 'lg:border-neutral-700'}`}
                      placeholder="Email Address *" disabled={isSubmitting || !authUser}
                    />
                    {errors.email && <p className="text-red-500 text-xs lg:text-sm mt-1 pl-2">{errors.email}</p>}
                  </div>
                </div>

                <div className="lg:space-y-3">
                  {/* Desktop label */}
                  <label className="hidden lg:block text-sm font-bold text-white uppercase tracking-wider">
                    Your Startup Idea *
                  </label>
                  <div className="relative">
                    <textarea
                      name="idea" value={formData.idea} onChange={handleInputChange}
                      rows={6}
                      className={`idea-input w-full
                        lg:bg-transparent lg:px-6 lg:py-4 lg:border lg:border-solid lg:rounded-none lg:placeholder-neutral-600 lg:focus:border-white
                        bg-neutral-900 px-5 py-4 border-none rounded-xl placeholder-neutral-500 focus:ring-2 focus:ring-orange-400
                        text-white focus:outline-none transition-all duration-200 resize-none
                        ${errors.idea ? 'lg:border-red-500 ring-2 ring-red-400' : 'lg:border-neutral-700'}`}
                      placeholder="What problem are you solving? Who is it for? Minimum 50 characters"
                      disabled={isSubmitting || !authUser}
                    />
                    <div className={`absolute bottom-3 right-4 text-xs ${formData.idea.length > 5000 ? 'text-red-500' : 'text-neutral-500'}`}>
                      {formData.idea.length} / 5000 chars
                      {formData.idea.length < 50 && formData.idea.length > 0 && (
                        <span className="text-red-500 ml-1">({50 - formData.idea.length} more needed)</span>
                      )}
                    </div>
                  </div>
                  {errors.idea && <p className="text-red-500 text-xs lg:text-sm mt-1 pl-2">{errors.idea}</p>}
                </div>

                {/* Button: desktop = border outline style | mobile = filled pill style */}
                <button
                  onClick={handleSubmit} disabled={isSubmitting || !authUser}
                  className={`w-full font-bold uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center active:scale-[0.98] idea-submit-btn
                    lg:py-5 lg:px-8 lg:text-xl lg:border lg:border-white lg:bg-black lg:text-white lg:rounded-none lg:hover:bg-white/10 lg:shadow-none
                    py-4 px-8 text-base rounded-full bg-primary text-primary-foreground hover:opacity-90 shadow-lg`}
                >
                  {isSubmitting ? (
                    <><div className="animate-spin h-6 w-6 border-b-2 border-current mr-3 rounded-full"></div>Sending...</>
                  ) : (
                    <><Send className="w-5 h-5 mr-3" />Get Help Building This</>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleGetFeedback}
                  disabled={isGettingFeedback || isSubmitting || !authUser}
                  className="w-full py-4 px-8 rounded-full border border-orange-400 text-orange-300 hover:bg-orange-400/10 font-bold uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isGettingFeedback ? (
                    <><div className="animate-spin h-5 w-5 border-b-2 border-current mr-3 rounded-full"></div>Thinking...</>
                  ) : (
                    <>Get AI Feedback</>
                  )}
                </button>

                {aiError && (
                  <div className="rounded-xl border border-red-800 bg-red-950/30 p-4 text-red-300">
                    {aiError}
                  </div>
                )}

                {aiFeedback && (
                  <div className="rounded-xl border border-orange-400/40 bg-neutral-950 p-6 text-neutral-200 space-y-5">
                    <div>
                      <h3 className="text-lg font-bold text-orange-300 mb-2">Understanding of your idea</h3>
                      <p>{aiFeedback.understanding}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-orange-300 mb-2">Questions to explore</h3>
                      <ul className="list-disc pl-5 space-y-1">{aiFeedback.questions?.map((item: string, index: number) => <li key={`question-${index}`}>{item}</li>)}</ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-orange-300 mb-2">Constraints to investigate</h3>
                      <ul className="list-disc pl-5 space-y-1">{aiFeedback.constraints?.map((item: string, index: number) => <li key={`constraint-${index}`}>{item}</li>)}</ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-orange-300 mb-2">Research and validation tasks</h3>
                      <ul className="list-disc pl-5 space-y-1">{aiFeedback.researchTasks?.map((item: string, index: number) => <li key={`research-${index}`}>{item}</li>)}</ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-orange-300 mb-2">Suggested next step</h3>
                      <p>{aiFeedback.nextStep}</p>
                    </div>
                    <p className="text-xs text-neutral-500 border-t border-neutral-800 pt-4">{aiFeedback.disclaimer}</p>
                  </div>
                )}

                {statusInfo && (
                  <div className={`lg:border lg:p-6 rounded-xl lg:rounded-none p-4 ${statusInfo.type === 'success' ? 'lg:bg-green-950/30 lg:border-green-800 bg-green-50 border border-green-200' : 'lg:bg-red-950/30 lg:border-red-800 bg-red-50 border border-red-200'}`}>
                    <div className={`flex items-start ${statusInfo.type === 'success' ? 'lg:text-green-400 text-green-700' : 'lg:text-red-400 text-red-700'}`}>
                      <statusInfo.icon className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                      <span>{statusInfo.message}</span>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
