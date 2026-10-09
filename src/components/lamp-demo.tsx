"use client";
import React, { useState } from "react";
import { motion } from "motion/react";
import { LampContainer } from "@/components/ui/lamp";
import { Send, CheckCircle, AlertCircle, Quote } from 'lucide-react';

export function IdeaSectionHeader() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    idea: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (submitStatus) setSubmitStatus('');
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
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/submit-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
                      placeholder="Full Name *" disabled={isSubmitting}
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
                      placeholder="Email Address *" disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                  onClick={handleSubmit} disabled={isSubmitting}
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
