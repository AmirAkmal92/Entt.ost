CREATE TABLE [Bespoke].[Comment] (
    [Id]             INT            IDENTITY (1, 1) NOT NULL,
    [ErrorId]        CHAR (36)      NOT NULL,
    [Hashed]         CHAR (32)      NOT NULL,
    [How]            VARCHAR (1000) NOT NULL,
    [Suggestion]     VARCHAR (1000) NULL,
    [KeepMeInformed] BIT            NULL,
    [User]           VARCHAR (50)   NOT NULL,
    [DateTime]       SMALLDATETIME  DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_BespokeComment] PRIMARY KEY CLUSTERED ([Id] ASC)
);

