USE master
GO

/* =================== Create a new FILESTREAM-enabled database =================== */

-- Create database with FILESTREAM filegroup/container
CREATE DATABASE RxBinaryStore
 ON PRIMARY
  (NAME = RxBinaryStore_data, 
   FILENAME = 'G:\data\RxBinaryStore\RxBinaryStore_data.mdf'),
 FILEGROUP FileStreamGroup1 CONTAINS FILESTREAM
  (NAME = RxBinaryStore_blobs, 
   FILENAME = 'G:\data\RxBinaryStore\Documents')
 LOG ON 
  (NAME = RxBinaryStore_log,
   FILENAME = 'G:\data\RxBinaryStore\RxBinaryStore_log.ldf')
GO

-- Switch to the new database
USE RxBinaryStore
GO

-- Show the database filegroups
SELECT * FROM sys.filegroups

GO


CREATE TABLE dbo.BinaryStore
(
	 [Id] VARCHAR(255) PRIMARY KEY NOT NULL
	,[RowId] uniqueidentifier ROWGUIDCOL NOT NULL UNIQUE DEFAULT NEWSEQUENTIALID()
	,[Extension] VARCHAR(10) NULL
	,[FileName] VARCHAR(255) NULL
	,[Tag] VARCHAR(255) NULL
	,[Content] VARBINARY(MAX) FILESTREAM
)
GO 
