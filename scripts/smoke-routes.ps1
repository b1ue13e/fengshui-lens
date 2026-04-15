$ErrorActionPreference = "Stop"

$buildIdPath = Join-Path (Get-Location) ".next\\BUILD_ID"

if (-not (Test-Path $buildIdPath)) {
  Write-Error "Missing production build. Run `npm run build` before `npm run smoke:routes`."
}

$paths = @(
  @{ Path = "/"; Expected = 200 }
  @{ Path = "/categories"; Expected = 200 }
  @{ Path = "/categories/housing"; Expected = 200 }
  @{ Path = "/scenario/how-to-rent-house"; Expected = 200 }
  @{ Path = "/scenario/call-police"; Expected = 200 }
  @{ Path = "/search"; Expected = 200 }
  @{ Path = "/paths"; Expected = 200 }
  @{ Path = "/toolkit"; Expected = 200 }
  @{ Path = "/simulator"; Expected = 200 }
  @{ Path = "/profile"; Expected = 200 }
  @{ Path = "/login"; Expected = 200 }
  @{ Path = "/rent/tools"; Expected = 200 }
  @{ Path = "/rent/tools/evaluate"; Expected = 200 }
  @{ Path = "/rent/tools/analyze"; Expected = 200 }
  @{ Path = "/rent/tools/compare"; Expected = 200 }
  @{ Path = "/rent/tools/report"; Expected = 200 }
  @{ Path = "/rent/tools/result"; Expected = 200 }
  @{ Path = "/design"; Expected = 404 }
  @{ Path = "/dev/cases"; Expected = 404 }
  @{ Path = "/dev/metrics"; Expected = 404 }
)

$workspace = (Get-Location).Path

$job = Start-Job -ArgumentList $workspace -ScriptBlock {
  param($dir)

  Set-Location $dir
  & npm.cmd run start
}

