



CREATE FUNCTION [dbo].[GetAddOn] (
    @SerializedAddOns varchar(1000),
	@Code varchar(10)
)
RETURNS Varchar(50)
AS BEGIN

RETURN
stuff(REPLACE(SUBSTRING(@SerializedAddOns, CHARINDEX(@Code,@SerializedAddOns)+11,2 ), ',', ''), 1, 
patindex('%[0-9]%', REPLACE(SUBSTRING(@SerializedAddOns, CHARINDEX(@Code,@SerializedAddOns)+11,2 ), ',', ''))-1, '')  

END



