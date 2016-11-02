


CREATE  VIEW [dbo].[uv_ContractCustomerSaleswithItemCategory]
AS

SELECT        
ROW_NUMBER() OVER (PARTITION BY d.Id
ORDER BY d.Id ASC) AS Position,   
ROW_NUMBER() OVER (PARTITION BY a.Id
ORDER BY a.Id ASC) AS Position2,
ROW_NUMBER() OVER (PARTITION BY ac.Id
ORDER BY ac.Id ASC) AS Position3,

IIF(ROW_NUMBER() OVER (PARTITION BY a.Id
ORDER BY a.Id ASC) = '1' , a.NetValue, 0) as Revenue2,
IIF(ROW_NUMBER() OVER (PARTITION BY d.Id
ORDER BY d.Id ASC) = '1' , d.ChargeTotal, 0) as Revenue,
--IIF(ROW_NUMBER() OVER (PARTITION BY ac.Id
--ORDER BY ac.Id ASC) = '1' , ac.AccountNo, 0) as AccountNoPosition,

a.Id AS SalesOrderId, d.Id AS ConsignmentId, a.ProfitCentreCode , e.Name, e.SapCode, b.GrandTotal AS InvoiceAmount, e.Description, a.CreatedOn as BillDate, e.IsInternational, d.ItemCategoryName AS ItemCategory, b.GrandTotal, d.Gst, d.ItemValue,b.BaseRateTotal,
IIF(e.ParentProductCode in ('PLP200', 'PLE300') ,  d.NetWeight , 1) AS Volume,
(SELECT      distinct  ind.Name  
      FROM            dbo.Industry  AS ind, dbo.Account acc
      WHERE acc.AccountNo=a.AccountNo  and ind.Id =acc.IndustryId  )  as Industry, ac.creditlimit,
(SELECT      distinct  bi.CountryId  
      FROM            dbo.Invoice  AS inv, dbo.Bill bi
      WHERE inv.AccountNo=bi.AccountNo and bi.InvoiceId =b.Id ) as CountryId,
(SELECT     distinct   bi.CountryName 
      FROM            dbo.Invoice AS cy, dbo.Bill bi
      WHERE cy.InvoiceNo =bi.InvoiceNo  and bi.InvoiceId=b.Id   )      AS CountryCode
,(SELECT        bb.Name
      FROM            dbo.State AS cc, dbo.Branch bb
      WHERE        (a.ProfitCentreCode = bb.ProfitCentreCode AND cc.Id = b.StateId)) AS PPLName,  
	  1 AS Number, e.KeyFeatured, d.ProductCode,e.Description AS ProductDec, a.ProfitCentreCode AS ProfitCenterCode, b.StateId , st.Name as State,ac.CompanyType,d.ChargeTotal , ac.AccountType,d.ZoneName, ac.AccountNo, ac.Name AS AccountName, d.ActualWeight, b.Id AS InvoiceId, d.NetWeight, e.ParentProductCode,

	  --Add on 17 Oct 2016 - To cater amount before GST
	  IIF(Cast([dbo].[GetAddOn_ServiceCharges]([SerializedAddOns],'S01') as Integer)  >0  , CAST([dbo].[GetAddOn_ServiceCharges]([SerializedAddOns],'S01') as Decimal(5,2) ),0) as S01

	  --IIF(Cast([dbo].[GetAddOn_ServiceCharges]([SerializedAddOns],'S03') as Integer)  >0  , CAST([dbo].[GetAddOn_ServiceCharges]([SerializedAddOns],'S03') as Decimal(5,2) ),0) as S03,
	  --IIF(Cast([dbo].[GetAddOn_ServiceCharges]([SerializedAddOns],'S04') as Integer)  >0  , CAST([dbo].[GetAddOn_ServiceCharges]([SerializedAddOns],'S04') as Decimal(5,2) ),0) as S04,
	  --IIF(Cast([dbo].[GetAddOn_ServiceCharges]([SerializedAddOns],'S05') as Integer)  >0  , CAST([dbo].[GetAddOn_ServiceCharges]([SerializedAddOns],'S05') as Decimal(5,2) ),0) as S05,
	  --IIF(Cast([dbo].[GetAddOn_ServiceCharges]([SerializedAddOns],'S06') as Integer)  >0  , CAST([dbo].[GetAddOn_ServiceCharges]([SerializedAddOns],'S06') as Decimal(5,2) ),0) as S06,

	  --IIF(Cast([dbo].[GetAddOn_ServiceCharges]([SerializedAddOns],'S02') as Integer)  >0  , CAST([dbo].[GetAddOn_ServiceCharges]([SerializedAddOns],'S02') as Decimal(5,2) ),0) as S02,
	  --IIF(Cast([dbo].[GetAddOn_ServiceCharges]([SerializedAddOns],'S07') as Integer)  >0  , CAST([dbo].[GetAddOn_ServiceCharges]([SerializedAddOns],'S07') as Decimal(5,2) ),0) as S07,
	  --IIF(Cast([dbo].[GetAddOn_ServiceCharges]([SerializedAddOns],'S08') as Integer)  >0  , CAST([dbo].[GetAddOn_ServiceCharges]([SerializedAddOns],'S08') as Decimal(5,2) ),0) as S08,
	  --IIF(Cast([dbo].[GetAddOn_ServiceCharges]([SerializedAddOns],'S09') as Integer)  >0  , CAST([dbo].[GetAddOn_ServiceCharges]([SerializedAddOns],'S09') as Decimal(5,2) ),0) as S09,
	  --IIF(Cast([dbo].[GetAddOn_ServiceCharges]([SerializedAddOns],'S10') as Integer)  >0  , CAST([dbo].[GetAddOn_ServiceCharges]([SerializedAddOns],'S10') as Decimal(5,2) ),0) as S10,
	  --IIF(Cast([dbo].[GetAddOn_ServiceCharges]([SerializedAddOns],'S11') as Integer)  >0  , CAST([dbo].[GetAddOn_ServiceCharges]([SerializedAddOns],'S11') as Decimal(5,2) ),0) as S11
 
FROM                     dbo.SalesOrder AS a INNER JOIN
                         dbo.Invoice AS b ON a.InvoiceId = b.Id INNER JOIN
                         dbo.Consignment AS d ON b.Id = d.InvoiceId INNER JOIN
						 dbo.Account AS ac ON ac.AccountNo=b.AccountNo INNER JOIN
                         dbo. Product AS e ON d .ProductId = e.Id  CROSS JOIN
						 dbo.Branch as br CROSS JOIN
						 dbo.State as st  
						
WHERE         a.ProfitCentreCode =br.ProfitCentreCode and b.StateId=st.id 
   and e.Code = d.ProductCode 
GROUP BY e.SapCode, e.Description, b.CreatedOn , e.Name,a.ProfitCentreCode, 
a.ProfitCentreCode,  e.KeyFeatured, d.ProductCode, e.Description, b.GrandTotal,
 a.Id, e.IsInternational, d.ItemCategoryName, b.GrandTotal, d.Gst, 
d.ItemValue,d.Id,br.StateId,a.CreatedOn,b.StateId, a.NetValue,d.ChargeTotal,st.Name,ac.AccountType,d.ZoneName,ac.CompanyType,d.ChargeTotal,b.InvoiceNo,b.Id,a.AccountNo,d.InvoiceId, 
ac.AccountNo, ac.Name, d.ActualWeight, b.Id, SerializedAddOns, d.NetWeight, e.ParentProductCode,b.BaseRateTotal,
ac.creditlimit, ac.Id



