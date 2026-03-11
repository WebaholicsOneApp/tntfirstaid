'use client';

import { useState } from 'react';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  confirmEmail: string;
  companyName: string;
  sellType: string;
  sellTypeOther: string;
  comments: string;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const SELL_OPTIONS = [
  { value: 'Online Store', label: 'Online Store' },
  { value: 'Brick & Mortar', label: 'Brick & Mortar' },
  { value: 'Gun Builder', label: 'Gun Builder' },
  { value: 'Other', label: 'Other' },
];

export default function DealerSignUpForm() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    confirmEmail: '',
    companyName: '',
    sellType: '',
    sellTypeOther: '',
    comments: '',
  });
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setStatus('error');
      setErrorMessage('First and last name are required.');
      return;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setStatus('error');
      setErrorMessage('A valid email address is required.');
      return;
    }
    if (formData.email.trim() !== formData.confirmEmail.trim()) {
      setStatus('error');
      setErrorMessage('Email addresses do not match.');
      return;
    }
    if (!formData.companyName.trim()) {
      setStatus('error');
      setErrorMessage('Company name is required.');
      return;
    }
    if (!formData.sellType) {
      setStatus('error');
      setErrorMessage('Please select where you sell.');
      return;
    }
    if (formData.sellType === 'Other' && !formData.sellTypeOther.trim()) {
      setStatus('error');
      setErrorMessage('Please specify where you sell.');
      return;
    }

    const sellDescription =
      formData.sellType === 'Other'
        ? formData.sellTypeOther.trim()
        : formData.sellType;

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          email: formData.email.trim(),
          subject: 'Dealer Sign Up',
          message: `Company: ${formData.companyName.trim()}\nWhere they sell: ${sellDescription}\n\n${formData.comments.trim() || '(No additional comments)'}`,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit form.');
      }

      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to submit form.',
      );
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-secondary-100">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-green-600"
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
            Application Submitted
          </h3>
          <p className="text-gray-600 mb-8">
            Thank you for your interest. A representative will reach out to you
            within 24-48 hours.
          </p>
          <button
            onClick={() => {
              setStatus('idle');
              setFormData({
                firstName: '',
                lastName: '',
                email: '',
                confirmEmail: '',
                companyName: '',
                sellType: '',
                sellTypeOther: '',
                comments: '',
              });
            }}
            className="px-8 py-3 bg-secondary-800 text-white font-bold rounded-xl hover:bg-primary-500 hover:text-secondary-900 transition-colors text-sm uppercase tracking-widest"
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  const inputClass =
    'w-full px-5 py-4 bg-secondary-50 border border-secondary-100 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors text-sm';
  const labelClass =
    'text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1';

  return (
    <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-secondary-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-2xl -mr-16 -mt-16" />

      {status === 'error' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-sm font-medium">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Row */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={labelClass}>
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="John"
            />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="Doe"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className={labelClass}>
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="john@company.com"
          />
        </div>

        {/* Confirm Email */}
        <div className="space-y-2">
          <label className={labelClass}>
            Confirm Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="confirmEmail"
            value={formData.confirmEmail}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="john@company.com"
          />
        </div>

        {/* Company Name */}
        <div className="space-y-2">
          <label className={labelClass}>
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="Acme Firearms LLC"
          />
        </div>

        {/* Where do you sell? */}
        <div className="space-y-3">
          <label className={labelClass}>
            Where do you sell? <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {SELL_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="sellType"
                  value={opt.value}
                  checked={formData.sellType === opt.value}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-500 border-secondary-300 focus:ring-primary-500"
                />
                <span className="text-sm text-secondary-700 group-hover:text-secondary-900">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>

          {/* Conditional "Other" text field */}
          {formData.sellType === 'Other' && (
            <input
              type="text"
              name="sellTypeOther"
              value={formData.sellTypeOther}
              onChange={handleChange}
              className={inputClass}
              placeholder="Please specify..."
            />
          )}
        </div>

        {/* Comments */}
        <div className="space-y-2">
          <label className={labelClass}>Comments</label>
          <textarea
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            rows={4}
            className={`${inputClass} resize-none`}
            placeholder="Any additional information..."
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full py-4 bg-primary-500 text-secondary-900 font-bold rounded-xl hover:bg-primary-400 transition-all text-sm uppercase tracking-widest shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
              Submitting...
            </span>
          ) : (
            'Submit Application'
          )}
        </button>
      </form>
    </div>
  );
}
