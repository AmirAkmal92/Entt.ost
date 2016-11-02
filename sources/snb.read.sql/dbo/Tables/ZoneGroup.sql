CREATE TABLE [dbo].[ZoneGroup] (
    [Id]                  UNIQUEIDENTIFIER NOT NULL,
    [SerializedZoneNames] NVARCHAR (4000)  NULL,
    [Name]                NVARCHAR (4000)  NULL,
    [ZoneType]            INT              NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

