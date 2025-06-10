#!/bin/bash

#
ln -sr ./dom.ts/src ./shared/u2re/dom
ln -sr ./object.ts/src ./shared/u2re/object
ln -sr ./lur.e/src ./shared/u2re/lure
ln -sr ./theme.core/src ./shared/u2re/theme
ln -sr ./uniform.ts/src ./shared/u2re/uniform
ln -sr ./ui.system/src ./shared/u2re/ui

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
