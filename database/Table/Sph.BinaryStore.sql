IF OBJECT_ID('Sph.BinaryStore', 'U') IS NOT NULL
  DROP TABLE Sph.BinaryStore
GO

CREATE TABLE Sph.BinaryStore
(
	 [Id] VARCHAR(255) PRIMARY KEY NOT NULL
	,[Extension] VARCHAR(10) NULL
	,[FileName] VARCHAR(255) NULL
	,[Tag] VARCHAR(255) NULL
	,[Content] VARBINARY(MAX)
)
GO 
