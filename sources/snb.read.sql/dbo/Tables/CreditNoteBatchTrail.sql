CREATE TABLE [dbo].[CreditNoteBatchTrail] (
    [Id]                UNIQUEIDENTIFIER NOT NULL,
    [CreditNoteBatchId] UNIQUEIDENTIFIER NULL,
    [Stage]             INT              NULL,
    [DoneById]          UNIQUEIDENTIFIER NULL,
    [DoneByName]        NVARCHAR (4000)  NULL,
    [DoneOn]            DATETIME2 (7)    NULL,
    [Comment]           NVARCHAR (4000)  NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

