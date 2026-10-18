# Approved Editorial Integration — Day 1–3

Owner authorization delivered 18 October 2026 supersedes the historical
implementation-pending headings in the byte-identical 04 handoff. Scope is the
nine existing scenes on `codex/emergency-day1-day3-playable-demo`, parent
`b59c2640383afd407a6dd0001512a75102bf2d06`. Internal project name remains unchanged;
player-facing title is **หลังเคาน์เตอร์**. Final Visual/Release Acceptance is separate.

## Authority and integrity

Approved ZIP SHA-256:
`e7fd9e1d6a7b974dacb8be6524a67458c8d769a52d0e5510c806b9f08e9f48b7`.
`README_FIRST.md`, five playable scripts and the Day 1 approval record are exact
copies, checked against the six pinned hashes in that README and
`scripts/demo-content.ts`. `SHA256SUMS.txt` covers those seven original records.
The older `../emergency-demo-2026-10-17/` package, its hashes and the original
Narrative Map remain immutable. New approval changes editorial text, not Canon
event/knowledge rules, domain ownership, DoD or release gates.

Only §1 playable rows are rendered. Instructions, headings, tables, rejoin markers
and §1A historical alternatives are not executable text. Outer curly quotation
marks delimit an utterance and are removed; all enclosed punctuation/text remains
exact. The Day 1 override is **โห คิดเป็นเรื่องเป็นราวเลยนะ** at EM2-D103-NA03.
Day 2 D202-L001 starts **ช่วงบ่าย**; Day 3 D301-L001 starts **หลังเลิกเรียน**.

## Short implementation plan / traceability

1. Verify branch, clean tree/index, remote refs, Draft PR #9 and source digests.
2. Map every approved row before editing; integrate only three Day Ink scripts,
   references, source reader/validator, explicit character cues and player label.
3. Compare compiled Controller text, labels, scene, sequence, branch/rejoin and
   exact event timing to independent approved Markdown. Retain original integrity
   checks. Add mutation tests and runtime evidence/ledger tests.
4. Run compile/validate, typecheck/lint/format/unit/build, Chromium/WebKit full
   regressions, Firefox diagnostic and responsive visual QA; capture real flow.
5. Conditional Git only if scoped mandatory gates pass; keep PR #9 Draft.

`mapping.json` is the complete row-level traceability table, independently checked
against the approved Markdown at validation time. It contains source hash, exact
text, scene, editorial ref, runtime ID, old stable ID, speaker, route/rejoin block,
event evidence, actor participation and test coverage. It is not runtime authority.

| Scene | Approved rows | New EM lines |
|---|---:|---:|
| SC-D1-01 | 29 | 16 |
| SC-D1-02 | 25 | 13 |
| SC-D1-03 | 38 | 18 |
| SC-D2-01 | 26 | 13 |
| SC-D2-02 | 37 | 19 |
| SC-D2-03 | 26 | 12 |
| SC-D3-01 | 26 | 10 |
| SC-D3-02 | 21 | 7 |
| SC-D3-03 | 31 | 7 |
| DEMO_END | 3 | 0 |

262 editorial rows include one existing UI navigation button. With unchanged
Notice/Prologue, 267 runtime line/choice IDs retain all 152 existing runtime IDs.
New IDs use `demo.D101-EM3-I01` for `EM3-D101-I01` (same deterministic transform
for EM/EM2/EM3). EM references never become Event IDs. D3E-C01-A remains React's
existing return-to-menu action, not a new Ink choice or domain effect.

## Ownership and guards

`player` is validated production speaker metadata, displayed **เจ้าของร้าน** only
for authored standalone player speech. No parser/controller change is needed:
the existing references speaker whitelist already validates IDs. No player asset.
Choices appear only on buttons; narrator has no label. Characters remain through
inserted lines according to explicit scene participation windows, independent of
speaker; the D1 exterior boy still has no invented interior sprite.

The nine existing domain events and their evidence lines remain unchanged. Nut's
food fact occurs only at D103-L005A, Som's grant only at D202-L007A, and Kan's name
only at D303-L010A with an anonymous speaker on that disclosure line. No new
permission/promise/state formula, profile/Skip/save/audio behavior or stage art.
Temporary busts and A+B layout/motion/input remain regression-protected.

## Verification and open risks

Use repository scripts from README. The strict validator traverses 64 deterministic
complete Controller runs covering every authored row, route variant, choice and
rejoin; it does not claim exhaustive combinations. Unit tests also mutate text,
IDs, references, event timing and compiled route order to prove rejection.
Detailed raw logs, screenshots, video, full diff and checksums are delivered in the
external review bundle, not fabricated here before execution.

Firefox/A-01, ManagedGame, pre-READY, U-01/U-02/U-03 and M0/M1 NOT DONE remain.
No full three-browser/CI PASS claim, Linux/real-device/hosted verification, release
packaging, Ready/Merge/Deploy, Checkpoint C, new branch or new PR is authorized.
