foreach ($dir in Get-ChildItem -Directory) {
    try {
        pushd $dir.FullName
            echo "--- Working on ""$($dir.FullName)"""

            if ((Get-ChildItem -Force -Directory).Name -notcontains ".git") {
                echo "  x: ""$($dir.FullName)"" is not a git repository, continue next directory."
                continue
            }

            npm run build
    } finally {
        popd
    }
}
