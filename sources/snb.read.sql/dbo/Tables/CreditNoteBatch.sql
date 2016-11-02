CREATE TABLE [dbo].[CreditNoteBatch] (
    [Id]                UNIQUEIDENTIFIER NOT NULL,
    [RefNo]             NVARCHAR (4000)  NULL,
    [CreditTotal]       DECIMAL (19, 5)  NULL,
    [Stage]             INT              NULL,
    [ApprovalLevel]     INT              NULL,
    [IsApproved]        BIT              NULL,
    [CreatedById]       UNIQUEIDENTIFIER NULL,
    [CreatedByName]     NVARCHAR (4000)  NULL,
    [CreatedOn]         DATETIME2 (7)    NULL,
    [UpdatedOn]         DATETIME2 (7)    NULL,
    [SerializedNoteIds] NVARCHAR (4000)  NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

