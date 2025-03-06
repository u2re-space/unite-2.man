#!/bin/bash

# in ./externals
ln -sr ../modules/core/web.core/dist/core.js ./core/core.js
ln -sr ../modules/core/agate.ux/dist/agate.js ./core/agate.js
ln -sr ../modules/core/design.core/dist/design.js ./core/design.js
ln -sr ../modules/core/existence.core/dist/existence.js ./core/existence.js
ln -sr ../modules/core/grid.core/dist/grid.js ./core/grid.js
ln -sr ../modules/core/interact.ts/dist/interact.js ./core/interact.js
ln -sr ../modules/core/theme.core/dist/theme.js ./core/theme.js
ln -sr ../modules/lib/object.ts/dist/object.js ./lib/object.js
ln -sr ../modules/lib/uniform.ts/dist/uniform.js ./lib/uniform.js
ln -sr ../modules/lib/dom.ts/dist/dom.js ./lib/dom.js
ln -sr ../modules/wcomp/image.wcomp/dist/image.js ./wcomp/image.js
ln -sr ../modules/wcomp/longtext.wcomp/dist/longtext.js ./wcomp/longtext.js
ln -sr ../modules/wcomp/scrollbox.wcomp/dist/scrollbox.js ./wcomp/scrollbox.js
ln -sr ../modules/wcomp/ui.system/dist/ui.js ./wcomp/ui.js
ln -sr . ../runtime/externals
ln -sr . ../runtime/frontend/externals
ln -sr . ../apps/OS.u2re.space/externals
ln -sr . ../apps/print.u2re.space/externals
ln -sr . ../apps/OS.u2re.space/frontend/externals
ln -sr . ../apps/print.u2re.space/frontend/externals
ln -sr ./modules ./lib/modules
ln -sr ./modules ./core/modules
ln -sr ./modules ./wcomp/modules
ln -sfr ../modules/wcomp/ui.system/dist/modules/*.js ./modules/
ln -sfr ../modules/core/theme.core/dist/modules/*.js ./modules/

# in ./
ln -sr ./apps/OS.u2re.space/src ./apps/OS.u2re.space/frontend/src 
ln -sr ./assets ./apps/OS.u2re.space/assets 
ln -sr ./assets ./apps/OS.u2re.space/frontend/assets 
