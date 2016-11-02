CREATE TABLE [dbo].[RegistrationTrail] (
    [Id]             UNIQUEIDENTIFIER NOT NULL,
    [RegistrationId] UNIQUEIDENTIFIER NULL,
    [Stage]          INT              NULL,
    [DoneById]       UNIQUEIDENTIFIER NULL,
    [DoneByName]     NVARCHAR (4000)  NULL,
    [DoneOn]         DATETIME2 (7)    NULL,
    [Result]         INT              NULL,
    [Comment]        NVARCHAR (4000)  NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

