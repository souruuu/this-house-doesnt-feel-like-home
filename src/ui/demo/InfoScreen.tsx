import { DemoControl, type DemoInputGuard } from '../DemoControl';
import { DemoScreen } from './DemoScreen';
import type { DemoInfoPage } from './demoPreferences';

const content = {
  load: {
    title: 'Load',
    heading: 'ยังไม่พร้อมโหลดเกม',
    body: 'เดโมนี้ยังไม่มีระบบบันทึกและโหลดความคืบหน้า การรีเฟรชหรือปิดหน้าจะเริ่มเล่นใหม่',
  },
  gallery: {
    title: 'Gallery',
    heading: 'ยังไม่มีภาพเพิ่มเติม',
    body: 'พื้นที่นี้เตรียมไว้สำหรับภาพที่ได้รับอนุมัติในอนาคต ยังไม่มีแกลเลอรีให้เปิดชมในเดโมนี้',
  },
  about: {
    title: 'About',
    heading: 'หลังเคาน์เตอร์',
    body: 'ช่วงทดลองเล่นวันที่ 1–3 ของ This House Doesn’t Feel Like Home งานภาพและการนำเสนอยังอยู่ระหว่างพัฒนา',
  },
} as const;

export function InfoScreen({
  page,
  guard,
  onClose,
}: {
  page: DemoInfoPage;
  guard: DemoInputGuard;
  onClose: () => void;
}) {
  const info = content[page];
  return (
    <DemoScreen label={info.title} className="vn-info-screen" onClose={onClose}>
      <header className="vn-screen-header">
        <h2>{info.title}</h2>
      </header>
      <div className="vn-info-content">
        <h3>{info.heading}</h3>
        <p>{info.body}</p>
      </div>
      <DemoControl
        className="vn-return vn-back-main"
        aria-label="กลับหน้าหลัก"
        data-screen-initial
        {...guard}
        onActivate={onClose}
      >
        กลับหน้าหลัก
      </DemoControl>
    </DemoScreen>
  );
}
