CREATE TABLE [dbo].[Payment] (
    [Id]        UNIQUEIDENTIFIER NOT NULL,
    [AccountId] UNIQUEIDENTIFIER NULL,
    [Amount]    DECIMAL (19, 5)  NULL,
    [PaidOn]    DATETIME2 (7)    NULL,
    [RefNo]     NVARCHAR (4000)  NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

