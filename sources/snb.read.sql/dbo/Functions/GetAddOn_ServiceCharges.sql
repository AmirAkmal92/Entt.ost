


CREATE FUNCTION [dbo].[GetAddOn_ServiceCharges] (
    @SerializedAddOns varchar(1000),
	@Code varchar(10)
)
RETURNS Decimal(5,2)
AS BEGIN

RETURN
Cast(stuff(REPLACE(SUBSTRING(@SerializedAddOns, CHARINDEX(@Code,@SerializedAddOns)+11,5 ), ',', ''), 1, 
patindex('%[0-9]%', REPLACE(SUBSTRING(@SerializedAddOns, CHARINDEX(@Code,@SerializedAddOns)+11,5 ), ',', ''))-1, '')  as Decimal(5,2))

END


