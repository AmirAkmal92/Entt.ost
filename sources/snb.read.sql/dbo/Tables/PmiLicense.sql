CREATE TABLE [dbo].[PmiLicense] (
    [Id]        UNIQUEIDENTIFIER NOT NULL,
    [AccountId] UNIQUEIDENTIFIER NULL,
    [Code]      NVARCHAR (4000)  NULL,
    [CreatedOn] DATETIME2 (7)    NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

