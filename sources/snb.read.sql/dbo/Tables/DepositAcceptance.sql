CREATE TABLE [dbo].[DepositAcceptance] (
    [Id]             UNIQUEIDENTIFIER NOT NULL,
    [RegistrationId] UNIQUEIDENTIFIER NULL,
    [PaymentMethod]  INT              NULL,
    [ReceivedBy]     UNIQUEIDENTIFIER NULL,
    [ReceivedOn]     DATETIME2 (7)    NULL,
    [TransactionNo]  NVARCHAR (4000)  NULL,
    [BankId]         UNIQUEIDENTIFIER NULL,
    [BankName]       NVARCHAR (4000)  NULL,
    [BankAccountNo]  NVARCHAR (4000)  NULL,
    [PaymentDate]    DATETIME2 (7)    NULL,
    [Amount]         DECIMAL (19, 5)  NULL,
    [Comment]        NVARCHAR (4000)  NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

