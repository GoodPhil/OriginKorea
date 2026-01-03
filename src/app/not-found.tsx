import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold gradient-text mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">
          페이지를 찾을 수 없습니다 / Page Not Found
        </h2>
        <p className="text-muted-foreground mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
          <br />
          The page you requested does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          홈으로 돌아가기 / Go Home
        </Link>
      </div>
    </div>
  );
}
