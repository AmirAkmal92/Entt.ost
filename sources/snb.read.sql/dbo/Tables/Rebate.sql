﻿CREATE TABLE [dbo].[Rebate] (
    [Id]                        UNIQUEIDENTIFIER NOT NULL,
    [SerializedApplicableZones] NVARCHAR (4000)  NULL,
    [SerializedItemCategories]  NVARCHAR (4000)  NULL,
    [ItemCategoriesCsv]         NVARCHAR (4000)  NULL,
    [SerializedDiscountTiers]   NVARCHAR (4000)  NULL,
    [GroupId]                   UNIQUEIDENTIFIER NULL,
    [GroupName]                 NVARCHAR (4000)  NULL,
    [ProductId]                 UNIQUEIDENTIFIER NULL,
    [ProductCode]               NVARCHAR (4000)  NULL,
    [ValidFrom]                 DATETIME2 (7)    NULL,
    [ValidTo]                   DATETIME2 (7)    NULL,
    [RebateCycle]               INT              NULL,
    [UseNetUsage]               BIT              NULL,
    [UseWeight]                 BIT              NULL,
    [UseItemCount]              BIT              NULL,
    [CreatedOn]                 DATETIME2 (7)    NULL,
    [CreatedById]               UNIQUEIDENTIFIER NULL,
    [CreatedByName]             NVARCHAR (4000)  NULL,
    [SubmittedOn]               DATETIME2 (7)    NULL,
    [SubmittedById]             UNIQUEIDENTIFIER NULL,
    [SubmittedByName]           NVARCHAR (4000)  NULL,
    [VerifiedOn]                DATETIME2 (7)    NULL,
    [VerifiedById]              UNIQUEIDENTIFIER NULL,
    [VerifiedByName]            NVARCHAR (4000)  NULL,
    [Status]                    INT              NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

