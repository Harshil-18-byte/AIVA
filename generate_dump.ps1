$files = Get-ChildItem -Path c:\AIVA -Recurse -File
$out = "c:\AIVA\temp_project_dump.md"
$content = [System.Collections.Generic.List[string]]::new()
foreach ($f in $files) {
    if ($f.FullName -match "node_modules|dist|__pycache__|\.git|package-lock\.json|error\.log|\.ipynb|generate_dump\.ps1") { continue }
    if ($f.Extension -match "\.(py|ts|tsx|js|css|html|md|bat|json|txt)$") {
        $relPath = $f.FullName.Replace("c:\AIVA\", "")
        $ext = $f.Extension.TrimStart(".")
        $content.Add("## File: $relPath")
        $content.Add('```' + $ext)
        try {
            $txt = [System.IO.File]::ReadAllText($f.FullName)
            $content.Add($txt)
        }
        catch {
            $content.Add("# Error reading file")
        }
        $content.Add('```')
        $content.Add("")
    }
}
[System.IO.File]::WriteAllLines($out, $content)
