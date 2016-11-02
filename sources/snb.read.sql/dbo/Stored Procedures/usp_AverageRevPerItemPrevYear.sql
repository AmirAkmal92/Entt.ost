




CREATE PROCEDURE [dbo].[usp_AverageRevPerItemPrevYear]
      @currYear smalldatetime
 AS   

    SET NOCOUNT ON;  

--DECLARE  @currYear smalldatetime
DECLARE  @currYear3 smalldatetime
DECLARE  @endmonth smalldatetime
DECLARE  @aprilfirstday smalldatetime
DECLARE  @aprilfirstlastyear smalldatetime
--SET @currYear ='2016-3-1'
SET @aprilfirstday  =dateadd(month, 3, dateadd(yy, datediff(yy, 0, @currYear), 0)) 
DECLARE @month Int
DECLARE @currYearFirstMonth smalldatetime
SET @currYearFirstMonth =dateadd(month, 0, dateadd(yy, datediff(yy, 0, @currYear), 0))
SET @aprilfirstlastyear = CAST (DATEADD(YEAR, -1, @currYear) + (CAST (@currYear as INT) - CAST (DATEADD(YEAR, -1, @currYear) AS INT)) % 7 AS DATE)
SET @aprilfirstlastyear = dateadd(month, 3, dateadd(yy, datediff(yy, 0, @aprilfirstlastyear), 0))

SET @currYear3 =  @aprilfirstday  
SET @endmonth = IIF(@currYear < @aprilfirstday  , DATEADD(month, ((YEAR(@currYear) - 1900) * 12) + MONTH(@currYear), -1) , EOMONTH (@currYear) ) 
SET @currYear3 = IIF(@currYear < @aprilfirstday , @aprilfirstlastyear  , @aprilfirstday  ) 
SET @currYear3 = CAST (DATEADD(YEAR, -2, @currYear) + (CAST (@currYear as INT) - CAST (DATEADD(YEAR, -2, @currYear) AS INT)) % 7 AS DATE)
SET @currYear3  = dateadd(month, 3, dateadd(yy, datediff(yy, 0, @currYear3), 0))
SET @endmonth = CAST (DATEADD(YEAR, -1, @currYear) + (CAST (@currYear as INT) - CAST (DATEADD(YEAR, -1, @currYear) AS INT)) % 7 AS DATE)
SET @endmonth=EOMONTH (@endmonth ) 

 --SELECT *
 --SELECT *,dbo.GetAddOn([SerializedValueAddedServices],'V06') as V06,dbo.GetAddOn([SerializedValueAddedServices],'V07') as V07
   SELECT *,dbo.GetAddOn([SerializedValueAddedServices],'V06') as V06,dbo.GetAddOn([SerializedValueAddedServices],'V07') as V07, 
  IIF(dbo.GetAddOn([SerializedValueAddedServices],'V06') > 0 , 1,0) AS Checker6, IIF(dbo.GetAddOn([SerializedValueAddedServices],'V07') > 0 , 1,0) AS Checker7,
  (OldRevenue - Gst) AS Revenue
		FROM  dbo.uv_AverageRevperItem
		WHERE dbo.uv_AverageRevperItem.BillDate BETWEEN @currYear3 AND @endmonth
		ORDER BY dbo.uv_AverageRevperItem.SapCode




