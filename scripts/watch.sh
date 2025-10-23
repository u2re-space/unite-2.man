#!/bin/bash
screen -dmS watch-theme-core bash -c "cd ./modules/core/theme.core && npm run watch"
screen -dmS watch-grid-core bash -c "cd ./modules/core/grid.core && npm run watch"
screen -dmS watch-existence-core bash -c "cd ./modules/core/existence.core && npm run watch"
screen -dmS watch-design-core bash -c "cd ./modules/core/design.core && npm run watch"
screen -dmS watch-interact-ts bash -c "cd ./modules/core/interact.ts && npm run watch"
screen -dmS watch-agate-ux bash -c "cd ./modules/core/agate.ux && npm run watch"
screen -dmS watch-web-core bash -c "cd ./modules/core/web.core && npm run watch"

screen -dmS watch-dom-ts bash -c "cd ./modules/lib/dom.ts && npm run watch"
screen -dmS watch-uniform-ts bash -c "cd ./modules/lib/uniform.ts && npm run watch"
screen -dmS watch-object-ts bash -c "cd ./modules/lib/object.ts && npm run watch"

screen -dmS watch-image-wcomp bash -c "cd ./modules/wcomp/image.wcomp && npm run watch"
screen -dmS watch-longtext-wcomp bash -c "cd ./modules/wcomp/longtext.wcomp && npm run watch"
screen -dmS watch-scrollbox-wcomp bash -c "cd ./modules/wcomp/scrollbox.wcomp && npm run watch"
screen -dmS watch-ui-system bash -c "cd ./modules/wcomp/ui.system && npm run watch"

screen -dmS os-dev bash -c "cd ./apps/OS.u2re.space && npm run dev"
