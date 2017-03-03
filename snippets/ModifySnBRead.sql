ALTER TABLE [dbo].[ValueAddedService]
    ADD [Ost] BIT NULL;
GO

UPDATE [dbo].[ValueAddedService]
SET [Ost] = 1
WHERE [Code] IN ('V11', 'V01')
GO

UPDATE [dbo].[ValueAddedService]
SET [Ost] = 0
WHERE [Code] NOT IN ('V11', 'V01')
GO

ALTER TABLE [dbo].[Product]
    ADD [Ost]         BIT           NULL,
        [MinWeight]   FLOAT (53)    NULL,
        [MaxWeight]   FLOAT (53)    NULL,
        [DeliverySla] VARCHAR (255) NULL;
GO

UPDATE[dbo].[Product]
SET [Ost] = 1,
	[MinWeight] = 0.001,
	[MaxWeight] = 30.000,
 	[DeliverySla] = '11 DAY'
WHERE[SapCode] = '80000001'
GO

UPDATE[dbo].[Product]
SET [Ost] = 1,
	[MinWeight] = 0.001,
	[MaxWeight] = 30.000,
 	[DeliverySla] = '1 DAY'
WHERE[SapCode] = '80000000'
GO