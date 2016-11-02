CREATE TABLE [dbo].[BillingJob] (
    [Id]                 UNIQUEIDENTIFIER NOT NULL,
    [BillDate]           DATETIME2 (7)    NULL,
    [FinnishDate]        DATETIME2 (7)    NULL,
    [AllCount]           INT              NULL,
    [BilledCount]        INT              NULL,
    [PendingAutoCount]   INT              NULL,
    [PendingManualCount] INT              NULL,
    [InvoicedTotal]      DECIMAL (19, 5)  NULL,
    [IsCompleted]        BIT              NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

