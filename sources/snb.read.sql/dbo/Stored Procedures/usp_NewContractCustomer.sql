
CREATE PROCEDURE [dbo].[usp_NewContractCustomer]  
      @currYear smalldatetime
 AS   

    SET NOCOUNT ON;  

DECLARE @currYearSelected smalldatetime
SET @currYearSelected=@currYear
SET @currYear = dateadd(month, 3, dateadd(yy, datediff(yy, 0, @currYear), 0))
DECLARE @month Int
DECLARE @currYear2 smalldatetime
SET @month=MONTH(CURRENT_TIMESTAMP)
SET @currYear2= dateadd(month, @month, dateadd(yy, datediff(yy, 0, @currYearSelected), 0))
SELECT *
FROM  dbo.uv_NewContractCustomer
WHERE dbo.uv_NewContractCustomer.BillDate BETWEEN @currYear AND @currYear2
ORDER BY dbo.uv_NewContractCustomer.Groupname



