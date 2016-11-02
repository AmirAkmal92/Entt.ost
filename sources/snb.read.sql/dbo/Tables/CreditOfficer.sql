CREATE TABLE [dbo].[CreditOfficer] (
    [Id]      UNIQUEIDENTIFIER NOT NULL,
    [Name]    NVARCHAR (4000)  NULL,
    [Email]   NVARCHAR (4000)  NULL,
    [PhoneNo] NVARCHAR (4000)  NULL,
    [FaxNo]   NVARCHAR (4000)  NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

