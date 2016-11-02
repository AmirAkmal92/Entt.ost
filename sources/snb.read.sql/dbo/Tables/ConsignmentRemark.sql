CREATE TABLE [dbo].[ConsignmentRemark] (
    [Id]     UNIQUEIDENTIFIER NOT NULL,
    [Text]   NVARCHAR (4000)  NULL,
    [Status] INT              NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

