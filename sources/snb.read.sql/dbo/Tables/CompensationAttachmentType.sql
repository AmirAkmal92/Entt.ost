CREATE TABLE [dbo].[CompensationAttachmentType] (
    [Id]          UNIQUEIDENTIFIER NOT NULL,
    [Name]        NVARCHAR (4000)  NULL,
    [ForStaff]    BIT              NULL,
    [ForUnitHead] BIT              NULL,
    [ForFinance]  BIT              NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

