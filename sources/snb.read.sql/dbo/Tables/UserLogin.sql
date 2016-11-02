CREATE TABLE [dbo].[UserLogin] (
    [Id]                     UNIQUEIDENTIFIER NOT NULL,
    [Username]               NVARCHAR (4000)  NULL,
    [Password]               VARBINARY (MAX)  NULL,
    [UserGroupIdsSerialized] NVARCHAR (4000)  NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

