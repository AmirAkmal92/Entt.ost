




CREATE PROCEDURE [dbo].[usp_AverageRevPerItemCurrMonth]
      @currYear smalldatetime
 AS   

    SET NOCOUNT ON;  

--DECLARE @currYear smalldatetime
--SET @currYear = '2016-2-1'
DECLARE @month Int
SET @month=MONTH(@currYear)
DECLARE @currYearSelected smalldatetime
SET @currYearSelected=@currYear
SET @currYear = dateadd(month, @month-1, dateadd(yy, datediff(yy, 0, @currYear), 0))

DECLARE @currYear2 smalldatetime

SET @currYear2= dateadd(month, @month, dateadd(yy, datediff(yy, 0, @currYearSelected), 0))

--SELECT *
--SELECT *,dbo.GetAddOn([SerializedValueAddedServices],'V06') as V06,dbo.GetAddOn([SerializedValueAddedServices],'V07') as V07
  SELECT *,dbo.GetAddOn([SerializedValueAddedServices],'V06') as V06,dbo.GetAddOn([SerializedValueAddedServices],'V07') as V07, 
  IIF(dbo.GetAddOn([SerializedValueAddedServices],'V06') > 0 , 1,0) AS Checker6, IIF(dbo.GetAddOn([SerializedValueAddedServices],'V07') > 0 , 1,0) AS Checker7,
  (OldRevenue - Gst) AS Revenue
FROM  dbo.uv_AverageRevperItem
WHERE dbo.uv_AverageRevperItem.BillDate BETWEEN @currYear AND EOMONTH (@currYear)
ORDER BY dbo.uv_AverageRevperItem.SapCode

--select @currYear,@currYear2,EOMONTH (@currYear)




