import { useState } from 'react';
import { DemoControl, type DemoInputGuard } from '../DemoControl';
import { DemoScreen } from './DemoScreen';
import type { DemoPreferences } from './demoPreferences';

export function OptionsScreen({
  preferences,
  onChange,
  guard,
  onClose,
  fromPause,
  fullscreen,
  onDisplay,
  displayMessage,
  systemReduced,
}: {
  preferences: DemoPreferences;
  onChange: (next: DemoPreferences) => void;
  guard: DemoInputGuard;
  onClose: () => void;
  fromPause: boolean;
  fullscreen: boolean;
  onDisplay: (mode: 'windowed' | 'fullscreen') => void;
  displayMessage: string;
  systemReduced: boolean;
}) {
  const [section, setSection] = useState('reading');
  return (
    <DemoScreen label="ตั้งค่า" className="vn-options-screen" onClose={onClose}>
      <header className="vn-screen-header">
        <h2>ตั้งค่า</h2>
        <p>ปรับจังหวะการอ่านและการแสดงผล</p>
      </header>
      <div className="vn-options-layout">
        <nav className="vn-options-nav" aria-label="หมวดการตั้งค่า">
          {(
            [
              ['reading', 'การอ่าน'],
              ['display', 'หน้าจอ'],
              ['audio', 'เสียง'],
            ] as const
          ).map(([id, label]) => (
            <DemoControl
              key={id}
              {...guard}
              className="vn-section-link"
              aria-current={section === id ? 'location' : undefined}
              onActivate={() => {
                setSection(id);
              }}
            >
              {label}
            </DemoControl>
          ))}
          <DemoControl
            className="vn-return vn-back-main"
            aria-label={fromPause ? 'กลับเมนูเกม' : 'กลับหน้าหลัก'}
            data-screen-initial
            {...guard}
            onActivate={onClose}
          >
            กลับ
            <span className="vn-return-context">
              {fromPause ? 'เมนูเกม' : 'หน้าหลัก'}
            </span>
          </DemoControl>
        </nav>
        <div className="vn-options-content" data-options-pane={section}>
          <div className="vn-reading-column" key={section}>
            {section === 'reading' ? (
              <section className="vn-setting-section">
                <h3 id="options-reading" tabIndex={-1}>
                  การอ่าน
                </h3>
                <label className="vn-range-setting">
                  <span>
                    ความเร็วข้อความ{' '}
                    <output>{preferences.textSpeed} กลุ่มอักษร/วินาที</output>
                  </span>
                  <input
                    aria-label="ความเร็วข้อความ"
                    type="range"
                    min="25"
                    max="60"
                    step="5"
                    value={preferences.textSpeed}
                    onChange={(e) =>
                      onChange({
                        ...preferences,
                        textSpeed: Number(e.target.value),
                      })
                    }
                  />
                  <span className="vn-range-ends" aria-hidden="true">
                    <span>ช้า</span>
                    <span>เร็ว</span>
                  </span>
                </label>
                <label className="vn-range-setting">
                  <span>
                    เวลาเลื่อนอัตโนมัติ{' '}
                    <output>{preferences.autoForwardSeconds} วินาที</output>
                  </span>
                  <input
                    aria-label="เวลาเลื่อนอัตโนมัติ"
                    type="range"
                    min="1"
                    max="6"
                    step="0.5"
                    value={preferences.autoForwardSeconds}
                    onChange={(e) =>
                      onChange({
                        ...preferences,
                        autoForwardSeconds: Number(e.target.value),
                      })
                    }
                  />
                  <span className="vn-range-ends" aria-hidden="true">
                    <span>สั้น</span>
                    <span>นาน</span>
                  </span>
                </label>
                <label className="vn-toggle-setting">
                  <input
                    type="checkbox"
                    checked={preferences.instant}
                    onChange={(e) =>
                      onChange({ ...preferences, instant: e.target.checked })
                    }
                  />
                  แสดงข้อความทันที
                </label>
              </section>
            ) : null}
            {section === 'display' ? (
              <section className="vn-setting-section">
                <h3 id="options-display" tabIndex={-1}>
                  หน้าจอ
                </h3>
                <div
                  className="vn-display-modes"
                  role="group"
                  aria-label="รูปแบบหน้าจอ"
                >
                  <DemoControl
                    {...guard}
                    aria-pressed={!fullscreen}
                    onActivate={() => onDisplay('windowed')}
                  >
                    หน้าต่าง
                  </DemoControl>
                  <DemoControl
                    {...guard}
                    aria-pressed={fullscreen}
                    onActivate={() => onDisplay('fullscreen')}
                  >
                    เต็มจอ
                  </DemoControl>
                </div>
                <label className="vn-toggle-setting">
                  <input
                    type="checkbox"
                    checked={preferences.reduceMotion}
                    onChange={(e) =>
                      onChange({
                        ...preferences,
                        reduceMotion: e.target.checked,
                      })
                    }
                  />
                  ลดการเคลื่อนไหว
                </label>
                <p className="vn-setting-note">
                  {systemReduced
                    ? 'อุปกรณ์ตั้งค่าลดการเคลื่อนไหวอยู่ จะแสดงข้อความทันที'
                    : 'ใช้ร่วมกับการตั้งค่าลดการเคลื่อนไหวของอุปกรณ์'}
                </p>
                {displayMessage ? (
                  <p className="vn-setting-note" role="status">
                    {displayMessage}
                  </p>
                ) : null}
              </section>
            ) : null}
          </div>
          {section === 'audio' ? (
            <section className="vn-setting-section vn-audio-section">
              <h3 id="options-audio" tabIndex={-1}>
                เสียง
              </h3>
              {['เสียงเพลง', 'เสียงประกอบ'].map((label) => (
                <label
                  key={label}
                  className="vn-range-setting vn-unavailable-setting"
                >
                  <span>
                    {label}
                    <span>ยังไม่พร้อม</span>
                  </span>
                  <input
                    aria-label={label}
                    aria-describedby="audio-unavailable"
                    type="range"
                    disabled
                  />
                </label>
              ))}
              <p className="vn-setting-note" id="audio-unavailable">
                เดโมนี้ยังไม่มีระบบเสียง ปุ่มปรับระดับเสียงจึงยังใช้งานไม่ได้
              </p>
            </section>
          ) : null}
        </div>
      </div>
    </DemoScreen>
  );
}
