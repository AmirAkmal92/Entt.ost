CREATE TABLE [dbo].[User] (
    [Id]                     UNIQUEIDENTIFIER NOT NULL,
    [Username]               NVARCHAR (4000)  NULL,
    [FullName]               NVARCHAR (4000)  NULL,
    [Email]                  NVARCHAR (4000)  NULL,
    [UserGroupIdsSerialized] NVARCHAR (4000)  NULL,
    [RolesSerialized]        NVARCHAR (4000)  NULL,
    [SbuAccessSerialized]    NVARCHAR (4000)  NULL,
    [BranchAccessSerialized] NVARCHAR (4000)  NULL,
    [StateAccessSerialized]  NVARCHAR (4000)  NULL,
    [RegionAccessSerialized] NVARCHAR (4000)  NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

