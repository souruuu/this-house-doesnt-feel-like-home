import { resolveAssetUrl } from '../../assets/manifest';
import { DemoControl, type DemoInputGuard } from '../DemoControl';
import type { DemoPanel } from './demoPreferences';

// Stable entry IDs stay English (tests/focus restore); labels are Thai (D-3).
const entries = [
  ['Start', 'เริ่มเกม'],
  ['Load', 'โหลดเกม'],
  ['Options', 'ตั้งค่า'],
  ['Gallery', 'แกลเลอรี'],
  ['About', 'เกี่ยวกับ'],
] as const;

// D-2: only som + manao, decorative, unnamed. Original cutouts, never edited.
const menuCharacters = [
  ['som', 'demo.character.som'],
  ['manao', 'demo.character.manao'],
] as const;

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
      <div className="vn-menu-characters" aria-hidden="true">
        {menuCharacters.map(([slot, id]) => (
          <img
            key={slot}
            className="vn-menu-character"
            data-menu-character={slot}
            src={resolveAssetUrl(id)}
            alt=""
            draggable={false}
          />
        ))}
      </div>
      <h1>หลังเคาน์เตอร์</h1>
      <nav className="vn-menu-nav" aria-label="เมนูหลัก">
        {entries.map(([entry, label]) => (
          <DemoControl
            key={entry}
            className="vn-nav-item vn-bevel"
            data-menu-entry={entry}
            data-unavailable={entry === 'Load' ? 'true' : undefined}
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
            <span>{label}</span>
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
