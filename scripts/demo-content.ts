import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

export const handoffDirectory = 'sources/emergency-demo-2026-10-17';

export function readOriginalDemoContent() {
  const sums = readFileSync(`${handoffDirectory}/SHA256SUMS.txt`, 'utf8');
  const rows = new Map<
    string,
    { text: string; speaker: string; source: string }
  >();
  for (const line of sums.trim().split(/\r?\n/)) {
    const [expected, file] = line.split(/\s+/, 2);
    const bytes = readFileSync(`${handoffDirectory}/${file}`);
    if (createHash('sha256').update(bytes).digest('hex') !== expected)
      throw new Error(`Handoff checksum mismatch: ${file}`);
    if (!file.startsWith('Narrative_Package')) continue;
    let inContent = false;
    for (const sourceLine of bytes.toString('utf8').split(/\r?\n/)) {
      if (sourceLine.startsWith('## '))
        inContent = /^## B(?:\.|0\.)/.test(sourceLine);
      if (!inContent) continue;
      if (!sourceLine.startsWith('|')) continue;
      const cells = sourceLine
        .split('|')
        .slice(1, -1)
        .map((cell) => cell.trim());
      const id =
        /`(D(?:[123]\d\d|1N|1P|3E)-(?:L\d{3}[A-Z]?|C\d{2}-[AB]))`/.exec(
          cells[0],
        )?.[1];
      if (id && !rows.has(id))
        rows.set(id, { text: cells[2], speaker: cells[1], source: file });
    }
  }
  return rows;
}

export const editorialDirectory = 'sources/editorial-demo-2026-10-17';
// Digests from the Owner-approved ZIP, not from editable mapping/Ink output.
export const editorialSources = {
  'day1/Narrative_Emotional_Revision_Proposal_SC-D1-01_v0.3.1.md':
    '4d772af01152ae639702b66a6b70e76027d96d9725fb804b51b00c20ab0f76d1',
  'day1/Narrative_Emotional_Revision_Proposal_SC-D1-02_v0.2.md':
    'f1c63f468c55642edd172c4114b95129e0303b9227bd4864b0b2457d2b440b09',
  'day1/Narrative_Emotional_Revision_SC-D1-03_v0.2.1_Owner_Approved.md':
    '6eb14f99ac6316a13422f1c72d85b62e9ba456b3795e99588bac6f39452f9d35',
  'day1/Editorial_Content_Revision_Record_Day1_2026-10-17_v1.0.md':
    'a4b7c68df14198772aa8c508d7987357ec97d5c750d55d7f99c90af6c51c6995',
  'day2/Narrative_Emotional_Revision_Proposal_Day2_v0.1_corrected.md':
    '6f5d0b8cf3dc62d132c848af6af6896dc3758732775ff787f99c401cb29f707d',
  'day3/Narrative_Emotional_Revision_Proposal_Day3_v0.1.md':
    '4c4d3403952588d8ec5133e9511ce04532055e7e748cc26a5a45e8241cb688d4',
} as const;

export interface EditorialRow {
  source: string;
  ref: string;
  id: string;
  scene: string;
  block: string;
  text: string;
  speaker: string;
  kind: 'line' | 'choice' | 'button';
}

export const demoSpeakerLabels: Record<string, string> = {
  none: '',
  girl: 'เด็กหญิง',
  boy: 'เด็กชาย',
  awning_boy: 'เด็กชายที่ชายคา',
  manao: 'มะนาว',
  som: 'ส้ม',
  nut: 'นัท',
  kan: 'กันต์',
  player: 'เจ้าของร้าน',
};

