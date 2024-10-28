call pnpm install --shamefully-hoist --config.package-manager-strict=false -f -D
call pnpm audit --audit-level moderate --fix
pause
