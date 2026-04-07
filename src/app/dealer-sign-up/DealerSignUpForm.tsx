"use client";

import { useState } from "react";

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

type FormStatus = "idle" | "submitting" | "success" | "error";

const SELL_OPTIONS = [
  { value: "Online Store", label: "Online Store" },
  { value: "Brick & Mortar", label: "Brick & Mortar" },
  { value: "Gun Builder", label: "Gun Builder" },
  { value: "Other", label: "Other" },
];

export default function DealerSignUpForm() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    confirmEmail: "",
    companyName: "",
    sellType: "",
    sellTypeOther: "",
    comments: "",
  });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set());

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors.size)
      setFieldErrors((prev) => {
        const n = new Set(prev);
        n.delete(name);
        return n;
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const errors = new Set<string>();
    if (!formData.firstName.trim()) errors.add("firstName");
    if (!formData.lastName.trim()) errors.add("lastName");
    if (
      !formData.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    )
      errors.add("email");
    if (formData.email.trim() !== formData.confirmEmail.trim())
      errors.add("confirmEmail");
    if (!formData.companyName.trim()) errors.add("companyName");
    if (!formData.sellType) errors.add("sellType");
    if (formData.sellType === "Other" && !formData.sellTypeOther.trim())
      errors.add("sellTypeOther");
    if (errors.size > 0) {
      setFieldErrors(errors);
      setStatus("error");
      setErrorMessage("Please fill in all required fields.");
      return;
    }
    setFieldErrors(new Set());

    const sellDescription =
      formData.sellType === "Other"
        ? formData.sellTypeOther.trim()
        : formData.sellType;

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          email: formData.email.trim(),
          subject: "Dealer Sign Up",
          message: `Company: ${formData.companyName.trim()}\nWhere they sell: ${sellDescription}\n\n${formData.comments.trim() || "(No additional comments)"}`,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to submit form.");
      }

      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to submit form.",
      );
    }
  };

  if (status === "success") {
    return (
      <div className="border-secondary-100 rounded-2xl border bg-white p-8 shadow-xl md:p-12">
        <div className="py-8 text-center">
          <div className="bg-primary-500/10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
            <svg
              className="text-primary-600 h-8 w-8"
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
          <h3 className="font-display text-secondary-800 mb-4 text-2xl font-bold">
            Application Submitted
          </h3>
          <p className="text-secondary-600 mb-8">
            Thank you for your interest. A representative will reach out to you
            within 24-48 hours.
          </p>
          <button
            onClick={() => {
              setStatus("idle");
              setFieldErrors(new Set());
              setFormData({
                firstName: "",
                lastName: "",
                email: "",
                confirmEmail: "",
                companyName: "",
                sellType: "",
                sellTypeOther: "",
                comments: "",
              });
            }}
            className="border-primary-500/40 text-primary-500 hover:border-primary-500 hover:text-primary-400 rounded-full border px-8 py-3 font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-all duration-300 active:scale-[0.98]"
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  const inputClass = (field: string) =>
    `w-full px-5 py-4 bg-secondary-50 border ${fieldErrors.has(field) ? "border-red-400" : "border-secondary-100"} rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors text-sm`;
  const labelClass =
    "text-[10px] font-bold text-secondary-400 uppercase tracking-widest ml-1";

  return (
    <div className="border-secondary-100 relative overflow-hidden rounded-2xl border bg-white p-8 shadow-xl md:p-12">
      {status === "error" && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-600">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Row */}
        <div className="grid gap-4 sm:grid-cols-2">
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
              className={inputClass("firstName")}
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
              className={inputClass("lastName")}
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
            className={inputClass("email")}
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
            className={inputClass("confirmEmail")}
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
            className={inputClass("companyName")}
            placeholder="Acme Firearms LLC"
          />
        </div>

        {/* Where do you sell? */}
        <div className="space-y-3">
          <label className={labelClass}>
            Where do you sell? <span className="text-red-500">*</span>
          </label>
          <div
            className={`space-y-2 ${fieldErrors.has("sellType") ? "rounded-lg p-2 ring-1 ring-red-400" : ""}`}
          >
            {SELL_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="group flex cursor-pointer items-center gap-3"
              >
                <input
                  type="radio"
                  name="sellType"
                  value={opt.value}
                  checked={formData.sellType === opt.value}
                  onChange={handleChange}
                  className="text-primary-500 border-secondary-300 focus:ring-primary-500 h-4 w-4"
                />
                <span className="text-secondary-700 group-hover:text-secondary-900 text-sm">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>

          {/* Conditional "Other" text field */}
          {formData.sellType === "Other" && (
            <input
              type="text"
              name="sellTypeOther"
              value={formData.sellTypeOther}
              onChange={handleChange}
              className={inputClass("sellTypeOther")}
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
            className={`${inputClass("comments")} resize-none`}
            placeholder="Any additional information..."
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="bg-primary-500 text-secondary-950 hover:bg-primary-400 shadow-primary-500/20 w-full rounded-full py-3.5 font-mono text-[0.7rem] tracking-[0.15em] uppercase shadow-lg transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "submitting" ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="h-5 w-5 animate-spin"
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
            "Submit Application"
          )}
        </button>
      </form>
    </div>
  );
}
