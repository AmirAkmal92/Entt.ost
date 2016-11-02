CREATE TABLE [dbo].[CompensationTrail] (
    [Id]             UNIQUEIDENTIFIER NOT NULL,
    [CompensationId] UNIQUEIDENTIFIER NULL,
    [Stage]          NVARCHAR (4000)  NULL,
    [DoneById]       UNIQUEIDENTIFIER NULL,
    [DoneByName]     NVARCHAR (4000)  NULL,
    [DoneOn]         DATETIME2 (7)    NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

