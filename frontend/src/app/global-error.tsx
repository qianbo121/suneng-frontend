'use client';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

// Last-resort boundary for errors thrown in the root layout itself. Must render
// its own <html>/<body>. Kept dependency-free so it works even if the app shell
// is what failed.
export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="zh-CN">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          color: '#101828',
          textAlign: 'center',
          padding: '64px 24px',
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 600 }}>服务暂时不可用 · Service temporarily unavailable</h1>
        <p style={{ marginTop: 16, color: '#475467' }}>请稍后重试。· Please try again later.</p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            marginTop: 24,
            minHeight: 42,
            padding: '0 24px',
            borderRadius: 4,
            border: 'none',
            background: '#c51624',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          重试 · Retry
        </button>
      </body>
    </html>
  );
}
