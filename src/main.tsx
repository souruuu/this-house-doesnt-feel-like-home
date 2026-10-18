import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { DemoApp } from './shell/DemoApp';
import './ui/tokens.css';
import './ui/styles.css';

const FixtureApp =
  import.meta.env.DEV && new URLSearchParams(location.search).has('fixture')
    ? lazy(() => import('./shell/App').then(({ App }) => ({ default: App })))
    : null;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {FixtureApp ? (
      <Suspense fallback={<p>กำลังโหลดชุดทดสอบ</p>}>
        <FixtureApp />
      </Suspense>
    ) : (
      <DemoApp />
    )}
  </StrictMode>,
);
