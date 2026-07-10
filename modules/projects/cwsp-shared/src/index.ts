/*
 * Filename: index.ts
 * FullPath: /home/u2re-dev/U2RE.space/modules/projects/cwsp-shared/src/index.ts
 * Change date and time: 14.55.00_10.07.2026
 * Reason for changes: Keep the package root transport-neutral (v2); legacy wire helpers stay on subpaths.
 *
 * NOTE: platform/transport adapters intentionally live outside this package.
 * COMPAT: historical `cwsp-shared/<module>` imports resolve via package exports `./*`.
 */

export * from "./v2/index.ts";
