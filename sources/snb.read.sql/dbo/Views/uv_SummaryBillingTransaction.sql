


CREATE VIEW [dbo].[uv_SummaryBillingTransaction]
AS
SELECT        
ROW_NUMBER() OVER (PARTITION BY b.id
ORDER BY b.id ASC) AS Position, ROW_NUMBER() OVER (PARTITION BY d.id
ORDER BY d.id ASC) AS Position2, IIF(ROW_NUMBER() OVER (PARTITION BY d.Id
ORDER BY d.Id ASC) = '1', d.ChargeTotal, 0) AS OldRevenue,
 a.Id AS SalesOrderId, d.Id AS ConsignmentId, a.ProfitCentreCode AS ProfitCenterCode , e.Name, e.SapCode, 
 IIF(e.ParentProductCode in ('PLP200', 'PLE300') ,  d.NetWeight , 1) AS Volume, 
 b.GrandTotal AS Revenue3, e.Description, a.CreatedOn as BillDate, e.IsInternational, d.ItemCategoryName, b.GrandTotal, d.Gst, d.ItemValue, e.ParentProductCode
,(SELECT        bb.Name
      FROM            dbo.State AS cc, dbo.Branch bb
      WHERE        (a.ProfitCentreCode = bb.ProfitCentreCode AND cc.Id = b.StateId)) AS PPL,  
	  1 AS Number, e.KeyFeatured, d.ProductCode,e.Description AS ProductDec, br.StateId , st.Name as State, a.AccountName, a.AccountNo, b.InvoiceNo, 
	  ( b.InvoiceNo + ' - (RM ' + REPLACE(CONVERT(VARCHAR(20),(CAST(b.GrandTotal AS MONEY)),1),'##,##0.##',',')) + ')' as InvoiceAmt, d.NetWeight,

	  IIF(Cast([dbo].[GetAddOn_ServiceCharges]([SerializedAddOns],'S01') as Integer)  >0  , CAST([dbo].[GetAddOn_ServiceCharges]([SerializedAddOns],'S01') as Decimal(5,2) ),0) as S01
 
FROM                     dbo.SalesOrder AS a INNER JOIN
                         dbo.Invoice AS b ON a.InvoiceId = b.Id INNER JOIN
                         dbo.Consignment AS d ON b.Id = d.InvoiceId INNER JOIN
                         dbo. Product AS e ON d .ProductId = e.Id  CROSS JOIN
						 dbo.Branch as br CROSS JOIN
						 dbo.State as st  
						
WHERE         a.ProfitCentreCode =br.ProfitCentreCode and br.StateId=st.id  and e.Code = d.ProductCode 
GROUP BY e.SapCode, e.Description, b.CreatedOn , e.Name,a.ProfitCentreCode, 
a.ProfitCentreCode,  e.KeyFeatured, d.ProductCode, e.Description, b.GrandTotal,
 a.Id, e.IsInternational, d.ItemCategoryName, b.GrandTotal, d.Gst, 
d.ItemValue,d.Id,br.StateId,a.CreatedOn,b.StateId, a.NetValue,d.ChargeTotal,st.Name,d.ChargeTotal,
e.Id,a.AccountName, a.AccountNo, b.InvoiceNo, b.Id,SerializedAddOns, d.NetWeight, e.ParentProductCode






















