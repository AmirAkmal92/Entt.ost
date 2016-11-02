CREATE TABLE [dbo].[NoteTrail] (
    [Id]         UNIQUEIDENTIFIER NOT NULL,
    [NoteId]     UNIQUEIDENTIFIER NULL,
    [Stage]      INT              NULL,
    [DoneById]   UNIQUEIDENTIFIER NULL,
    [DoneByName] NVARCHAR (4000)  NULL,
    [DoneOn]     DATETIME2 (7)    NULL,
    [Comment]    NVARCHAR (4000)  NULL,
    [note_key]   UNIQUEIDENTIFIER NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK9BBA756AD3545C47] FOREIGN KEY ([note_key]) REFERENCES [dbo].[Note] ([Id]),
    CONSTRAINT [FKA46F2CDC1C91ECE6] FOREIGN KEY ([note_key]) REFERENCES [dbo].[Note] ([Id])
);

