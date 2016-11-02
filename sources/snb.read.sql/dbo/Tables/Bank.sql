﻿CREATE TABLE [dbo].[Bank] (
    [Id]   UNIQUEIDENTIFIER NOT NULL,
    [Code] NVARCHAR (4000)  NULL,
    [Name] NVARCHAR (4000)  NULL,
    [Text] NVARCHAR (4000)  NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

