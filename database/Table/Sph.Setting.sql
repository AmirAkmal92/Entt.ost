IF OBJECT_ID('Sph.Setting', 'U') IS NOT NULL
  DROP TABLE Sph.Setting
GO

CREATE TABLE Sph.Setting
(
	[Id] VARCHAR(255) PRIMARY KEY NOT NULL
	,[Json] VARCHAR(MAX) NOT NULL
	,[UserName] VARCHAR(255) NULL
	,[Key] VARCHAR(255) NOT NULL
	,[Value] VARCHAR(MAX) NULL
	,[CreatedDate] SMALLDATETIME NOT NULL DEFAULT GETDATE()
	,[CreatedBy] VARCHAR(255) NULL
	,[ChangedDate] SMALLDATETIME NOT NULL DEFAULT GETDATE()
	,[ChangedBy] VARCHAR(255) NULL
)
GO 
