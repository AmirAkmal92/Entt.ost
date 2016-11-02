﻿CREATE TABLE [dbo].[SettingsStore] (
    [Id]    UNIQUEIDENTIFIER NOT NULL,
    [Key]   NVARCHAR (4000)  NULL,
    [Value] NVARCHAR (4000)  NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

