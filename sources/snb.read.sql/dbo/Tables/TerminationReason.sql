CREATE TABLE [dbo].[TerminationReason] (
    [Id]   UNIQUEIDENTIFIER NOT NULL,
    [Text] NVARCHAR (4000)  NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

