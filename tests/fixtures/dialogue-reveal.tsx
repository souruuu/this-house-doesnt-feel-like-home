import '../../src/ui/tokens.css';
import '../../src/ui/styles.css';
import { DialoguePanel } from '../../src/ui/demo/DialoguePanel';
import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useDemoPlayback } from '../../src/ui/demo/useDemoPlayback';
import { useDialogueReveal } from '../../src/ui/useDialogueReveal';
import { createDemoSession } from '../../src/narrative/demoSession';

// Dev-server test entry only; never imported by the production application.
const session = createDemoSession();
session.controller.start();
const initialView = session.controller.getSnapshot();
const initialState = session.store.getState();
const pending = new Set<number>();
const request = window.requestAnimationFrame.bind(window);
const cancel = window.cancelAnimationFrame.bind(window);
window.requestAnimationFrame = (callback) => {
  const id = request((time) => {
    pending.delete(id);
    callback(time);
  });
  pending.add(id);
  return id;
};
window.cancelAnimationFrame = (id) => {
  pending.delete(id);
  cancel(id);
};

function Reveal() {
  const reveal = useDialogueReveal({
    key: `${initialView.sessionId}/${initialView.line!.id}`,
    text: initialView.line!.text,
    instant: false,
    reducedMotion: false,
    paused: false,
    active: true,
  });
  return <p data-revealing={reveal.revealing}>{reveal.text}</p>;
}
function AutoHarness() {
  const auto = useDemoPlayback({
    controller: session.controller,
    view: initialView,
    blocked: false,
    revealing: false,
    delaySeconds: 1,
  });
  return <button onClick={auto.enable}>Arm test Auto</button>;
}
function Harness() {
  const [mounted, setMounted] = useState(true);
  const [result, setResult] = useState('');
  const [errorPreview, setErrorPreview] = useState(false);
  const choices = useRef<HTMLDivElement>(null);
  return (
    <>
      <button onClick={() => setMounted(!mounted)}>Toggle mount</button>
      <button
        onClick={() =>
          setResult(
            JSON.stringify({
              pending: pending.size,
              sameView: session.controller.getSnapshot() === initialView,
              sameState: session.store.getState() === initialState,
            }),
          )
        }
      >
        Inspect
      </button>
      <output>{result}</output>
      <button onClick={() => setErrorPreview(!errorPreview)}>
        Error presentation preview
      </button>
      {errorPreview ? (
        <div
          className="demo-shell"
          data-error-preview
          style={{ position: 'relative', width: 1920, height: 1080 }}
        >
          <div
            className="demo-overlay"
            style={
              {
                '--vn-dialogue-left': '318px',
                '--vn-dialogue-width': '1284px',
                '--vn-dialogue-height': '235px',
                '--demo-small-size': '28px',
                '--vn-body-size': '34px',
              } as React.CSSProperties
            }
          >
            <DialoguePanel
              view={{ ...initialView, phase: 'error' }}
              speaker=""
              text=""
              lineKey="error-preview"
              revealing={false}
              paused={false}
              guard={{
                token: 'preview',
                getToken: () => 'preview',
                isAllowed: () => true,
              }}
              choicesRef={choices}
              autoEnabled={false}
              autoExecution="off"
              onAuto={() => {}}
              onContinue={() => {}}
              onChoose={() => {}}
              onHome={() => setErrorPreview(false)}
              returnLabel="กลับหน้าหลัก"
            />
          </div>
        </div>
      ) : null}
      {mounted ? (
        <>
          <Reveal />
          <AutoHarness />
        </>
      ) : null}
    </>
  );
}
// StrictMode replays effects in development; a true unmount must also cancel RAF.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Harness />
  </StrictMode>,
);