// Only the playable §1 is executable content. Instructions, tables and §1A
// historical wording are deliberately excluded. Outer dialogue quotation marks
// delimit authored utterances; punctuation inside them remains byte-for-byte.
export function parseEditorialScript(
  source: string,
  file: string,
): EditorialRow[] {
  const section = source
    .split(/\r?\n## 1\./)[1]
    ?.split(/\r?\n## (?:1A|2)\./)[0];
  if (!section) throw new Error(`Missing playable section: ${file}`);
  const rows: EditorialRow[] = [];
  let scene = '',
    block = 'entry',
    group = 'C01';
  const lines = section.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('#')) {
      const nextScene =
        /SC-D[123]-0[123]/.exec(line)?.[0] ??
        (line.includes('`DEMO_END`') ? 'DEMO_END' : null);
      if (nextScene && nextScene !== scene) {
        scene = nextScene;
        block = 'entry';
        group = 'C01';
      }
      if (line.includes('Choice Group')) group = /C\d{2}/.exec(line)![0];
      else if (/`D\d+-R\d{2}`/.test(line)) block = /R\d{2}/.exec(line)![0];
      else if (line.includes('TRUE only')) block = 'T';
      else if (line.includes('FALSE only')) block = 'F';
      else if (line.includes('Route ')) {
        const branch =
          /Route B→([AB])/.exec(line)?.[1] ??
          /Route (?:`D\d+-C\d{2}-)?([AB])/.exec(line)?.[1];
        if (branch) block = `${group}-${branch}`;
      }
    }
    const item =
      /^\*\*\[(บรรยาย|บทพูด[^|]*|ตัวเลือก[^|]*|ข้อความ UI|ปุ่ม UI)\s*\| `([^`]+)`/.exec(
        line,
      );
    if (!item) continue;
    const [, rawKind, ref] = item;
    let text = lines[i + 1]?.trim();
    if (!scene || !text || text.startsWith('**'))
      throw new Error(`Invalid authored row: ${ref}`);
    if (text.startsWith('“') && text.endsWith('”')) text = text.slice(1, -1);
    const kind = rawKind.startsWith('ตัวเลือก')
      ? 'choice'
      : rawKind === 'ปุ่ม UI'
        ? 'button'
        : 'line';
    const label = rawKind.startsWith('บทพูด')
      ? rawKind.split('—')[1]?.trim()
      : '';
    const speaker =
      label === 'ผู้เล่น'
        ? 'player'
        : Object.keys(demoSpeakerLabels).find(
            (id) => demoSpeakerLabels[id] === label,
          );
    if (!speaker) throw new Error(`Unknown authored speaker: ${ref}`);
    const id = `demo.${ref.replace(/^(EM\d?)-(D\d+)-/, '$2-$1-')}`;
    if (rows.some((r) => r.id === id))
      throw new Error(`Duplicate editorial ID: ${id}`);
    rows.push({
      source: file,
      ref,
      id,
      scene,
      block: kind === 'choice' ? /C\d{2}/.exec(ref)![0] : block,
      text,
      speaker,
      kind,
    });
  }
  return rows;
}

export function readEditorialRows(): EditorialRow[] {
  const rows: EditorialRow[] = [];
  for (const [file, hash] of Object.entries(editorialSources)) {
    const bytes = readFileSync(`${editorialDirectory}/${file}`);
    if (createHash('sha256').update(bytes).digest('hex') !== hash)
      throw new Error(`Approved editorial checksum mismatch: ${file}`);
    if (!file.includes('Revision_Record'))
      rows.push(...parseEditorialScript(bytes.toString('utf8'), file));
  }
  if (new Set(rows.map((r) => r.id)).size !== rows.length)
    throw new Error('Duplicate approved editorial IDs');
  const mapping = JSON.parse(
    readFileSync(`${editorialDirectory}/mapping.json`, 'utf8'),
  ) as {
    id: string;
    source: string;
    sourceSHA256: string;
    editorialRef: string;
    scene: string;
    block: string;
    text: string;
    speaker: string;
    kind: string;
  }[];
  if (mapping.length !== rows.length)
    throw new Error('Missing editorial mapping');
  for (const row of rows) {
    const matches = mapping.filter((m) => m.id === row.id);
    if (matches.length !== 1)
      throw new Error(`Missing/duplicate editorial mapping: ${row.id}`);
    const m = matches[0];
    if (
      m.editorialRef !== row.ref ||
      m.source !== row.source ||
      m.scene !== row.scene ||
      m.block !== row.block ||
      m.text !== row.text ||
      m.speaker !== row.speaker ||
      m.kind !== row.kind ||
      m.sourceSHA256 !==
        editorialSources[row.source as keyof typeof editorialSources]
    )
      throw new Error(
        `Editorial mapping differs from approved source: ${row.id}`,
      );
  }
  return rows;
}

export function readApprovedDemoContent() {
  const original = readOriginalDemoContent(); // Keep the original SHA/text index intact.
  const result = new Map([...original].filter(([id]) => /^D1[NP]-/.test(id)));
  for (const row of readEditorialRows()) {
    if (row.kind !== 'button')
      result.set(row.id.slice(5), {
        text: row.text,
        speaker: demoSpeakerLabels[row.speaker],
        source: row.source,
      });
  }
  // D3E-C01-A remains the existing React navigation action, not an Ink choice.
  for (const id of original.keys())
    if (id !== 'D3E-C01-A' && !result.has(id))
      throw new Error(`Lost original stable ID: ${id}`);
  return result;
}
