﻿CREATE TABLE [dbo].[Note] (
    [Id]                 UNIQUEIDENTIFIER NOT NULL,
    [RefNo]              NVARCHAR (4000)  NULL,
    [NoteType]           INT              NULL,
    [Difference]         DECIMAL (19, 5)  NULL,
    [InvoiceId]          UNIQUEIDENTIFIER NULL,
    [InvoiceNo]          NVARCHAR (4000)  NULL,
    [AccountId]          UNIQUEIDENTIFIER NULL,
    [AccountNo]          NVARCHAR (4000)  NULL,
    [AccountName]        NVARCHAR (4000)  NULL,
    [DisputeTypeId]      UNIQUEIDENTIFIER NULL,
    [DisputeTypeName]    NVARCHAR (4000)  NULL,
    [CustomerComment]    NVARCHAR (4000)  NULL,
    [NoteTrailComment]   NVARCHAR (4000)  NULL,
    [Stage]              INT              NULL,
    [Result]             INT              NULL,
    [NetValue]           DECIMAL (19, 5)  NULL,
    [AttachmentFileId]   NVARCHAR (4000)  NULL,
    [AttachmentFileName] NVARCHAR (4000)  NULL,
    [BatchId]            UNIQUEIDENTIFIER NULL,
    [BatchRefNo]         NVARCHAR (4000)  NULL,
    [IsRecommended]      BIT              NULL,
    [CreatedById]        UNIQUEIDENTIFIER NULL,
    [CreatedByName]      NVARCHAR (4000)  NULL,
    [CreatedOn]          DATETIME2 (7)    NULL,
    [UpdatedOn]          DATETIME2 (7)    NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

