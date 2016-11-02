CREATE TABLE [dbo].[CompensationType] (
    [Id]                UNIQUEIDENTIFIER NOT NULL,
    [Name]              NVARCHAR (4000)  NULL,
    [GeneralLedgerId]   UNIQUEIDENTIFIER NULL,
    [GeneralLedgerCode] NVARCHAR (4000)  NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

