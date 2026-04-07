import { redirect } from "next/navigation";
import Link from "next/link";
import { getCustomerToken } from "~/lib/auth/cookies";
import { getMe } from "~/lib/auth/auth-api";
import ProfileClient from "./ProfileClient";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const token = await getCustomerToken();
  if (!token) redirect("/account");

  let customer;
  try {
    const data = await getMe(token);
    customer = data.customer;
  } catch {
    redirect("/account?expired=1");
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
        {/* Breadcrumb */}
        <div className="text-secondary-400 mb-6 flex items-center gap-2 text-xs">
          <Link
            href="/account/dashboard"
            className="hover:text-primary-500 mr-1 transition-colors"
            aria-label="Back to account"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <Link
            href="/account/dashboard"
            className="hover:text-primary-500 transition-colors"
          >
            Account
          </Link>
          <span>/</span>
          <span className="text-secondary-600">Profile</span>
        </div>

        {/* Header */}
        <div className="mb-2 flex items-center gap-3">
          <div className="bg-primary-500 h-px w-6" />
          <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
            Account
          </span>
        </div>
        <h1 className="font-display text-secondary-900 mb-8 text-3xl font-bold">
          Profile
        </h1>

        <ProfileClient customer={customer} />
      </div>
    </div>
  );
}
