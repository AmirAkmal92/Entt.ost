CREATE TABLE [dbo].[ItemCategory] (
    [Id]       UNIQUEIDENTIFIER NOT NULL,
    [Sequence] INT              NULL,
    [Name]     NVARCHAR (4000)  NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

