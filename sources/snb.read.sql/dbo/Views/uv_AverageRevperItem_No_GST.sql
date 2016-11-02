
CREATE VIEW [dbo].[uv_AverageRevperItem_No_GST]
AS

SELECT        ROW_NUMBER() OVER (PARTITION BY d.Id
ORDER BY d.Id ASC) AS Position,   ROW_NUMBER() OVER (PARTITION BY a.Id
ORDER BY a.Id ASC) AS Position2
,IIF(ROW_NUMBER() OVER (PARTITION BY a.Id
ORDER BY a.Id ASC) = '1' , a.NetValue, 0) as Revenue2,
IIF(ROW_NUMBER() OVER (PARTITION BY d.Id
ORDER BY d.Id ASC) = '1' , d.ChargeTotal, 0) as Revenue

, a.Id AS SalesOrderId, d.Id AS ConsignmentId, a.ProfitCentreCode , e.Name, e.SapCode, 1 AS Volume, b.GrandTotal AS Revenue3, e.Description, a.CreatedOn as BillDate, e.IsInternational, d.ItemCategoryName, b.GrandTotal, d.Gst, d.ItemValue, e.ParentProductCode
--,(SELECT        bb.Name
--      FROM            dbo.State AS cc, dbo.Branch bb
--      WHERE        (a.ProfitCentreCode = bb.ProfitCentreCode AND cc.Id = b.StateId)) AS PPLName,  
--	  1 AS Number, e.KeyFeatured, d.ProductCode,e.Description AS ProductDec, a.ProfitCentreCode AS ProfitCenterCode, b.StateId , st.Name as State, d.SerializedValueAddedServices, d.SerializedSurcharges, d.NetWeight,
--	  [dbo].[GetAddOn_ServiceCharges]([SerializedAddOns],'S01') as S01
 
FROM                     dbo.SalesOrder AS a INNER JOIN
                         dbo.Invoice AS b ON a.InvoiceId = b.Id INNER JOIN
                         dbo.Consignment AS d ON b.Id = d.InvoiceId INNER JOIN
                         dbo. Product AS e ON d .ProductId = e.Id  CROSS JOIN
						 dbo.Branch as br CROSS JOIN
						 dbo.State as st  
						
WHERE         a.ProfitCentreCode =br.ProfitCentreCode and b.StateId=st.id  and e.Code = d.ProductCode 
GROUP BY e.SapCode, e.Description, b.CreatedOn , e.Name,a.ProfitCentreCode, 
a.ProfitCentreCode,  e.KeyFeatured, d.ProductCode, e.Description, b.GrandTotal,
 a.Id, e.IsInternational, d.ItemCategoryName, b.GrandTotal, d.Gst, 
d.ItemValue,d.Id,br.StateId,a.CreatedOn,b.StateId, a.NetValue,d.ChargeTotal,st.Name, e.ParentProductCode, d.SerializedValueAddedServices, d.SerializedSurcharges, d.NetWeight, b.SerializedAddOns




























