import { Suspense } from "react";
import VerifyClient from "./VerifyClient";
import { Spinner } from "~/components/ui/Spinner";

export const metadata = { title: "Verify Sign-In" };

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white px-4 py-16">
          <Spinner className="text-primary-500 h-8 w-8" />
        </div>
      }
    >
      <VerifyClient />
    </Suspense>
  );
}
