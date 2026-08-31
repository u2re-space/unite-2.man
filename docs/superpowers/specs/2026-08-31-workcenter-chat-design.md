# Work Center: local-first chat and attachments

## Goal

Turn Work Center into a conversation-first AI workspace: a durable local chat
with a compact composer, reliable attachments, and a calmer visual hierarchy.
It must preserve the existing CWSP processing pipeline while making files,
images, paste, drop, and restored sessions feel native to a chat.

## Accepted product decisions

- The primary surface is a real message transcript, persisted locally.
- One active OPFS-backed session is restored on reopen. **New chat** starts a
  clean transcript; named/archived conversations are out of scope.
- The layout is conversation-first: transcript in the center and composer at
  the bottom. Pipeline, history, and request options are secondary surfaces.
- PDF, DOCX, XLSX, images, text, Markdown, code, JSON, and URLs are supported.
- Content preparation is local-first. When the active model supports direct
  files, the original is sent; otherwise locally extracted content is sent.
- The initial version uses an honest processing placeholder with cancel/retry,
  not simulated token streaming.

## Interaction design

### Transcript

The view has a compact top bar with the Work Center identity, **New chat**, and
an overflow/settings action. The scrollable transcript is the dominant surface:

- A user turn renders its prompt and attached file cards together.
- An assistant turn renders Markdown in a readable prose block, retaining the
  raw result needed for copy, export, and recovery.
- A pending assistant turn represents a running request and exposes cancellation
  and retry after failure.
- Pipeline and legacy action history remain available from secondary controls,
  without permanent tabs or stacked panels in the main flow.

### Composer

The composer is sticky to the bottom of the view. It contains the prompt field,
file trigger, microphone, settings trigger, and send action. Selected
attachments appear as compact thumbnail/file chips above the input and belong
to the next submitted turn.

The visual system uses surface elevation, spacing, typography, and shape to
separate content. It removes persistent outer cards, dashed drop zones, and
unnecessary outlines. Keyboard focus remains visibly indicated via
`focus-visible`; removing it would make keyboard use inaccessible.

Request controls (output language/format, recognition, and processing mode)
move into a popover or mobile bottom sheet. They apply to the next sent turn,
and historical messages retain the metadata used to create them.

## Attachment ingress

A single workcenter attachment ingress owns validation, normalization, content
hashing, preview URLs, state updates, and UI notification. It replaces the
currently duplicated picker, drop, and paste paths.

| Source | Expected behaviour |
| --- | --- |
| File picker | Add validated files to the current draft. |
| Drag/drop | Accept files, images, and URLs anywhere in the composer drop area. URLs become link cards. |
| Paste in prompt | Plain text stays prompt text; clipboard image/file items become attachments. |
| Paste outside editable prompt | Text is inserted into the current draft; image/file items become attachments. |
| Share target/channel handoff | Normalize incoming blobs/files through the same ingress and surface them in the draft. |

Each submitted turn captures an immutable snapshot of its prompt, attachment
references, settings, and request lifecycle. The draft then becomes empty, so
a newly added attachment can never silently modify an in-flight turn.

Deduplication uses a content hash plus MIME metadata rather than the current
name/size/type fingerprint. Invalid or unsupported data is rejected with a
clear user-facing reason and never partially mutates the draft.

## Local document preparation

Preparation is capability-based:

1. Images retain their original bytes, produce an object-URL preview, and are
   converted to an AI image input when direct upload is unavailable.
2. Text, Markdown, code, JSON, and URLs preserve their native text form.
3. PDF yields locally extracted text and page/image material where available.
4. DOCX yields document text and embedded images.
5. XLSX yields sheet-aware tabular text suitable for model input.
6. If a direct-file capability is advertised, the original file accompanies
   its extracted representation as appropriate; otherwise the local result is
   used as the fallback.

A preparation failure does not delete the attachment. Its card displays the
failure and gives the user a retry/remove path.

## Persistence

`lur.e` provides generic OPFS primitives for session manifests and binary
blobs. It must not import UI code.

Work Center persists:

- session manifest and schema version;
- ordered message/turn records;
- request metadata and lifecycle state;
- attachment descriptors and content-addressed blob references;
- raw assistant output, needed to re-render Markdown after hydration.

OPFS writes happen after successful attachment ingestion and after each
message/request-state transition. On hydration, blobs restore `File` objects
and object URLs are recreated lazily. File contents are never serialized to
`localStorage` or JSON.

## Module boundaries

- `modules/projects/lur.e/src/utils/opfs`: generic session/blob storage and
  hydration utilities only.
- `modules/projects/fl.ui/src/ui/inputs` and `ui/markdown`: reusable composer
  primitives and safe Markdown presentation, with no Work Center state.
- `modules/views/workcenter-view`: transcript state, DOM composition,
  attachment ingress, lifecycle, and accessibility behavior.
- `apps/CWSP-process`: model execution and direct-file capability selection;
  it remains the sole model owner.
- `modules/projects/veela.css`: the canonical token registry. Work Center
  consumes existing tokens and does not introduce a competing palette.

## Error handling

- Model preparation/processing starts as a visible pending assistant message.
- Cancellation marks that message cancelled without erasing the user turn.
- Retry reuses the submitted turn snapshot, never the mutable draft.
- Parse, OPFS, clipboard, and direct-file failures show an actionable state
  alongside the attachment or message and preserve remaining usable content.
- Sanitized Markdown remains the rendered assistant output; raw content is
  retained separately.

## Verification

Targeted coverage will verify:

- picker, drop, paste, URL, share-target, validation, and content-hash
  deduplication ingress paths;
- draft snapshot semantics and retry/cancellation lifecycle;
- OPFS persistence, hydration, corrupted/missing blob handling;
- PDF/DOCX/XLSX preparation fallback selection;
- Markdown re-rendering and transcript DOM behavior;
- keyboard focus and composer accessibility.

No monorepo-wide build, deployment, or device matrix is required for this
design change unless an implementation change makes one necessary.

## Out of scope

- Multiple named or archived chat sessions.
- Token-by-token response streaming without an explicit confirmed backend/API
  contract.
- A replacement global theme palette or changes to unrelated views.
