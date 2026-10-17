import { describe, expect, it } from 'vitest';
import {
  createDialogueReveal,
  segmentDialogue,
} from '../../src/ui/useDialogueReveal';
import { createDemoSession } from '../../src/narrative/demoSession';

const line = {
  key: 'session/scene/line',
  text: 'ก้กิe\u0301👩‍💻ภาษาไทย',
  instant: false,
  reducedMotion: false,
  paused: false,
  active: true,
};

describe('presentation-only Thai reveal', () => {
  it.each([25, 40, 60])(
    'uses the selected %s graphemes per second',
    (speed) => {
      const reveal = createDialogueReveal();
      reveal.configure({ ...line, text: 'ก้'.repeat(100), speed });
      reveal.step(1000);
      expect(reveal.getSnapshot().text).toBe('ก้'.repeat(speed));
    },
  );
  it('keeps fractional progress when speed changes mid-line', () => {
    const reveal = createDialogueReveal();
    reveal.configure({ ...line, speed: 25 });
    reveal.step(50);
    expect(reveal.getSnapshot().count).toBe(1);
    reveal.configure({ ...line, speed: 60 });
    expect(reveal.getSnapshot().count).toBe(1);
    reveal.step(25);
    expect(reveal.getSnapshot().count).toBe(2);
    reveal.step(5);
    expect(reveal.getSnapshot().count).toBe(3);
  });
  it('keeps Thai combining marks, Latin accents and emoji sequences intact', () => {
    expect(segmentDialogue('ก้กิe\u0301👩‍💻')).toEqual([
      'ก้',
      'กิ',
      'e\u0301',
      '👩‍💻',
    ]);
    expect(segmentDialogue('เก้าน้ำ').join('')).toBe('เก้าน้ำ');
  });
  it('reveals at the experimental rate and consumes finish before advance', () => {
    const reveal = createDialogueReveal();
    reveal.configure(line);
    reveal.step(24);
    expect(reveal.getSnapshot().text).toBe('');
    reveal.step(1);
    expect(reveal.getSnapshot().text).toBe('ก้');
    expect(reveal.finish(line.key)).toBe(true);
    expect(reveal.getSnapshot().text).toBe(line.text);
    expect(reveal.finish(line.key)).toBe(false);
  });
  it('freezes progress while paused and resumes without restarting', () => {
    const reveal = createDialogueReveal();
    reveal.configure(line);
    reveal.step(25);
    reveal.configure({ ...line, paused: true });
    reveal.step(1000);
    expect(reveal.getSnapshot().text).toBe('ก้');
    expect(reveal.finish(line.key)).toBe(false);
    reveal.configure(line);
    reveal.step(25);
    expect(reveal.getSnapshot().text).toBe('ก้กิ');
  });
  it.each(['instant', 'reducedMotion'] as const)(
    '%s completes the current line permanently, without restarting on toggle',
    (option) => {
      const reveal = createDialogueReveal();
      reveal.configure(line);
      reveal.step(25);
      reveal.configure({ ...line, [option]: true });
      expect(reveal.getSnapshot().text).toBe(line.text);
      reveal.configure(line);
      expect(reveal.getSnapshot().revealing).toBe(false);
      reveal.configure({ ...line, key: 'new-line' });
      expect(reveal.getSnapshot().text).toBe('');
    },
  );
  it('uses full text when segmentation is unavailable; never splits UTF-16', () => {
    const reveal = createDialogueReveal((text) => [text]);
    reveal.configure(line);
    expect(reveal.getSnapshot()).toMatchObject({
      text: line.text,
      revealing: false,
    });
  });
  it('rejects stale finish actions and resets new session/scene identities', () => {
    const reveal = createDialogueReveal();
    reveal.configure(line);
    reveal.step(25);
    reveal.configure({ ...line, key: 'new-session/new-scene/line' });
    expect(reveal.finish(line.key)).toBe(false);
    expect(reveal.getSnapshot().text).toBe('');
  });
  it('shows full context during choices/end and ignores invalid clock deltas', () => {
    const reveal = createDialogueReveal();
    reveal.configure(line);
    reveal.step(Number.NaN);
    reveal.step(-100);
    expect(reveal.getSnapshot().text).toBe('');
    reveal.configure({ ...line, active: false });
    expect(reveal.getSnapshot().text).toBe(line.text);
    expect(reveal.finish(line.key)).toBe(false);
  });
  it('does not advance the actual controller or reapply facts/ledger while revealing', () => {
    const session = createDemoSession();
    session.controller.start();
    for (
      let step = 0;
      step < 80 &&
      session.controller.getSnapshot().line?.id !== 'demo.D101-L007';
      step++
    ) {
      const view = session.controller.getSnapshot();
      if (view.phase === 'line') session.controller.continue(view);
      else if (view.phase === 'choice') session.controller.choose(view, 0);
      else throw new Error('Unexpected narrative phase');
    }
    const view = session.controller.getSnapshot();
    expect(view.line?.id).toBe('demo.D101-L007');
    const state = session.store.getState();
    expect(state.flags.manao_name).toBe(true);
    const reveal = createDialogueReveal();
    reveal.configure({ ...line, text: view.line!.text });
    reveal.step(25);
    reveal.finish(line.key);
    expect(session.controller.getSnapshot()).toBe(view);
    expect(session.store.getState()).toBe(state);
    session.controller.continue(view);
    expect(session.store.getState().committedEventIds).toEqual(
      state.committedEventIds,
    );
    session.controller.dispose();
  });
});
