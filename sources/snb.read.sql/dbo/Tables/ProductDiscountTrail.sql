﻿CREATE TABLE [dbo].[ProductDiscountTrail] (
    [Id]                UNIQUEIDENTIFIER NOT NULL,
    [ProductDiscountId] UNIQUEIDENTIFIER NULL,
    [Status]            INT              NULL,
    [DoneById]          UNIQUEIDENTIFIER NULL,
    [DoneByName]        NVARCHAR (4000)  NULL,
    [DoneOn]            DATETIME2 (7)    NULL,
    [Comment]           NVARCHAR (4000)  NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);
