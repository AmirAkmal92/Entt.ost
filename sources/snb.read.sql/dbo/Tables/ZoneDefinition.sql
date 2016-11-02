CREATE TABLE [dbo].[ZoneDefinition] (
    [Id]          UNIQUEIDENTIFIER NOT NULL,
    [ZoneGroupId] UNIQUEIDENTIFIER NULL,
    [Name]        NVARCHAR (4000)  NULL,
    [ZoneType]    INT              NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

