#!/bin/bash

screen -dmS install-theme-core bash -c "cd ./modules/core/theme.core && git pull --all --force && npm install -D && npm audit fix --force"
screen -dmS install-grid-core bash -c "cd ./modules/core/grid.core && git pull --all --force && npm install -D && npm audit fix --force"
screen -dmS install-existence-core bash -c "cd ./modules/core/existence.core && git pull --all --force && npm install -D && npm audit fix --force"
screen -dmS install-design-core bash -c "cd ./modules/core/design.core && git pull --all --force && npm install -D && npm audit fix --force"
screen -dmS install-interact-ts bash -c "cd ./modules/core/interact.ts && git pull --all --force && npm install -D && npm audit fix --force"
screen -dmS install-agate-ux bash -c "cd ./modules/core/agate.ux && git pull --all --force && npm install -D && npm audit fix --force"
screen -dmS install-web-core bash -c "cd ./modules/core/web.core && git pull --all --force && npm install -D && npm audit fix --force"

screen -dmS install-dom-ts bash -c "cd ./modules/lib/dom.ts && git pull --all --force && npm install -D && npm audit fix --force"
screen -dmS install-uniform-ts bash -c "cd ./modules/lib/uniform.ts && git pull --all --force && npm install -D && npm audit fix --force"
screen -dmS install-object-ts bash -c "cd ./modules/lib/object.ts && git pull --all --force && npm install -D && npm audit fix --force"

screen -dmS install-image-wcomp bash -c "cd ./modules/wcomp/image.wcomp && git pull --all --force && npm install -D && npm audit fix --force"
screen -dmS install-longtext-wcomp bash -c "cd ./modules/wcomp/longtext.wcomp && git pull --all --force && npm install -D && npm audit fix --force"
screen -dmS install-scrollbox-wcomp bash -c "cd ./modules/wcomp/scrollbox.wcomp && git pull --all --force && npm install -D && npm audit fix --force"
screen -dmS install-ui-system bash -c "cd ./modules/wcomp/ui.system && git pull --all --force && npm install -D && npm audit fix --force"

screen -dmS install-os-dev bash -c "cd ./apps/OS.u2re.space && git pull --all --force && npm install -D && npm audit fix --force"
