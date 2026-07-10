# CWSP-reborn Pass-II Baseline Archive

This archive preserves the exact pre-Pass-II state through immutable Git commit
references in `manifest.json`. It is intentionally Git-backed instead of
duplicating source trees.

The user-requested compatibility paths `.acrhive/` and `.acrhives/` both resolve
to the canonical `.archives/` directory.

## Recovery rule

1. Identify the owning repository from `manifest.json`.
2. Inspect the archived file at its recorded commit.
3. Restore only the required file through a reviewed patch.
4. Re-run the owning task's focused tests.

Do not bulk-replace the current tree, restore generated output, or copy private
configuration from an archive.

## Pass-I artifacts

The recorded workspace and CWSP-reborn commits contain the original Pass-I
plans, roadmaps, analysis, documentation, rules, progress state, and config
documentation. Any Pass-II update must keep its predecessor recoverable through
these commit references.
