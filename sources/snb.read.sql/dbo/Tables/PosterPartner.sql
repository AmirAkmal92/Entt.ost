CREATE TABLE [dbo].[PosterPartner] (
    [Id]        UNIQUEIDENTIFIER NOT NULL,
    [Name]      NVARCHAR (4000)  NULL,
    [IsForeign] BIT              NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

