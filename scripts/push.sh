#!/bin/bash

#
message=${1:-"Mass Update"}
directories=(./modules/*/* ./apps/* ./runtime)

#
for dir in "${directories[@]}"; do
    if [ -d "$dir/.git" ]; then
        session_name=$(basename "$dir")
        screen -dmS "$session_name" bash -c "
            cd $dir && \
            git add . ; git add * ; \
            git commit -m \"$message\" ; \
            git push --all
        "
        echo "Started git operations in screen session: $session_name"
    else
        echo "Skipping $dir: not a git repository"
    fi
done
