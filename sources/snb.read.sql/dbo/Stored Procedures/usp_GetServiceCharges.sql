


CREATE PROCEDURE [dbo].[usp_GetServiceCharges]
      @datefrom smalldatetime,
      @dateto smalldatetime
 AS   

    SET NOCOUNT ON;  


SELECT *
FROM  [dbo].[uv_GetServicesCharges]
WHERE dbo.uv_GetServicesCharges.BillDate BETWEEN @datefrom AND @dateto 
ORDER BY dbo.uv_GetServicesCharges.ProfitCentreCode


