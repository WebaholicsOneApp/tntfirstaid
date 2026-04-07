import { Spinner } from "~/components/ui/Spinner";

export default function VerifyLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <Spinner className="text-primary-500 h-8 w-8" />
    </div>
  );
}
