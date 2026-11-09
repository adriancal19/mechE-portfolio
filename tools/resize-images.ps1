<#
.SYNOPSIS
  Makes web-sized JPG copies of your photos. Nothing to install (uses Windows' built-in imaging).

.EXAMPLE
  # Resize every photo in a folder (outputs to <folder>\web\)
  powershell -ExecutionPolicy Bypass -File tools\resize-images.ps1 -Path "C:\Users\me\Pictures\rotor"

.EXAMPLE
  # Put the results straight into a project's images folder
  powershell -ExecutionPolicy Bypass -File tools\resize-images.ps1 -Path "C:\Users\me\Pictures\rotor" -OutDir projects\brake-rotor\images

.NOTES
  -MaxSize  Longest side in pixels (default 2000). Covers look best at 1600x2000, so 2000 works for everything.
  -Quality  JPG quality 1-100 (default 82). 75-85 is the sweet spot.
  Reads .jpg/.jpeg/.png/.bmp/.tif. iPhone .HEIC isn't supported. Set iPhone Camera > Formats > Most Compatible,
  or AirDrop/email the photo, which converts it to JPG.
#>
param(
  [Parameter(Mandatory = $true)][string]$Path,
  [string]$OutDir,
  [int]$MaxSize = 2000,
  [ValidateRange(1, 100)][int]$Quality = 82
)

Add-Type -AssemblyName System.Drawing

$src = Resolve-Path $Path
if (-not $OutDir) { $OutDir = Join-Path $src 'web' }
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$OutDir = (Resolve-Path $OutDir).Path

$jpeg = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), ([long]$Quality)

$files = Get-ChildItem -Path $src -File | Where-Object { $_.Extension -match '^\.(jpe?g|png|bmp|tiff?)$' }
if (-not $files) { Write-Host "No images found in $src"; exit }

foreach ($f in $files) {
  $img = [System.Drawing.Image]::FromFile($f.FullName)
  try {
    # Respect the phone's rotation flag (EXIF orientation)
    if ($img.PropertyIdList -contains 0x0112) {
      switch ($img.GetPropertyItem(0x0112).Value[0]) {
        3 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone) }
        6 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone) }
        8 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone) }
      }
    }
    $scale = [Math]::Min(1.0, $MaxSize / [Math]::Max($img.Width, $img.Height))
    $w = [int][Math]::Round($img.Width * $scale)
    $h = [int][Math]::Round($img.Height * $scale)

    $bmp = New-Object System.Drawing.Bitmap $w, $h
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.Clear([System.Drawing.Color]::White)   # transparent PNG areas become white
    $g.DrawImage($img, 0, 0, $w, $h)

    $name = ($f.BaseName.ToLower() -replace '[^a-z0-9_-]+', '-') + '.jpg'
    $out = Join-Path $OutDir $name
    $bmp.Save($out, $jpeg, $params)
    $g.Dispose(); $bmp.Dispose()

    $kb = [Math]::Round((Get-Item $out).Length / 1KB)
    Write-Host ("{0,-28} {1,5} x {2,-5} {3,6} KB" -f $name, $w, $h, $kb)
  }
  finally { $img.Dispose() }
}
Write-Host "`nDone. Files are in $OutDir"
