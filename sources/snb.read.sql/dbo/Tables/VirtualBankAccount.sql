CREATE TABLE [dbo].[VirtualBankAccount] (
    [Id]        UNIQUEIDENTIFIER NOT NULL,
    [Number]    NVARCHAR (4000)  NULL,
    [AccountId] UNIQUEIDENTIFIER NULL,
    [AccountNo] NVARCHAR (4000)  NULL,
    [BankId]    UNIQUEIDENTIFIER NULL,
    [BankCode]  NVARCHAR (4000)  NULL,
    [Company]   NVARCHAR (255)   NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

