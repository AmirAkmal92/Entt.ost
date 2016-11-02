


CREATE VIEW [dbo].[uv_GetServicesCharges]
AS

SELECT        ROW_NUMBER() OVER (PARTITION BY d.Id
ORDER BY d.Id ASC) AS Position,   ROW_NUMBER() OVER (PARTITION BY a.Id
ORDER BY a.Id ASC) AS Position2
,IIF(ROW_NUMBER() OVER (PARTITION BY a.Id
ORDER BY a.Id ASC) = '1' , a.NetValue, 0) as Revenue2,IIF(ROW_NUMBER() OVER (PARTITION BY d.Id
ORDER BY d.Id ASC) = '1' , d.ChargeTotal, 0) as Revenue
, a.Id AS SalesOrderId, d.Id AS ConsignmentId, a.ProfitCentreCode , e.Name, e.SapCode, 1 AS Volume, b.GrandTotal AS Revenue3, e.Description, a.CreatedOn as BillDate, e.IsInternational, d.ItemCategoryName, b.GrandTotal, d.Gst, d.ItemValue, e.ParentProductCode,
[dbo].[GetAddOn_ServiceCharges]([SerializedAddOns],'S01') as S01 ,[dbo].[GetAddOn_ServiceCharges]([SerializedAddOns],'S02') as S02 ,[dbo].[GetAddOn_ServiceCharges]([SerializedAddOns],'S03') as S03,
[dbo].[GetAddOn_ServiceCharges]([SerializedAddOns],'S04') as S04,[dbo].[GetAddOn_ServiceCharges]([SerializedAddOns],'S05') as S05,[dbo].[GetAddOn_ServiceCharges]([SerializedAddOns],'S06') as S06,
[dbo].[GetAddOn_ServiceCharges]([SerializedAddOns],'S07') as S07,[dbo].[GetAddOn_ServiceCharges]([SerializedAddOns],'S08') as S08,[dbo].[GetAddOn_ServiceCharges]([SerializedAddOns],'S09') as S09,
[dbo].[GetAddOn_ServiceCharges]([SerializedAddOns],'S10') as S10
,(SELECT        bb.Name
      FROM            dbo.State AS cc, dbo.Branch bb
      WHERE        (a.ProfitCentreCode = bb.ProfitCentreCode AND cc.Id = b.StateId)) AS PPLName,  
	  1 AS Number, e.KeyFeatured, d.ProductCode,e.Description AS ProductDec, a.ProfitCentreCode AS ProfitCenterCode, b.StateId , st.Name as State, ac.AccountNo, ac.Name AS AccountName
 
FROM                     dbo.SalesOrder AS a INNER JOIN
                         dbo.Invoice AS b ON a.InvoiceId = b.Id INNER JOIN
                         dbo.Consignment AS d ON b.Id = d.InvoiceId INNER JOIN
						 dbo.Account as ac ON ac.AccountNo=b.AccountNo INNER JOIN --Tambah to cater Service Charges
                         dbo. Product AS e ON d .ProductId = e.Id  CROSS JOIN
						 dbo.Branch as br CROSS JOIN
						 dbo.State as st  
						
WHERE         a.ProfitCentreCode =br.ProfitCentreCode and b.StateId=st.id  and e.Code = d.ProductCode 
GROUP BY e.SapCode, e.Description, b.CreatedOn , e.Name,a.ProfitCentreCode, 
a.ProfitCentreCode,  e.KeyFeatured, d.ProductCode, e.Description, b.GrandTotal,
 a.Id, e.IsInternational, d.ItemCategoryName, b.GrandTotal, d.Gst, 
d.ItemValue,d.Id,br.StateId,a.CreatedOn,b.StateId, a.NetValue,d.ChargeTotal,st.Name, e.ParentProductCode, b.SerializedAddOns, ac.AccountNo, ac.Name



--SELECT 
--[SnBReadProd].[dbo].GetAddOn([SerializedAddOns],'S02') as S02,
--[SnBReadProd].[dbo].GetAddOn([SerializedAddOns],'S03') as S03,
--[SnBReadProd].[dbo].GetAddOn([SerializedAddOns],'S04') as S04,
--[SnBReadProd].[dbo].GetAddOn([SerializedAddOns],'S05') as S05
--FROM [SnBReadProd].[dbo].[Invoice]






















