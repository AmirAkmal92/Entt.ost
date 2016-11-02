
CREATE PROCEDURE [dbo].[usp_SummaryProductandPPL]
      @datefrom smalldatetime,
      @dateto smalldatetime
 AS   

    SET NOCOUNT ON;  

SELECT *,
 (STUFF((SELECT DISTINCT ',' + CAST(T1.Name  AS VARCHAR(200))
     FROM [SnBReadProd].[dbo].[uv_AverageRevperItem]  T1 WHERE T1.ProfitCenterCode = T2.ProfitCentreCode
     FOR XML PATH('')),1,1,'')  ) AS Name2,
 (STUFF((SELECT DISTINCT ',' + CAST(T1.ProductCode  AS VARCHAR(200))
     FROM [SnBReadProd].[dbo].[uv_AverageRevperItem]  T1 WHERE T1.ProfitCenterCode  = T2.ProfitCenterCode
     FOR XML PATH('')),1,1,'')  ) AS ProducCode2,
 (STUFF((SELECT DISTINCT ',' + CAST(T1.ProductDec  AS VARCHAR(200))
     FROM [SnBReadProd].[dbo].[uv_AverageRevperItem]  T1 WHERE T1.ProfitCenterCode = T2.ProfitCenterCode 
     FOR XML PATH('')),1,1,'')  ) AS ProductDec2,
  (STUFF((SELECT DISTINCT ',' + 
  CAST(T1.ProductCode  AS VARCHAR(200)) + '-' + Cast(T1.CountValue as Varchar(10)) 
     FROM [SnBReadProd].[dbo].[uv_AverageRevperItem]  T1 WHERE T1.ProfitCenterCode = T2.ProfitCenterCode
     FOR XML PATH('')),1,1,'')  ) AS CountProduct,
 (OldRevenue - Gst) AS Revenue  
FROM  [dbo].[uv_AverageRevperItem] T2
where T2.BillDate <DATEADD(day,1,@dateto) and T2.BillDate >= @datefrom
ORDER BY T2.ProfitCenterCode



