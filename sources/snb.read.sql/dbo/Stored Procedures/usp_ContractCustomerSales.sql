
CREATE PROCEDURE [dbo].[usp_ContractCustomerSales]
      @datefrom smalldatetime,
      @dateto smalldatetime
 AS   

    SET NOCOUNT ON;  


SELECT *
FROM  [dbo].[uv_ContractCustomerSales]
WHERE dbo.uv_ContractCustomerSales.BillDate BETWEEN @datefrom AND @dateto 
ORDER BY dbo.uv_ContractCustomerSales.ProfitCentreCode
