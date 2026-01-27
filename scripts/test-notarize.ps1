# Test Notarize API
# Usage: .\test-notarize.ps1 -DocumentId "YOUR_DOCUMENT_UUID"

param (
    [string]$DocumentId
)

if ([string]::IsNullOrEmpty($DocumentId)) {
    Write-Host "Please provide a Document ID." -ForegroundColor Red
    Write-Host "Usage: .\test-notarize.ps1 -DocumentId <UUID>"
    exit 1
}

$Url = "http://localhost:3000/api/dss/notarize"
$Body = @{
    documentId = $DocumentId
} | ConvertTo-Json

Write-Host "Sending request to $Url for Document ID: $DocumentId..." -ForegroundColor Cyan

try {
    $Response = Invoke-RestMethod -Uri $Url -Method Post -Body $Body -ContentType "application/json"
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host ($Response | ConvertTo-Json -Depth 5)
} catch {
    Write-Host "❌ Error:" -ForegroundColor Red
    if ($_.Exception.Response) {
        $Stream = $_.Exception.Response.GetResponseStream()
        $Reader = New-Object System.IO.StreamReader($Stream)
        Write-Host $Reader.ReadToEnd()
    } else {
        Write-Host $_.Exception.Message
    }
}
