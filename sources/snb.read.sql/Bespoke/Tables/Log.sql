CREATE TABLE [Bespoke].[Log] (
    [LogId]    INT           IDENTITY (1, 1) NOT NULL,
    [Id]       VARCHAR (50)  NOT NULL,
    [Severity] VARCHAR (50)  NULL,
    [Computer] VARCHAR (255) NOT NULL,
    [Hashed]   CHAR (32)     NOT NULL,
    [Message]  VARCHAR (555) NOT NULL,
    [Content]  VARCHAR (MAX) NOT NULL,
    [Time]     SMALLDATETIME NOT NULL,
    CONSTRAINT [PK_Log] PRIMARY KEY CLUSTERED ([LogId] ASC)
);

