CREATE TABLE [dbo].[RequiredDocument] (
    [Id]                     UNIQUEIDENTIFIER NOT NULL,
    [SupportingDocumentName] NVARCHAR (4000)  NULL,
    [RegistrationId]         UNIQUEIDENTIFIER NULL,
    [SupportingDocumentId]   UNIQUEIDENTIFIER NULL,
    [FileId]                 NVARCHAR (4000)  NULL,
    [FileName]               NVARCHAR (4000)  NULL,
    [IsSubmitted]            BIT              NULL,
    [DocumentCompleted]      BIT              NULL,
    [Order]                  FLOAT (53)       NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

