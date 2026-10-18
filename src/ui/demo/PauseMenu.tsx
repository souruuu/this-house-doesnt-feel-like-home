import type { KeyboardEvent, Ref } from 'react';
import { DemoControl, type DemoInputGuard } from '../DemoControl';

// Presentation only: pause/Auto/focus ownership stays in DemoApp (Phase 1).
export function PauseMenu({
  pauseRef,
  guard,
  reducedMotion,
  onKeyDown,
  onResume,
  onOptions,
  onHome,
}: {
  pauseRef: Ref<HTMLDivElement>;
  guard: DemoInputGuard;
  reducedMotion: boolean;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  onResume: () => void;
  onOptions: () => void;
  onHome: () => void;
}) {
  return (
    <div className="demo-pause-backdrop">
      <div
        className="demo-pause vn-paper-sign"
        ref={pauseRef}
        role="dialog"
        aria-modal="true"
        aria-label="พักเกม"
        onKeyDown={onKeyDown}
      >
        <h2>พักเกม</h2>
        <hr className="vn-dashed-rule" />
        <DemoControl
          className="vn-pause-action vn-pause-resume"
          {...guard}
          onActivate={onResume}
        >
          <span className="vn-pause-icon" aria-hidden="true">
            ▶
          </span>
          เล่นต่อ
        </DemoControl>
        <DemoControl
          className="vn-pause-action vn-bevel"
          data-open-options
          {...guard}
          onActivate={onOptions}
        >
          ตั้งค่า
        </DemoControl>
        <p className="demo-setting-note">
          Auto หยุดเมื่อพักเกมและต้องเปิดใหม่หลังเล่นต่อ
          {reducedMotion
            ? ' · อุปกรณ์ตั้งค่าลดการเคลื่อนไหว จะแสดงข้อความทันที'
            : ''}
        </p>
        <div className="demo-pause-footer">
          <DemoControl
            className="vn-pause-action vn-pause-home vn-back-main"
            {...guard}
            onActivate={onHome}
          >
            กลับหน้าหลัก
          </DemoControl>
          <p>
            เดโมนี้ยังไม่บันทึกความคืบหน้า
            <br />
            กลับหน้าหลักแล้วรอบนี้จะหายไป
          </p>
        </div>
      </div>
    </div>
  );
}
