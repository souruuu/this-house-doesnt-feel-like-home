import { DemoControl, type DemoInputGuard } from '../DemoControl';
import type { DemoPanel } from './demoPreferences';

const entries = ['Start', 'Load', 'Options', 'Gallery', 'About'] as const;

export function MainMenu({
  guard,
  onStart,
  onOpen,
  activePanel,
}: {
  guard: DemoInputGuard;
  onStart: () => void;
  onOpen: (panel: DemoPanel) => void;
  activePanel: DemoPanel | null;
}) {
  return (
    <section className="vn-main-menu" aria-label="หน้าหลัก">
      <div className="vn-menu-atmosphere" aria-hidden="true" />
      <div className="vn-menu-art-frame" aria-hidden="true" />
      <div
        className="vn-menu-character-slot"
        data-menu-character-slot="awaiting-approved-art"
        aria-hidden="true"
      />
      <h1>หลังเคาน์เตอร์</h1>
      <nav className="vn-menu-nav" aria-label="เมนูหลัก">
        {entries.map((entry) => (
          <DemoControl
            key={entry}
            className="vn-nav-item"
            data-menu-entry={entry}
            aria-current={
              entry.toLowerCase() === activePanel ? 'page' : undefined
            }
            autoFocus={entry === 'Start'}
            aria-describedby={
              entry === 'Load' ? 'demo-load-availability' : undefined
            }
            {...guard}
            onActivate={() => {
              if (entry === 'Start') onStart();
              else if (entry === 'Load') onOpen('load');
              else if (entry === 'Options') onOpen('options');
              else if (entry === 'Gallery') onOpen('gallery');
              else onOpen('about');
            }}
          >
            <span className="vn-nav-marker" aria-hidden="true" />
            <span>{entry}</span>
            {entry === 'Load' ? (
              <span className="vn-availability" aria-hidden="true">
                (ยังไม่พร้อม)
              </span>
            ) : null}
          </DemoControl>
        ))}
      </nav>
      <p className="vn-menu-note" id="demo-load-availability">
        เดโมนี้ยังไม่บันทึกความคืบหน้า
        <br />
        การรีเฟรชหรือปิดหน้าจะเริ่มเล่นใหม่
      </p>
    </section>
  );
}
