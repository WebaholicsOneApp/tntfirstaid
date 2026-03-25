'use client';

import { useState, useCallback, useRef } from 'react';
import { useAuth } from '~/lib/auth';
import { Spinner } from '~/components/ui/Spinner';
import { formatPhone } from '~/lib/utils';
import type { Customer } from '~/types/auth';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

const US_STATES = [
  { abbr: 'AL', name: 'Alabama' }, { abbr: 'AK', name: 'Alaska' }, { abbr: 'AZ', name: 'Arizona' },
  { abbr: 'AR', name: 'Arkansas' }, { abbr: 'CA', name: 'California' }, { abbr: 'CO', name: 'Colorado' },
  { abbr: 'CT', name: 'Connecticut' }, { abbr: 'DE', name: 'Delaware' }, { abbr: 'FL', name: 'Florida' },
  { abbr: 'GA', name: 'Georgia' }, { abbr: 'HI', name: 'Hawaii' }, { abbr: 'ID', name: 'Idaho' },
  { abbr: 'IL', name: 'Illinois' }, { abbr: 'IN', name: 'Indiana' }, { abbr: 'IA', name: 'Iowa' },
  { abbr: 'KS', name: 'Kansas' }, { abbr: 'KY', name: 'Kentucky' }, { abbr: 'LA', name: 'Louisiana' },
  { abbr: 'ME', name: 'Maine' }, { abbr: 'MD', name: 'Maryland' }, { abbr: 'MA', name: 'Massachusetts' },
  { abbr: 'MI', name: 'Michigan' }, { abbr: 'MN', name: 'Minnesota' }, { abbr: 'MS', name: 'Mississippi' },
  { abbr: 'MO', name: 'Missouri' }, { abbr: 'MT', name: 'Montana' }, { abbr: 'NE', name: 'Nebraska' },
  { abbr: 'NV', name: 'Nevada' }, { abbr: 'NH', name: 'New Hampshire' }, { abbr: 'NJ', name: 'New Jersey' },
  { abbr: 'NM', name: 'New Mexico' }, { abbr: 'NY', name: 'New York' }, { abbr: 'NC', name: 'North Carolina' },
  { abbr: 'ND', name: 'North Dakota' }, { abbr: 'OH', name: 'Ohio' }, { abbr: 'OK', name: 'Oklahoma' },
  { abbr: 'OR', name: 'Oregon' }, { abbr: 'PA', name: 'Pennsylvania' }, { abbr: 'RI', name: 'Rhode Island' },
  { abbr: 'SC', name: 'South Carolina' }, { abbr: 'SD', name: 'South Dakota' }, { abbr: 'TN', name: 'Tennessee' },
  { abbr: 'TX', name: 'Texas' }, { abbr: 'UT', name: 'Utah' }, { abbr: 'VT', name: 'Vermont' },
  { abbr: 'VA', name: 'Virginia' }, { abbr: 'WA', name: 'Washington' }, { abbr: 'WV', name: 'West Virginia' },
  { abbr: 'WI', name: 'Wisconsin' }, { abbr: 'WY', name: 'Wyoming' },
] as const;



interface ProfileClientProps {
  customer: Customer;
}

