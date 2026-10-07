import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Quote, Clock } from 'lucide-react';

const ShareFailureStory = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    story: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [errors, setErrors] = useState({});
  const [rateLimitInfo, setRateLimitInfo] = useState(null);

  const quote = {
    text: "It's fine to celebrate success but it is more important to heed the lessons of failure.",
    author: "Bill Gates",
    title: "Microsoft Co-founder"
  };

  // Backend API URL - uses relative path, proxied by Vite in dev, same domain on Vercel
  const API_BASE_URL = '';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general status when user makes changes
    if (submitStatus) {
      setSubmitStatus('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Story validation
    if (!formData.story.trim()) {
      newErrors.story = 'Story is required';
    } else if (formData.story.trim().length < 50) {
      newErrors.story = 'Story must be at least 50 characters';
    } else if (formData.story.trim().length > 5000) {
      newErrors.story = 'Story must be less than 5000 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Reset previous states
    setSubmitStatus('');
    setRateLimitInfo(null);
    
    // Validate form
    if (!validateForm()) {
      setSubmitStatus('validation_error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/submit-story`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          story: formData.story.trim()
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setSubmitStatus('success');
        setFormData({ email: '', name: '', story: '' });
        setErrors({});
      } else {
        // Handle different types of errors
        if (response.status === 429) {
          // Rate limit exceeded
          setRateLimitInfo({
            message: result.error,
            retryAfter: result.retryAfter
          });
          setSubmitStatus('rate_limit');
        } else if (response.status === 400 && result.details) {
          // Validation errors from backend
          const backendErrors = {};
          result.details.forEach(error => {
            backendErrors[error.path || 'general'] = error.msg;
          });
          setErrors(backendErrors);
          setSubmitStatus('validation_error');
        } else {
          // General server error
          setSubmitStatus('error');
        }
      }
    } catch (error) {
      console.error('Network error:', error);
      setSubmitStatus('network_error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusMessage = () => {
    switch (submitStatus) {
      case 'success':
        return {
          type: 'success',
          icon: CheckCircle,
          message: 'Thank you for sharing your story! You should receive a confirmation email shortly. Your story will inspire others on their entrepreneurial journey.'
        };
      case 'rate_limit':
        return {
          type: 'error',
          icon: Clock,
          message: rateLimitInfo?.message || 'Too many submissions. Please try again later.',
          extra: rateLimitInfo?.retryAfter ? `You can try again in ${Math.ceil(rateLimitInfo.retryAfter / 60)} minutes.` : null
        };
      case 'validation_error':
        return {
          type: 'error',
          icon: AlertCircle,
          message: 'Please check the form and correct any errors before submitting.'
        };
      case 'network_error':
        return {
          type: 'error',
          icon: AlertCircle,
          message: 'Network error. Please check your connection and try again.'
        };
      case 'error':
      default:
        return {
          type: 'error',
          icon: AlertCircle,
          message: 'Something went wrong. Please try again later.'
        };
    }
  };

  const statusInfo = submitStatus ? getStatusMessage() : null;

  return (
    <div className="min-h-screen bg-white" id='failurestory' style={{ fontFamily: 'var(--font-subheading)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Header Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-6 py-3 border-2" style={{ borderColor: '#FD7722', backgroundColor: '#FFF5F0' }}>
            <Quote className="w-5 h-5 mr-2" style={{ color: '#FD7722' }} />
            <span style={{ color: '#FD7722', fontFamily: 'var(--font-heading)', fontWeight: '600' }}>Business Wisdom</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mt-8 mb-6 leading-tight">
           <span style={{ color: '#000000' }}>Share Your</span>  <span style={{ color: '#FD7722' }}>Failure</span> <span style={{ color: '#000000' }}>Story</span> 
          </h1>
          
          <p className="text-2xl md:text-3xl text-gray-600 max-w-4xl mx-auto leading-relaxed" style={{ fontFamily: 'var(--font-heading)' }}>
            Transform your setbacks into comebacks. Your story could be the inspiration someone needs to persevere.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">

          {/* Quote Section */}
          <div className="lg:basis-2/5 w-full">
            <div className="bg-gray-50 p-12 border-2 border-gray-200 lg:sticky lg:top-8">
              <div className="relative">
                <Quote className="absolute -top-6 -left-6 w-16 h-16 opacity-10" style={{ color: '#FD7722' }} />
                <blockquote className="text-3xl md:text-4xl lg:text-5xl leading-relaxed mb-10 text-gray-800 font-light">
                  {quote.text}
                </blockquote>
                <div className="space-y-3">
                  <cite className="text-2xl md:text-3xl font-bold block" style={{ color: '#FD7722', fontFamily: 'var(--font-heading)' }}>
                    {quote.author}
                  </cite>
                  <div className="text-lg text-gray-600 font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
                    {quote.title}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:basis-3/5 w-full">
            <div className="bg-white border-2 border-gray-200 p-12">
              <div className="space-y-10">

                {/* Name & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Name Input */}
                  <div className="space-y-3">
                    <label className="block text-lg font-bold text-gray-800 uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-6 py-4 border-2 text-gray-800 placeholder-gray-500 focus:outline-none transition-colors duration-200 ${
                        errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-orange-500'
                      }`}
                      placeholder="Enter your full name"
                      style={{ fontFamily: 'var(--font-heading)' }}
                      disabled={isSubmitting}
                    />
                    {errors.name && (
                      <p className="text-red-600 text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email Input */}
                  <div className="space-y-3">
                    <label className="block text-lg font-bold text-gray-800 uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-6 py-4 border-2 text-gray-800 placeholder-gray-500 focus:outline-none transition-colors duration-200 ${
                        errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-orange-500'
                      }`}
                      placeholder="your@email.com"
                      style={{ fontFamily: 'var(--font-heading)' }}
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <p className="text-red-600 text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Story Textarea */}
                <div className="space-y-3">
                  <label className="block text-lg font-bold text-gray-800 uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
                    Your Failure Story *
                  </label>
                  <div className="relative">
                    <textarea
                      name="story"
                      value={formData.story}
                      onChange={handleInputChange}
                      rows={10}
                      className={`w-full px-6 py-4 border-2 text-gray-800 placeholder-gray-500 focus:outline-none transition-colors duration-200 resize-none ${
                        errors.story ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-orange-500'
                      }`}
                      placeholder="Share your entrepreneurial journey... What challenge did you face? What lessons did you learn? How did this experience shape your business approach? (minimum 50 characters)"
                      style={{ fontFamily: 'var(--font-subheading)' }}
                      disabled={isSubmitting}
                    />
                    <div className={`absolute bottom-4 right-6 text-sm ${
                      formData.story.length > 5000 ? 'text-red-500' : 'text-gray-500'
                    }`} style={{ fontFamily: 'var(--font-heading)' }}>
                      {formData.story.length} / 5000 characters
                      {formData.story.length < 50 && formData.story.length > 0 && (
                        <span className="text-orange-500 ml-2">
                          ({50 - formData.story.length} more needed)
                        </span>
                      )}
                    </div>
                  </div>
                  {errors.story && (
                    <p className="text-red-600 text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
                      {errors.story}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-5 px-8 font-bold text-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center border-2"
                  style={{
                    backgroundColor: isSubmitting ? '#9CA3AF' : '#FD7722',
                    borderColor: isSubmitting ? '#9CA3AF' : '#FD7722',
                    color: 'white',
                    fontFamily: 'var(--font-heading)'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin h-6 w-6 border-b-2 border-white mr-3"></div>
                      Sharing Your Story...
                    </>
                  ) : (
                    <>
                      <Send className="w-6 h-6 mr-3" />
                      Share My Story
                    </>
                  )}
                </button>

                {/* Status Messages */}
                {statusInfo && (
                  <div className={`border-2 px-6 py-4 ${
                    statusInfo.type === 'success' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className={`flex items-start ${
                      statusInfo.type === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      <statusInfo.icon className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '16px' }}>
                          {statusInfo.message}
                        </span>
                        {statusInfo.extra && (
                          <p className="mt-2 text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
                            {statusInfo.extra}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Info */}
                <div className="text-sm text-gray-600 text-center" style={{ fontFamily: 'var(--font-heading)' }}>
                  <p>⏱️ Maximum 5 submissions per hour to prevent spam</p>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ShareFailureStory;
