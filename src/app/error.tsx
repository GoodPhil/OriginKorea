'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-red-500 mb-4">오류</h1>
        <h2 className="text-2xl font-semibold mb-4">
          문제가 발생했습니다 / Something went wrong
        </h2>
        <p className="text-muted-foreground mb-8">
          페이지를 로드하는 중 오류가 발생했습니다.
          <br />
          An error occurred while loading this page.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          다시 시도 / Try Again
        </button>
      </div>
    </div>
  );
}
