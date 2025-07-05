#!/bin/bash

#
ln -sr ./dom.ts/src ./shared/fest/dom
ln -sr ./object.ts/src ./shared/fest/object
ln -sr ./lur.e/src ./shared/fest/lure
ln -sr ./theme.core/src ./shared/fest/theme
ln -sr ./uniform.ts/src ./shared/fest/uniform
ln -sr ./ui.system/src ./shared/fest/ui

#
ln -sr ./dom.ts/test ./shared/test/dom
ln -sr ./object.ts/test ./shared/test/object
ln -sr ./lur.e/test ./shared/test/lure
ln -sr ./theme.core/test ./shared/test/theme
ln -sr ./uniform.ts/test ./shared/test/uniform
ln -sr ./ui.system/test ./shared/test/ui

#
ln -sr ../externals ./externals
ln -sr ../externals ./shared/externals
