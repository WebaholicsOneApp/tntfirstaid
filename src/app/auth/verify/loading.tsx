import { Spinner } from '~/components/ui/Spinner';

export default function VerifyLoading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Spinner className="w-8 h-8 text-primary-500" />
    </div>
  );
}
