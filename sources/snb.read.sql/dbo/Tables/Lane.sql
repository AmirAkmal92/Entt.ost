CREATE TABLE [dbo].[Lane] (
    [Id]              UNIQUEIDENTIFIER NOT NULL,
    [Name]            NVARCHAR (4000)  NULL,
    [IsInternational] BIT              NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

