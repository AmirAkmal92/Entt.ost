CREATE TABLE [dbo].[Memo] (
    [Id]            UNIQUEIDENTIFIER NOT NULL,
    [RefNo]         NVARCHAR (4000)  NULL,
    [NoteId]        UNIQUEIDENTIFIER NULL,
    [AccountId]     UNIQUEIDENTIFIER NULL,
    [MemoType]      INT              NULL,
    [NetValue]      DECIMAL (19, 5)  NULL,
    [BillId]        UNIQUEIDENTIFIER NULL,
    [CreatedById]   UNIQUEIDENTIFIER NULL,
    [CreatedByName] NVARCHAR (4000)  NULL,
    [CreatedOn]     DATETIME2 (7)    NULL,
    [PostingStatus] INT              NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

