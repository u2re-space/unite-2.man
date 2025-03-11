#!/bin/bash

scp -rp ./runtime/frontend root@62.109.2.102:/root/webapp.runtime/
scp -rp ./externals root@62.109.2.102:/root/webapp.runtime/frontend/
scp -rp ./apps/OS.u2re.space/frontend/app root@62.109.2.102:/root/webapp.runtime/frontend/
#scp -rp ./assets root@62.109.2.102:/root/webapp.runtime/frontend/
