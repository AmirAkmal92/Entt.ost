
& .\env.ost.ps1


$erlang = Get-Process -Name erl* | measure
if($erlang.Count -ne 1){
    Start-Process .\rabbitmq_server\sbin\rabbitmq-server.bat
}

$java = Get-Process -Name java* | measure
if($java.Count -ne 1){
    Start-Process .\elasticsearch\bin\elasticsearch.bat
}
ls -Path .\output -Filter "*.*" | Remove-Item


ls -Path .\schedulers -Filter "Ost.*.dll" | Remove-Item
ls -Path .\schedulers -Filter "Ost.*.pdb" | Remove-Item

ls -Path .\subscribers -Filter "Ost.*.dll" | Remove-Item
ls -Path .\subscribers -Filter "Ost.*.pdb" | Remove-Item


ls -Path .\subscribers -Filter "subscriber.trigger.*.dll" | Remove-Item
ls -Path .\subscribers -Filter "subscriber.trigger.*.pdb" | Remove-Item


ls -Path .\subscribers -Filter "workflows.*.dll" | Remove-Item
ls -Path .\subscribers -Filter "workflows.*.pdb" | Remove-Item


ls -Path .\web\bin -Filter "workflows.*.dll" | Remove-Item
ls -Path .\web\bin -Filter "workflows.*.pdb" | Remove-Item


ls -Path .\web\bin -Filter "Ost.*.dll" | Remove-Item
ls -Path .\web\bin -Filter "Ost.*.pdb" | Remove-Item



Start-Process .\tools\sph.builder.exe -Wait



ls -Path .\output -Filter Ost.*.dll | Copy-Item -Destination .\web\bin
ls -Path .\output -Filter Ost.*.pdb | Copy-Item -Destination .\web\bin

ls -Path .\output -Filter Ost.*.dll | Copy-Item -Destination .\subscribers
ls -Path .\output -Filter Ost.*.pdb | Copy-Item -Destination .\subscribers


ls -Path .\output -Filter workflows.*.dll | Copy-Item -Destination .\subscribers
ls -Path .\output -Filter workflows.*.pdb | Copy-Item -Destination .\subscribers

ls -Path .\output -Filter workflows.*.dll | Copy-Item -Destination .\web\bin
ls -Path .\output -Filter workflows.*.pdb | Copy-Item -Destination .\web\bin


ls -Path .\output -Filter "subscriber.trigger.*.dll" | Copy-Item -Destination .\subscribers
ls -Path .\output -Filter "subscriber.trigger.*.pdb" | Copy-Item -Destination .\subscribers

<# from sph to test
copy c:\project\work\sph\bin\tools\sph.builder.exe F:\project\work\entt.ost\tools
copy c:\project\work\sph\bin\tools\sph.builder.pdb F:\project\work\entt.ost\tools
copy c:\project\work\sph\source\domain\domain.sph\bin\Debug\domain.sph.dll F:\project\work\entt.ost\tools
copy c:\project\work\sph\source\domain\domain.sph\bin\Debug\domain.sph.pdb F:\project\work\entt.ost\tools

copy c:\project\work\sph\source\domain\domain.sph\bin\Debug\domain.sph.dll F:\project\work\entt.ost\web\bin
copy c:\project\work\sph\source\domain\domain.sph\bin\Debug\domain.sph.pdb F:\project\work\entt.ost\web\bin

copy C:\project\work\sph\source\functoids\database.lookup\bin\Debug\database.lookup.dll F:\project\work\entt.ost\tools
copy C:\project\work\sph\source\functoids\database.lookup\bin\Debug\database.lookup.pdb F:\project\work\entt.ost\tools
copy C:\project\work\sph\source\functoids\database.lookup\bin\Debug\database.lookup.dll F:\project\work\entt.ost\web\bin
copy C:\project\work\sph\source\functoids\database.lookup\bin\Debug\database.lookup.pdb F:\project\work\entt.ost\web\bin

Start-Process .\tools\sph.builder.exe -ArgumentList @(".\sources\TransformDefinition\soc-to-snb-sales-order.json")

#>