try {
  $ready = $false

  for ($i = 0; $i -lt 20; $i++) {
    $output = Receive-Job -Job $job -Keep | Out-String
    if ($output -match "Ready") {
      $ready = $true
      break
    }

    Start-Sleep -Seconds 1
  }

  if (-not $ready) {
    throw "Server did not become ready within 20 seconds."
  }

  $failures = 0
  $baseUrl = "http://127.0.0.1:3000"

  function Register-Failure {
    param(
      [string]$Message
    )

    Write-Output $Message
    $script:failures++
  }

  foreach ($route in $paths) {
    try {
      $response = Invoke-WebRequest -Uri ($baseUrl + $route.Path) -UseBasicParsing
      $status = [int]$response.StatusCode
    } catch {
      if ($_.Exception.Response) {
        $status = [int]$_.Exception.Response.StatusCode.value__
      } else {
        Register-Failure ("FAIL " + $route.Path + " => ERROR: " + $_.Exception.Message)
        continue
      }
    }

    if ($status -eq $route.Expected) {
      Write-Output ("OK   " + $route.Path + " => " + $status)
    } else {
      Register-Failure ("FAIL " + $route.Path + " => " + $status + " (expected " + $route.Expected + ")")
    }
  }

  $loginResponse = Invoke-WebRequest -Uri ($baseUrl + "/login") -UseBasicParsing
  $loginHtml = [string]$loginResponse.Content

  if (
    $loginHtml.Contains("Supabase") -and
    -not $loginHtml.Contains("name@example.com")
  ) {
    Write-Output "OK   /login content => local demo mode"
  } elseif (
    $loginHtml.Contains("name@example.com")
  ) {
    Write-Output "OK   /login content => cloud sync mode"
  } else {
    Register-Failure "FAIL /login content => did not match local or cloud login mode copy"
  }

  try {
    $callbackResponse = Invoke-WebRequest -Uri ($baseUrl + "/auth/callback?next=/login") -UseBasicParsing -MaximumRedirection 0
    $status = [int]$callbackResponse.StatusCode
    $location = [string]$callbackResponse.Headers["Location"]

    if ($status -ge 300 -and $status -lt 400 -and $location.Contains("/login?login=success")) {
      Write-Output ("OK   /auth/callback?next=/login => " + $status + " -> " + $location)
    } else {
      Register-Failure ("FAIL /auth/callback?next=/login => " + $status + " -> " + $location)
    }
  } catch {
    if (-not $_.Exception.Response) {
      Register-Failure ("FAIL /auth/callback?next=/login => ERROR: " + $_.Exception.Message)
    } else {
      $status = [int]$_.Exception.Response.StatusCode.value__
      $location = [string]$_.Exception.Response.Headers["Location"]

      if ($status -ge 300 -and $status -lt 400 -and $location.Contains("/login?login=success")) {
        Write-Output ("OK   /auth/callback?next=/login => " + $status + " -> " + $location)
      } else {
        Register-Failure ("FAIL /auth/callback?next=/login => " + $status + " -> " + $location)
      }
    }
  }

  try {
    $unsafeCallbackResponse = Invoke-WebRequest -Uri ($baseUrl + "/auth/callback?next=//evil.example/phish") -UseBasicParsing -MaximumRedirection 0
    $status = [int]$unsafeCallbackResponse.StatusCode
    $location = [string]$unsafeCallbackResponse.Headers["Location"]

    if (
      $status -ge 300 -and
      $status -lt 400 -and
      $location.Contains("/profile?login=success") -and
      -not $location.Contains("evil.example")
    ) {
      Write-Output ("OK   /auth/callback?next=//evil.example/phish => " + $status + " -> " + $location)
    } else {
      Register-Failure ("FAIL /auth/callback?next=//evil.example/phish => " + $status + " -> " + $location)
    }
  } catch {
    if (-not $_.Exception.Response) {
      Register-Failure ("FAIL /auth/callback?next=//evil.example/phish => ERROR: " + $_.Exception.Message)
    } else {
      $status = [int]$_.Exception.Response.StatusCode.value__
      $location = [string]$_.Exception.Response.Headers["Location"]

      if (
        $status -ge 300 -and
        $status -lt 400 -and
        $location.Contains("/profile?login=success") -and
        -not $location.Contains("evil.example")
      ) {
        Write-Output ("OK   /auth/callback?next=//evil.example/phish => " + $status + " -> " + $location)
      } else {
        Register-Failure ("FAIL /auth/callback?next=//evil.example/phish => " + $status + " -> " + $location)
      }
    }
  }

  $survivalRequestBody = @{
    targetCity = "shanghai"
    originCity = "合肥"
    graduationDate = "2026-06-30"
    offerStatus = "signed_offer"
    arrivalWindow = "within_2_weeks"
    housingBudget = "3500-4500"
    hukouInterest = "strong_yes"
    currentHousingStatus = "campus"
  } | ConvertTo-Json

  $generatedPlanId = $null

  try {
    $survivalResponse = Invoke-WebRequest `
      -Uri ($baseUrl + "/api/survival-plans") `
      -Method POST `
      -ContentType "application/json; charset=utf-8" `
      -Body $survivalRequestBody `
      -UseBasicParsing

    $survivalStatus = [int]$survivalResponse.StatusCode
    $survivalPayload = $survivalResponse.Content | ConvertFrom-Json

    if (
      $survivalStatus -eq 200 -and
      $survivalPayload.planId -and
      $survivalPayload.plan -and
      $survivalPayload.plan.city -eq "shanghai" -and
      $survivalPayload.plan.fallbackUsed -eq $false -and
      $survivalPayload.plan.supportingSources.Count -gt 0
    ) {
      $generatedPlanId = [string]$survivalPayload.planId
      Write-Output ("OK   POST /api/survival-plans => 200 (" + $generatedPlanId + ")")
    } else {
      Register-Failure "FAIL POST /api/survival-plans => invalid payload structure"
    }
  } catch {
    if ($_.Exception.Response) {
      Register-Failure ("FAIL POST /api/survival-plans => " + $_.Exception.Response.StatusCode.value__)
    } else {
      Register-Failure ("FAIL POST /api/survival-plans => ERROR: " + $_.Exception.Message)
    }
  }

  if ($generatedPlanId) {
    try {
      $routePlanPageResponse = Invoke-WebRequest -Uri ($baseUrl + "/survival-plans/" + $generatedPlanId) -UseBasicParsing
      if ([int]$routePlanPageResponse.StatusCode -eq 200) {
        Write-Output ("OK   /survival-plans/" + $generatedPlanId + " => 200")
      } else {
        Register-Failure ("FAIL /survival-plans/" + $generatedPlanId + " => " + [int]$routePlanPageResponse.StatusCode)
      }
    } catch {
      if ($_.Exception.Response) {
        Register-Failure ("FAIL /survival-plans/" + $generatedPlanId + " => " + $_.Exception.Response.StatusCode.value__)
      } else {
        Register-Failure ("FAIL /survival-plans/" + $generatedPlanId + " => ERROR: " + $_.Exception.Message)
      }
    }

    try {
      $routePlanApiResponse = Invoke-WebRequest -Uri ($baseUrl + "/api/survival-plans/" + $generatedPlanId) -UseBasicParsing
      Register-Failure ("FAIL GET /api/survival-plans/" + $generatedPlanId + " => " + [int]$routePlanApiResponse.StatusCode + " (expected 404 in guest/local mode)")
    } catch {
      if ($_.Exception.Response) {
        $status = [int]$_.Exception.Response.StatusCode.value__

        if ($status -eq 404) {
          Write-Output ("OK   GET /api/survival-plans/" + $generatedPlanId + " => 404 in guest/local mode")
        } else {
          Register-Failure ("FAIL GET /api/survival-plans/" + $generatedPlanId + " => " + $status)
        }
      } else {
        Register-Failure ("FAIL GET /api/survival-plans/" + $generatedPlanId + " => ERROR: " + $_.Exception.Message)
      }
    }
  }

  if ($failures -gt 0) {
    throw ("Smoke routes failed: " + $failures + " route(s) did not match expectations.")
  }

  Write-Output "Smoke routes passed."
} finally {
  Stop-Job $job -ErrorAction SilentlyContinue
  Remove-Job $job -Force -ErrorAction SilentlyContinue
}
