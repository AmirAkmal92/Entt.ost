CREATE TABLE [dbo].[CompensationTrail_20160614] (
    [Id]             CHAR (36)      NOT NULL,
    [CompensationId] CHAR (36)      NULL,
    [Stage]          VARCHAR (4000) NULL,
    [DoneById]       CHAR (36)      NULL,
    [DoneByName]     VARCHAR (4000) NULL,
    [DoneOn]         VARCHAR (27)   NULL
);

