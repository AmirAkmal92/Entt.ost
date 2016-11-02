CREATE TABLE [dbo].[CompensationAttachment] (
    [Id]                           UNIQUEIDENTIFIER NOT NULL,
    [CompensationId]               UNIQUEIDENTIFIER NULL,
    [CompensationAttachmentTypeId] UNIQUEIDENTIFIER NULL,
    [Name]                         NVARCHAR (4000)  NULL,
    [FileName]                     NVARCHAR (4000)  NULL,
    [FileId]                       NVARCHAR (4000)  NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

