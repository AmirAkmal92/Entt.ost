CREATE TABLE [Bespoke].[Attachment] (
    [Id]        INT             IDENTITY (1, 1) NOT NULL,
    [Hashed]    CHAR (32)       NOT NULL,
    [Content]   VARBINARY (MAX) NOT NULL,
    [Extension] CHAR (5)        NULL,
    [FileName]  VARCHAR (50)    NOT NULL,
    CONSTRAINT [PK_BespokeAttachment] PRIMARY KEY CLUSTERED ([Id] ASC)
);

