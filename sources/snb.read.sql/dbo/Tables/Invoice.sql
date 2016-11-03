CREATE TABLE [dbo].[Invoice] (
    [Id]                   UNIQUEIDENTIFIER NOT NULL,
    [SerializedAddOns]     NVARCHAR (4000)  NULL,
    [InvoiceNo]            NVARCHAR (4000)  NULL,
    [AccountId]            UNIQUEIDENTIFIER NULL,
    [AccountNo]            NVARCHAR (4000)  NULL,
    [AccountName]          NVARCHAR (4000)  NULL,
    [BaseRateTotal]        DECIMAL (19, 5)  NULL,
    [GrandTotal]           DECIMAL (19, 5)  NULL,
    [BillId]               UNIQUEIDENTIFIER NULL,
    [CreatedOn]            DATETIME2 (7)    NULL,
    [StateId]              UNIQUEIDENTIFIER NULL,
    [BillingPostingStatus] INT              NULL,
    [FromDate]             DATETIME2    NULL,
    [ToDate]               DATETIME2    NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

