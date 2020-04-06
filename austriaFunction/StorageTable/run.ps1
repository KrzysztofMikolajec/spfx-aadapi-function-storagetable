using namespace System.Net

# Input bindings are passed in via param block.
param($Request, $TriggerMetadata)

# Write to the Azure Functions log stream.
Write-Host "PowerShell HTTP trigger function processed a request."

# Interact with query parameters or the body of the request.
$query = $Request.Query.Operation

Import-Module AzTable

$resourceGroup = "austriafunction"
$storageAccount = "austriafunction"

if ($query.Contains("User")){
    $tableName = "Users"
    $partitionKey = "UsersPK"
}
elseif ($query.Contains("Countr")){
    $tableName = "Countries"
    $partitionKey = "CountriesPK"
}

$username = (Get-ChildItem env:APPSETTING_UsernameFromKeyVault).value
$password = ConvertTo-SecureString $((Get-ChildItem env:APPSETTING_PasswordFromKeyVault).value) -AsPlainText -Force

$Credential = New-Object System.Management.Automation.PSCredential($username, $password)

Connect-AzAccount -Credential $Credential -Tenant "08361f24-0049-4b34-836d-bbe6fa68e9fc" -ServicePrincipal
$table = Get-AzTableTable -resourceGroup $resourceGroup -TableName $tableName -storageAccountName $storageAccount

$body = $Request.Body | ConvertFrom-Json
if ($body) {
    switch ($query) {
        "AddUser" {
            $guid = ([guid]::NewGuid().tostring())            
            Add-AzTableRow -table $table -partitionKey $partitionKey -rowKey $guid -property @{"FirstName" = "$($body.FirstName)"; "LastName" = "$($body.LastName)"; "LocationId" = "$($body.LocationId)"}
            $user = Get-AzTableRow -table $table -columnName RowKey -value $guid -operator Equal
            $user | Add-Member -NotePropertyName Status -NotePropertyValue Added
            $body = $user | ConvertTo-Json
         }
        "UpdateUser" {
            $user = Get-AzTableRow -table $table -columnName RowKey -value "$($body.RowKey)" -operator Equal
            $user.FirstName = "$($body.FirstName)"
            $user.LastName = "$($body.LastName)"
            $user.LocationId = "$($body.LocationId)"
            $user | Update-AzTableRow -table $table
            $user = Get-AzTableRow -table $table -columnName RowKey -value "$($body.RowKey)" -operator Equal
            $user | Add-Member -NotePropertyName Status -NotePropertyValue Updated
            $body = $user | ConvertTo-Json
         }
        "ReadUser" { 
            $user = Get-AzTableRow -table $table -columnName RowKey -value "$($body.RowKey)" -operator Equal
            $user | Add-Member -NotePropertyName Status -NotePropertyValue Retrived
            $body = $user | ConvertTo-Json
        }
        "DeleteUser" {
            $user = Get-AzTableRow -table $table -columnName RowKey -value "$($body.RowKey)" -operator Equal
            $user | Remove-AzTableRow -table $table
            $body | Add-Member -NotePropertyName Status -NotePropertyValue Deleted
         }
         "ReadUsers" { 
            $users = Get-AzTableRow -table $table –partitionKey $partitionKey
            $users | Add-Member -NotePropertyName Status -NotePropertyValue Retrived
            $body = $users | ConvertTo-Json
        }
        "AddCountry" {
            $guid = ([guid]::NewGuid().tostring())            
            Add-AzTableRow -table $table -partitionKey $partitionKey -rowKey $guid -property @{"Name" = "$($body.Name)"}
            $country = Get-AzTableRow -table $table -columnName RowKey -value $guid -operator Equal
            $country | Add-Member -NotePropertyName Status -NotePropertyValue Added
            $body = $country | ConvertTo-Json
         }
        "UpdateCountry" {
            $country = Get-AzTableRow -table $table -columnName RowKey -value "$($body.RowKey)" -operator Equal
            $country.Name = "$($body.Name)"
            $country | Update-AzTableRow -table $table
            $country = Get-AzTableRow -table $table -columnName RowKey -value "$($body.RowKey)" -operator Equal
            $country | Add-Member -NotePropertyName Status -NotePropertyValue Updated
            $body = $country | ConvertTo-Json
         }
        "ReadCountry" { 
            $country = Get-AzTableRow -table $table -columnName RowKey -value "$($body.RowKey)" -operator Equal
            $country | Add-Member -NotePropertyName Status -NotePropertyValue Retrived
            $body = $country | ConvertTo-Json
        }
        "DeleteCountry" {
            $country = Get-AzTableRow -table $table -columnName RowKey -value "$($body.RowKey)" -operator Equal
            $country | Remove-AzTableRow -table $table
            $tableName = "Users"
            $partitionKey = "UsersPK"
            $table = Get-AzTableTable -resourceGroup $resourceGroup -TableName $tableName -storageAccountName $storageAccount
            $users = Get-AzTableRow -table $table -columnName LocationId -value "$($body.RowKey)" -operator Equal
            $users | Remove-AzTableRow -table $table
            $body | Add-Member -NotePropertyName Status -NotePropertyValue Deleted
         }
         "ReadCountries" { 
            $countries = Get-AzTableRow -table $table –partitionKey $partitionKey
            $countries | Add-Member -NotePropertyName Status -NotePropertyValue Retrived
            $body = $countries | ConvertTo-Json
        }
        Default { $body = "This HTTP triggered function executed successfully. Pass a correct parameters in the query string and in the request body." }
    }
}
else {
    $body = "This HTTP triggered function executed successfully. Pass a correct parameters in the query string and in the request body."
}

# Associate values to output bindings by calling 'Push-OutputBinding'.
Push-OutputBinding -Name Response -Value ([HttpResponseContext]@{
        StatusCode = [HttpStatusCode]::OK
        Body       = $body
    })





