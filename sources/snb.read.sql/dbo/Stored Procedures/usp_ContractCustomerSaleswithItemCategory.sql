
CREATE PROCEDURE [dbo].[usp_ContractCustomerSaleswithItemCategory]
      @datefrom smalldatetime,
      @dateto smalldatetime
 AS   

    SET NOCOUNT ON;  


SELECT *
FROM  [dbo].[uv_ContractCustomerSaleswithItemCategory]
WHERE dbo.uv_ContractCustomerSaleswithItemCategory.BillDate BETWEEN @datefrom AND @dateto 
ORDER BY dbo.uv_ContractCustomerSaleswithItemCategory.ProfitCentreCode
