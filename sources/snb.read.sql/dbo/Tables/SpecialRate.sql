﻿CREATE TABLE [dbo].[SpecialRate] (
    [Id]                  UNIQUEIDENTIFIER NOT NULL,
    [SerializedRateZones] TEXT             NULL,
    [AccountId]           UNIQUEIDENTIFIER NULL,
    [AccountNo]           NVARCHAR (4000)  NULL,
    [AccountName]         NVARCHAR (4000)  NULL,
    [MonthlyTarget]       DECIMAL (19, 5)  NULL,
    [WeightScaleFrom]     DECIMAL (19, 5)  NULL,
    [WeightScaleTo]       DECIMAL (19, 5)  NULL,
    [RefNo]               NVARCHAR (4000)  NULL,
    [ValidFrom]           DATETIME2 (7)    NULL,
    [ValidTo]             DATETIME2 (7)    NULL,
    [ProductId]           UNIQUEIDENTIFIER NULL,
    [ProductCode]         NVARCHAR (4000)  NULL,
    [ItemCategoryId]      UNIQUEIDENTIFIER NULL,
    [ItemCategoryName]    NVARCHAR (4000)  NULL,
    [ScaleType]           INT              NULL,
    [ZoneGroupId]         UNIQUEIDENTIFIER NULL,
    [ZoneGroupName]       NVARCHAR (4000)  NULL,
    [ZoneDefinitionId]    UNIQUEIDENTIFIER NULL,
    [ZoneDefinitionName]  NVARCHAR (4000)  NULL,
    [CurrencyId]          UNIQUEIDENTIFIER NULL,
    [CurrencyName]        NVARCHAR (4000)  NULL,
    [Status]              INT              NULL,
    [CreatedOn]           DATETIME2 (7)    NULL,
    [CreatedById]         UNIQUEIDENTIFIER NULL,
    [CreatedByName]       NVARCHAR (4000)  NULL,
    [SubmittedOn]         DATETIME2 (7)    NULL,
    [SubmittedById]       UNIQUEIDENTIFIER NULL,
    [SubmittedByName]     NVARCHAR (4000)  NULL,
    [VerifiedOn]          DATETIME2 (7)    NULL,
    [VerifiedById]        UNIQUEIDENTIFIER NULL,
    [VerifiedByName]      NVARCHAR (4000)  NULL,
    [MonthlyTargetType]   INT              NULL,
    [RevertedOn]          DATETIME2 (7)    NULL,
    [RevertedById]        UNIQUEIDENTIFIER NULL,
    [RevertedByName]      NVARCHAR (255)   NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

