CREATE TABLE [Dispute].[NoteDocument] (
    [Id]          INT              IDENTITY (1, 1) NOT NULL,
    [NoteId]      UNIQUEIDENTIFIER NOT NULL,
    [DoneById]    UNIQUEIDENTIFIER NULL,
    [Description] VARCHAR (255)    NULL,
    [DoneByName]  VARCHAR (255)    NULL,
    [DoneOn]      SMALLDATETIME    DEFAULT (getdate()) NOT NULL,
    [FileName]    VARCHAR (255)    NOT NULL,
    [Content]     VARBINARY (MAX)  NOT NULL,
    [Extension]   CHAR (5)         NULL,
    CONSTRAINT [PK_DisputeAttachment] PRIMARY KEY CLUSTERED ([Id] ASC)
);

