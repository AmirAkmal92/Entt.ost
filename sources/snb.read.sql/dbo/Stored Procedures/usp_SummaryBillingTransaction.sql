


CREATE PROCEDURE [dbo].[usp_SummaryBillingTransaction]
      @datefrom smalldatetime,
      @dateto smalldatetime
 AS   

    SET NOCOUNT ON;  

SELECT *,
 (STUFF((SELECT DISTINCT '@' + CAST(T1.InvoiceAmt  AS VARCHAR(MAX))
     FROM [SnBReadProd].[dbo].[uv_SummaryBillingTransaction]  T1 WHERE T1.AccountNo = T2.AccountNo 
     FOR XML PATH('')),1,1,'')  ) AS InvoiceNo2,
	--   (OldRevenue - CONVERT(NUMERIC(5,2), S01)) AS Revenue
	   (OldRevenue - Gst) AS Revenue
	 --(STUFF((SELECT  DISTINCT  '?' + REPLACE(CONVERT(VARCHAR(20),(T1.InvoiceAmt),1),'##,##0.##',',')
  --   FROM [SnBReadProd].[dbo].[uv_SummaryBillingTransaction]  T1 WHERE T1.AccountNo  = T2.AccountNo  
  --   FOR XML PATH('')),1,1,'')  ) AS InvoiceAmount
FROM  dbo.uv_SummaryBillingTransaction T2
--WHERE T2.BillDate BETWEEN @datefrom AND @dateto 
where T2.BillDate <= DATEADD(day,1,@dateto)  and BillDate >= @datefrom
ORDER BY T2.InvoiceNo




