param(
    [string]$Message="!Auto-Update!",
    [switch]$All=$false
)

foreach ($dir in Get-ChildItem -Directory) {
    try {
        pushd $dir.FullName
            echo "--- Working on ""$($dir.FullName)"""

            if ((Get-ChildItem -Force -Directory).Name -notcontains ".git") {
                echo "  x: ""$($dir.FullName)"" is not a git repository, continue next directory."
                continue
            }

            git add *
            git commit -m "${Message}"
            if ($All) {
                git push --all
            } else {
                git push origin main
            }
    } finally {
        popd
    }
}
