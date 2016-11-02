
CREATE PROCEDURE [dbo].[usp_NewContractCustomerCurrMonth]  
      @currYear smalldatetime
 AS   

    SET NOCOUNT ON;  
	
DECLARE @month Int
SET @month=MONTH(@currYear)
DECLARE @currYearSelected smalldatetime
SET @currYearSelected=@currYear
SET @currYear = dateadd(month, @month-1, dateadd(yy, datediff(yy, 0, @currYear), 0))

DECLARE @currYear2 smalldatetime

SET @currYear2= dateadd(month, @month, dateadd(yy, datediff(yy, 0, @currYearSelected), 0))

SELECT *
FROM  dbo.uv_NewContractCustomer
WHERE dbo.uv_NewContractCustomer.BillDate BETWEEN @currYear AND @currYear2
ORDER BY dbo.uv_NewContractCustomer.GroupName





