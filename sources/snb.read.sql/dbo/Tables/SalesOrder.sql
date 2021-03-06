﻿CREATE TABLE [dbo].[SalesOrder] (
    [Id]                   UNIQUEIDENTIFIER NOT NULL,
    [CreatedOn]            DATETIME2 (7)    NULL,
    [UpdatedOn]            DATETIME2 (7)    NULL,
    [Status]               INT              NULL,
    [RefNo]                NVARCHAR (4000)  NULL,
    [AccountId]            UNIQUEIDENTIFIER NULL,
    [AccountNo]            NVARCHAR (4000)  NULL,
    [AccountName]          NVARCHAR (4000)  NULL,
    [MasterAccountNo]      NVARCHAR (4000)  NULL,
    [GroupId]              UNIQUEIDENTIFIER NULL,
    [BranchId]             UNIQUEIDENTIFIER NULL,
    [BranchCode]           NVARCHAR (4000)  NULL,
    [BranchName]           NVARCHAR (4000)  NULL,
    [ProfitCentreCode]     NVARCHAR (4000)  NULL,
    [Pl9No]                NVARCHAR (4000)  NULL,
    [AcceptanceOriginId]   UNIQUEIDENTIFIER NULL,
    [AcceptanceOriginName] NVARCHAR (4000)  NULL,
    [AcceptedOn]           DATETIME2 (7)    NULL,
    [InvoiceId]            UNIQUEIDENTIFIER NULL,
    [InvoiceNo]            NVARCHAR (4000)  NULL,
    [NetValue]             DECIMAL (19, 5)  NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