export default function ProfileClient({ customer: initialCustomer }: ProfileClientProps) {
  const { refreshUser } = useAuth();

  const [firstName, setFirstName] = useState(initialCustomer.firstName || '');
  const [lastName, setLastName] = useState(initialCustomer.lastName || '');
  const [phone, setPhone] = useState(() => formatPhone(initialCustomer.phone || ''));

  const [line1, setLine1] = useState(initialCustomer.defaultAddress?.line1 || '');
  const [line2, setLine2] = useState(initialCustomer.defaultAddress?.line2 || '');
  const [city, setCity] = useState(initialCustomer.defaultAddress?.city || '');
  const [state, setState] = useState(initialCustomer.defaultAddress?.state || '');
  const [postalCode, setPostalCode] = useState(initialCustomer.defaultAddress?.postalCode || '');

  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [zipLookupStatus, setZipLookupStatus] = useState<'idle' | 'loading' | 'found' | 'not-found'>('idle');
  const zipAbortRef = useRef<AbortController | null>(null);

  const lookupZip = useCallback(async (zip: string) => {
    // Cancel any in-flight lookup
    zipAbortRef.current?.abort();

    if (zip.length !== 5 || !/^\d{5}$/.test(zip)) {
      setZipLookupStatus('idle');
      return;
    }

    setZipLookupStatus('loading');
    const controller = new AbortController();
    zipAbortRef.current = controller;

    try {
      const res = await fetch(`https://api.zippopotam.us/us/${zip}`, {
        signal: controller.signal,
      });
      if (!res.ok) {
        setZipLookupStatus('not-found');
        return;
      }
      const data = (await res.json()) as {
        places?: Array<{ 'place name': string; 'state abbreviation': string }>;
      };
      const place = data.places?.[0];
      if (place) {
        setCity(place['place name']);
        setState(place['state abbreviation']);
        setZipLookupStatus('found');
      } else {
        setZipLookupStatus('not-found');
      }
    } catch {
      if (!controller.signal.aborted) {
        setZipLookupStatus('idle');
      }
    }
  }, []);

  const handleZipChange = (value: string) => {
    // Only allow digits, max 5
    const cleaned = value.replace(/\D/g, '').slice(0, 5);
    setPostalCode(cleaned);
    if (cleaned.length === 5) {
      lookupZip(cleaned);
    } else {
      setZipLookupStatus('idle');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    setErrorMessage('');

    try {
      const payload: Record<string, unknown> = { firstName, lastName, phone };
      if (line1.trim()) {
        payload.defaultAddress = { line1, line2, city, state, postalCode };
      }

      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? 'Failed to update profile. Please try again.');
      }

      setFormState('success');
      await refreshUser();
    } catch (err) {
      setFormState('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to update profile. Please try again.',
      );
    }
  };

  if (formState === 'success') {
    return (
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-secondary-100">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-secondary-900">Profile updated successfully</p>
            <p className="text-xs text-secondary-400 mt-0.5">Your changes have been saved.</p>
          </div>
        </div>
        <button
          onClick={() => setFormState('idle')}
          className="mt-6 text-sm text-primary-500 hover:text-primary-400 transition-colors font-medium"
        >
          Edit profile again
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Card 1 — Personal Information */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-secondary-100">
        <h2 className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-secondary-400 mb-1">
          Personal Information
        </h2>
        <p className="text-lg font-display font-semibold text-secondary-900 mb-6">
          Your details
        </p>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="first-name"
                className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-secondary-400 block"
              >
                First Name
              </label>
              <input
                id="first-name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                placeholder="John"
                className="w-full border border-secondary-200 rounded-lg px-4 py-3 text-sm text-secondary-900 bg-white placeholder:text-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="last-name"
                className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-secondary-400 block"
              >
                Last Name
              </label>
              <input
                id="last-name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                placeholder="Doe"
                className="w-full border border-secondary-200 rounded-lg px-4 py-3 text-sm text-secondary-900 bg-white placeholder:text-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="phone"
              className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-secondary-400 block"
            >
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              autoComplete="tel"
              placeholder="(555) 123-4567"
              className="w-full border border-secondary-200 rounded-lg px-4 py-3 text-sm text-secondary-900 bg-white placeholder:text-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Card 2 — Default Shipping Address */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-secondary-100">
        <h2 className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-secondary-400 mb-1">
          Shipping Address
        </h2>
        <p className="text-lg font-display font-semibold text-secondary-900 mb-6">
          Used to pre-fill checkout
        </p>

        <div className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="address-line1"
              className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-secondary-400 block"
            >
              Address Line 1
            </label>
            <input
              id="address-line1"
              type="text"
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              autoComplete="address-line1"
              placeholder="123 Main St"
              className="w-full border border-secondary-200 rounded-lg px-4 py-3 text-sm text-secondary-900 bg-white placeholder:text-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="address-line2"
              className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-secondary-400 block"
            >
              Line 2 (Optional)
            </label>
            <input
              id="address-line2"
              type="text"
              value={line2}
              onChange={(e) => setLine2(e.target.value)}
              autoComplete="address-line2"
              placeholder="Apt, Suite, Unit"
              className="w-full border border-secondary-200 rounded-lg px-4 py-3 text-sm text-secondary-900 bg-white placeholder:text-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-200"
            />
          </div>

          {/* ZIP first — triggers city/state auto-fill */}
          <div className="space-y-2">
            <label
              htmlFor="postal-code"
              className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-secondary-400 block"
            >
              ZIP Code
            </label>
            <div className="relative">
              <input
                id="postal-code"
                type="text"
                inputMode="numeric"
                value={postalCode}
                onChange={(e) => handleZipChange(e.target.value)}
                autoComplete="postal-code"
                placeholder="10001"
                maxLength={5}
                className="w-full border border-secondary-200 rounded-lg px-4 py-3 text-sm text-secondary-900 bg-white placeholder:text-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-200"
              />
              {zipLookupStatus === 'loading' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Spinner className="w-4 h-4 text-secondary-300" />
                </div>
              )}
              {zipLookupStatus === 'found' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            {zipLookupStatus === 'found' && city && state && (
              <p className="text-xs text-green-600 mt-1">
                Found: {city}, {state}
              </p>
            )}
            {zipLookupStatus === 'not-found' && (
              <p className="text-xs text-amber-600 mt-1">
                ZIP code not recognized. Please enter city and state manually.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="city"
                className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-secondary-400 block"
              >
                City
              </label>
              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                autoComplete="address-level2"
                placeholder="New York"
                className="w-full border border-secondary-200 rounded-lg px-4 py-3 text-sm text-secondary-900 bg-white placeholder:text-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="state"
                className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-secondary-400 block"
              >
                State
              </label>
              <select
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                autoComplete="address-level1"
                className="w-full border border-secondary-200 rounded-lg px-4 py-3 text-sm text-secondary-900 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-200 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_1rem_center]"
              >
                <option value="">Select state</option>
                {US_STATES.map((s) => (
                  <option key={s.abbr} value={s.abbr}>
                    {s.abbr} — {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {formState === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={formState === 'submitting'}
        className="w-full py-3 rounded-full bg-primary-500 text-[0.7rem] font-mono tracking-[0.15em] text-secondary-950 uppercase hover:bg-primary-400 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {formState === 'submitting' ? (
          <>
            <Spinner />
            Saving...
          </>
        ) : (
          'Save Changes'
        )}
      </button>
    </form>
  );
}
