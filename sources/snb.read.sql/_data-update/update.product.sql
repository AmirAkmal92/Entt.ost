/*
Post-Deployment Script Template							
--------------------------------------------------------------------------------------
 This file contains SQL statements that will be appended to the build script.		
 Use SQLCMD syntax to include a file in the post-deployment script.			
 Example:      :r .\myfile.sql								
 Use SQLCMD syntax to reference a variable in the post-deployment script.		
 Example:      :setvar TableName MyTable							
               SELECT * FROM [$(TableName)]					
--------------------------------------------------------------------------------------
*/

UPDATE [dbo].[Product]
SET [Ost] = 1
WHERE [Code] IN ('PLD1001','PLD1006','PLD1007','PMI3002','PMI2003','PMI2004')


GO
UPDATE [dbo].[Product]
SET MinWeight = 0.001,
MaxWeight = 30,
 [DeliverySla] = '1 DAY'
WHERE [Code] = 'PLD1001'

GO

UPDATE [dbo].[Product]
SET MinWeight = 5,
MaxWeight = 30,
 [DeliverySla] = '5 DAYS'
WHERE [Code] = 'PLD1006'

GO

UPDATE [dbo].[Product]
SET MinWeight = 5,
MaxWeight = 30,
 [DeliverySla] = '3 DAYS'
WHERE [Code] = 'PLD1007'

GO
UPDATE [dbo].[Product]
SET MinWeight = 0.001,
MaxWeight = 30,
 [DeliverySla] = '2 - 11 DAYS'
WHERE [Code] = 'PMI3002'

GO
UPDATE [dbo].[Product]
SET MinWeight = 1,
MaxWeight = 30,
 [DeliverySla] = '5 - 16 DAYS'
WHERE [Code] = 'PMI2003'

GO
UPDATE [dbo].[Product]
SET MinWeight = 1,
MaxWeight = 30,
 [DeliverySla] = '3 - 16 WEEKS'
WHERE [Code] = 'PMI2004'

GO

UPDATE [dbo].[ValueAddedService]
SET [Ost] = 1
WHERE [Code] IN ('V11', 'V08','V02','V01')