﻿CREATE TABLE [dbo].[Surcharge] (
    [Id]                   UNIQUEIDENTIFIER NOT NULL,
    [SerializedUserInputs] NVARCHAR (4000)  NULL,
    [Name]                 NVARCHAR (4000)  NULL,
    [Code]                 NVARCHAR (4000)  NULL,
    [PrsCode]              NVARCHAR (4000)  NULL,
    [ValidFrom]            DATETIME2 (7)    NULL,
    [ValidTo]              DATETIME2 (7)    NULL,
    [IsLocked]             BIT              NULL,
    [FormulaPosition]      INT              NULL,
    [Formula]              NVARCHAR (4000)  NULL,
    [GeneralLedgerId]      UNIQUEIDENTIFIER NULL,
    [GeneralLedgerCode]    NVARCHAR (4000)  NULL,
    [SbuId]                UNIQUEIDENTIFIER NULL,
    [SbuName]              NVARCHAR (4000)  NULL,
    [CreatedOn]            DATETIME2 (7)    NULL,
    [CreatedById]          UNIQUEIDENTIFIER NULL,
    [CreatedByName]        NVARCHAR (4000)  NULL,
    [IsSpecial]            BIT              NULL,
    [GeneralLedgerName]    NVARCHAR (4000)  NULL,
    [GstCode]              NVARCHAR (4000)  NULL,
    [IsGST]                BIT              NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

