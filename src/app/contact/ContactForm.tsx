'use client';

import { useState } from 'react';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const SUBJECT_OPTIONS = [
  { value: '', label: 'Select a subject...' },
  { value: 'General', label: 'General Inquiry' },
  { value: 'Order Support', label: 'Order Support' },
  { value: 'Wholesale', label: 'Wholesale / Dealer Pricing' },
  { value: 'Other', label: 'Other' },
];

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set());

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors.size) setFieldErrors(prev => { const n = new Set(prev); n.delete(name); return n; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    // Client-side validation
    const errors = new Set<string>();
    if (!formData.name.trim()) errors.add('name');
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.add('email');
    if (!formData.message.trim()) errors.add('message');
    if (errors.size > 0) {
      setFieldErrors(errors);
      setStatus('error');
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    setFieldErrors(new Set());

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject || 'General',
          message: formData.message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send message.');
      }

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to send message.',
      );
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-white p-8 md:p-12 shadow-xl border border-secondary-100">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-display font-bold text-secondary-800 mb-4">
            Message Sent
          </h3>
          <p className="text-secondary-600 mb-8">
            Thank you for reaching out. We will get back to you as soon as
            possible.
          </p>
          <button
            onClick={() => { setStatus('idle'); setFieldErrors(new Set()); }}
            className="rounded-full border border-primary-500/40 px-8 py-3 text-[0.7rem] font-mono tracking-[0.15em] text-primary-500 uppercase hover:border-primary-500 hover:text-primary-400 active:scale-[0.98] transition-all duration-300"
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 md:p-12 shadow-xl border border-secondary-100 relative overflow-hidden">
      <h2 className="text-2xl font-display font-bold text-secondary-800 mb-8">
        Send a Message
      </h2>

      {status === 'error' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-sm font-medium">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest ml-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className={`w-full px-5 py-4 bg-secondary-50 border ${fieldErrors.has('name') ? 'border-red-400' : 'border-secondary-100'} rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors text-sm`}
            placeholder="John Doe"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest ml-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={`w-full px-5 py-4 bg-secondary-50 border ${fieldErrors.has('email') ? 'border-red-400' : 'border-secondary-100'} rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors text-sm`}
            placeholder="john@example.com"
          />
        </div>

        {/* Subject Dropdown */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest ml-1">
            Subject
          </label>
          <select
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-5 py-4 bg-secondary-50 border border-secondary-100 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors text-sm appearance-none"
          >
            {SUBJECT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest ml-1">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={5}
            className={`w-full px-5 py-4 bg-secondary-50 border ${fieldErrors.has('message') ? 'border-red-400' : 'border-secondary-100'} rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors text-sm resize-none`}
            placeholder="How can we help you?"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full py-3.5 rounded-full bg-primary-500 text-[0.7rem] font-mono tracking-[0.15em] text-secondary-950 uppercase hover:bg-primary-400 active:scale-[0.98] transition-all duration-300 shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'submitting' ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Sending...
            </span>
          ) : (
            'Send Message'
          )}
        </button>
      </form>
    </div>
  );
}
