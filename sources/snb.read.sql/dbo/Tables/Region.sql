CREATE TABLE [dbo].[Region] (
    [Id]                UNIQUEIDENTIFIER NOT NULL,
    [Name]              NVARCHAR (4000)  NULL,
    [GeneralLedgerId]   UNIQUEIDENTIFIER NULL,
    [GeneralLedgerCode] NVARCHAR (4000)  NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

