#!/bin/bash

# in ./externals
ln -sr ../modules/theme.core/dist/theme.js ./modules/theme.js
ln -sr ../modules/object.ts/dist/object.js ./modules/object.js
ln -sr ../modules/uniform.ts/dist/uniform.js ./modules/uniform.js
ln -sr ../modules/dom.ts/dist/dom.js ./modules/dom.js
ln -sr ../modules/BLU.E/dist/blue.js ./modules/blue.js
ln -sr ../modules/ui.system/dist/ui.js ./modules/ui.js
ln -sr . ../runtime/externals
ln -sr . ../runtime/frontend/externals
ln -sr . ../apps/OS.u2re.space/externals
ln -sr . ../apps/print.u2re.space/externals
ln -sr . ../apps/OS.u2re.space/frontend/externals
ln -sr . ../apps/print.u2re.space/frontend/externals
#ln -sr ./modules ./lib/modules
#ln -sr ./modules ./core/modules
#ln -sr ./modules ./wcomp/modules
#ln -sfr ../modules/wcomp/ui.system/dist/modules/*.js ./modules/
#ln -sfr ../modules/core/theme.core/dist/modules/*.js ./modules/

# in ./
ln -sr ./apps/OS.u2re.space/src ./apps/OS.u2re.space/frontend/src
ln -sr ./assets ./apps/OS.u2re.space/assets
ln -sr ./assets ./apps/OS.u2re.space/frontend/assets
ln -sr ./assets ./runtime/frontend/assets
