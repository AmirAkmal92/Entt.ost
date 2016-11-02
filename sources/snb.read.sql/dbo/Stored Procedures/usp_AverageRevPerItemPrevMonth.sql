





CREATE PROCEDURE [dbo].[usp_AverageRevPerItemPrevMonth]
      @currYear smalldatetime
 AS   

    SET NOCOUNT ON;  

--DECLARE @currYear smalldatetime
--SET @currYear = '2016-2-1'
DECLARE @currYearSelected smalldatetime
SET @currYearSelected=@currYear
--SET @currYear = dateadd(month, 3, dateadd(yy, datediff(yy, 0, @currYear), 0))
DECLARE @month Int
DECLARE @currYear2 smalldatetime
--SET @month=MONTH(CURRENT_TIMESTAMP)
SET @month= MONTH(@currYear)
SET @currYear2= dateadd(month, @month-1, dateadd(yy, datediff(yy, 0, @currYearSelected), 0))
SET @currYear=DATEADD(month, -1, @currYear)
SET @currYear2=DATEADD(month, -1, @currYear2)

--SELECT *
--SELECT *,dbo.GetAddOn([SerializedValueAddedServices],'V06') as V06,dbo.GetAddOn([SerializedValueAddedServices],'V07') as V07
  SELECT *,dbo.GetAddOn([SerializedValueAddedServices],'V06') as V06,dbo.GetAddOn([SerializedValueAddedServices],'V07') as V07, 
  IIF(dbo.GetAddOn([SerializedValueAddedServices],'V06') > 0 , 1,0) AS Checker6, IIF(dbo.GetAddOn([SerializedValueAddedServices],'V07') > 0 , 1,0) AS Checker7,
(OldRevenue - Gst) AS Revenue
FROM  dbo.uv_AverageRevperItem
WHERE dbo.uv_AverageRevperItem.BillDate BETWEEN @currYear AND EOMONTH (@currYear2)
ORDER BY dbo.uv_AverageRevperItem.SapCode

--select @month,@currYear,@currYear2,EOMONTH (@currYear2)











