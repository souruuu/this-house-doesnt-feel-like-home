import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/Button';
import { Panel } from '../ui/Panel';
import { WorldHost } from '../world/WorldHost';
import { fitViewport } from './viewport';
import { useShellStore } from './shellStore';

export function App() {
  const shellRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState(() =>
    fitViewport(window.innerWidth, window.innerHeight),
  );
  const [portrait, setPortrait] = useState(false);
  const [hidden, setHidden] = useState(document.hidden);
  const [mounted, setMounted] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenMessage, setFullscreenMessage] = useState('');
  const userPaused = useShellStore((state) => state.userPaused);
  const togglePause = useShellStore((state) => state.togglePause);
  const paused = userPaused || portrait || hidden;

  useEffect(() => {
    const query = window.matchMedia(
      '(orientation: portrait) and (any-pointer: coarse)',
    );
    const measure = () => {
      const rect = shellRef.current!.getBoundingClientRect();
      setBounds(fitViewport(rect.width, rect.height));
      setPortrait(query.matches);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(shellRef.current!);
    query.addEventListener('change', measure);
    measure();
    return () => {
      observer.disconnect();
      query.removeEventListener('change', measure);
    };
  }, []);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    const onFullscreen = () =>
      setFullscreen(document.fullscreenElement === shellRef.current);
    const onKey = (event: KeyboardEvent) => {
      if (
        event.key !== 'Escape' ||
        event.repeat ||
        event.defaultPrevented ||
        portrait
      )
        return;
      if (
        (event.target as HTMLElement)?.closest(
          'button, input, select, textarea, [role="dialog"]',
        )
      )
        return;
      event.preventDefault();
      togglePause();
    };
    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('fullscreenchange', onFullscreen);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('fullscreenchange', onFullscreen);
      window.removeEventListener('keydown', onKey);
    };
  }, [portrait, togglePause]);

  async function toggleFullscreen() {
    setFullscreenMessage('');
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (shellRef.current?.requestFullscreen)
        await shellRef.current.requestFullscreen();
      else
        setFullscreenMessage(
          'อุปกรณ์นี้ไม่รองรับการแสดงเต็มจอ ใช้งานในหน้าต่างต่อได้',
        );
    } catch {
      setFullscreenMessage('ไม่สามารถแสดงเต็มจอได้ ใช้งานในหน้าต่างต่อได้');
    }
  }

  return (
    <div className="game-shell" ref={shellRef} data-paused={paused}>
      <div
        className="viewport-frame"
        style={{ width: bounds.width, height: bounds.height }}
      >
        <div
          className="logical-stage"
          style={{ transform: `scale(${bounds.scale})` }}
        >
          {mounted ? <WorldHost paused={paused} /> : null}
          <div className="ui-overlay" inert={portrait}>
            <Panel title="บ้านที่ไม่รู้สึกเหมือนบ้าน">
              <p>โครงทดสอบระบบ — ภาพและตำแหน่งทั้งหมดเป็นตัวแทนชั่วคราว</p>
              <p>ยังไม่มีเนื้อเรื่องหรือภาพฉบับเผยแพร่</p>
              <div className="ui-actions">
                <Button onClick={togglePause}>
                  {userPaused ? 'เล่นต่อ' : 'พัก'}
                </Button>
                <Button onClick={() => void toggleFullscreen()}>
                  {fullscreen ? 'ออกจากเต็มจอ' : 'เต็มจอ'}
                </Button>
                <Button onClick={() => setMounted((value) => !value)}>
                  {mounted ? 'ปิดฉากทดสอบ' : 'เปิดฉากทดสอบ'}
                </Button>
              </div>
              <p role="status">
                {paused ? 'พักการแสดงผล' : 'พร้อมทดสอบ'}
                {fullscreenMessage ? ` · ${fullscreenMessage}` : ''}
              </p>
            </Panel>
          </div>
        </div>
      </div>
      {portrait ? (
        <div className="rotate-prompt" role="alert">
          <p>กรุณาหมุนอุปกรณ์เป็นแนวนอนเพื่อเล่น</p>
          <p>พักการแสดงผลไว้แล้ว</p>
        </div>
      ) : null}
    </div>
  );
}
