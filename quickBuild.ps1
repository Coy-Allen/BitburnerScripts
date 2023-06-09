Set-Location $(Split-Path $MyInvocation.MyCommand.Path)
Get-Date -Format o
write-host "linting"
npx eslint .
if ($LastExitCode -eq 0){
  write-host "compiling"
  npx tsc
} else {
  write-host "skipped compiling"
}
write-host "done"