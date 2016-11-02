CREATE TABLE [dbo].[Sbu] (
    [Id]              UNIQUEIDENTIFIER NOT NULL,
    [Name]            NVARCHAR (4000)  NULL,
    [IsInternational] BIT              NULL,
    [AccountTypes]    NVARCHAR (4000)  NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

