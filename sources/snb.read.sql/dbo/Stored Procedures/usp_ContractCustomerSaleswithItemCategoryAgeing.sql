


CREATE PROCEDURE [dbo].[usp_ContractCustomerSaleswithItemCategoryAgeing]
      @datefrom smalldatetime,
      @dateto smalldatetime 
 AS   

    SET NOCOUNT ON;  


SELECT *,
Sum(case when a.BillDate BETWEEN dateadd(month, Month(getdate())-1, dateadd(yy, datediff(yy, 0, getdate()), 0)) AND getdate()  then 1 else 0 end) as [Ageing - Current],
Sum(case when a.BillDate BETWEEN dateadd(day,-30,@dateto) AND dateadd(day,-60,@dateto)  then 1 else 0 end) as [Ageing >1 month],
Sum(case when a.BillDate BETWEEN dateadd(day,-60,@dateto) AND dateadd(day,-90,@dateto)  then 1 else 0 end) as [Ageing >2 month],
Sum(case when a.BillDate BETWEEN dateadd(day,-90,@dateto) AND dateadd(day,-120,@dateto)  then 1 else 0 end) as [Ageing >3 month],
Sum(case when a.BillDate BETWEEN dateadd(day,-120,@dateto) AND dateadd(day,-150,@dateto)  then 1 else 0 end) as [Ageing >4 month],
Sum(case when a.BillDate BETWEEN dateadd(day,-150,@dateto) AND dateadd(day,-180,@dateto)  then 1 else 0 end) as [Ageing >5 month],
Sum(case when a.BillDate BETWEEN dateadd(day,-180,@dateto) AND dateadd(day,-330,@dateto)  then 1 else 0 end) as [Ageing 6-11 month],
Sum(case when a.BillDate BETWEEN dateadd(day,-365,@dateto) AND dateadd(day,-750,@dateto)  then 1 else 0 end) as [Ageing 12-23 month],
Sum(case when a.BillDate BETWEEN dateadd(day,-750,@dateto) AND dateadd(day,-1095,@dateto)  then 1 else 0 end) as [Ageing >24 month],
Sum(case when a.BillDate BETWEEN dateadd(day,-1095,@dateto) AND dateadd(day,-2555,@dateto)  then 1 else 0 end) as [Ageing >36 month],
Sum(case when a.BillDate < dateadd(day,-2555,@dateto) then 1 else 0 end) as [Ageing >84 Month]

--Sum(case when a.BillDate >= dateadd(day,-60,@dateto) then 1 else 0 end) as [Ageing 30-60 days],
--Sum(case when a.BillDate >= dateadd(day,-90,@dateto) then 1 else 0 end) as [Ageing 60-90 days],
--Sum(case when a.BillDate >= dateadd(day,-120,@dateto) then 1 else 0 end) as [Ageing 90-120 days],
--Sum(case when a.BillDate >= dateadd(day,-150,@dateto) then 1 else 0 end) as [Ageing 150-180 days],
--Sum(case when a.BillDate >= dateadd(day,-330,@dateto) then 1 else 0 end) as [Ageing 180-330 days],
--Sum(case when a.BillDate BETWEEN dateadd(day,-365,@dateto) AND dateadd(day,-30,@dateto)  then 1 else 0 end) as [Ageing 1-365 days],
--Sum(case when a.BillDate BETWEEN dateadd(day,-365,@dateto) and dateadd(day,-750,@dateto)  then 1 else 0 end) as [Ageing 365-750 days],
--Sum(case when a.BillDate <= dateadd(day,-750,@dateto) then 1 else 0 end) as [More than 750 days]
FROM  [dbo].[uv_ContractCustomerSaleswithItemCategory] a
WHERE a.BillDate BETWEEN @datefrom AND @dateto 
GROUP BY a.Position,
a.Revenue,
a.ConsignmentId,
a.ProfitCentreCode,
a.Name,
a.SapCode,
a.Volume,
a.InvoiceAmount,
a.ChargeTotal,
a.Description,
a.BillDate,
a.State,
a.PPLName,
a.Number,
a.KeyFeatured,
a.ProductCode,
a.ProductDec,
a.AccountName,
a.AccountNo,
a.itemcategory,
a.InvoiceId,
a.ActualWeight,
a.Gst,
a.CountryCode,
a.CountryId,
a.Industry,
a.CompanyType,
a.IsInternational,
a.ZoneName,
a.StateId,
a.Position2,
a.Revenue2,
a.SalesOrderId,
a.GrandTotal,
a.ItemValue,
a.ProfitCenterCode,
a.AccountType,
a.NetWeight,
a.ParentProductCode,
a.S01,
a.CreditLimit,
a.Position3,
a.BaseRateTotal
ORDER BY a.ProfitCentreCode



