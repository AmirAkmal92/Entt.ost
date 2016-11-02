CREATE TABLE [dbo].[AccountPickupLocation] (
    [Id]             UNIQUEIDENTIFIER NOT NULL,
    [AccountId]      UNIQUEIDENTIFIER NULL,
    [Street1]        NVARCHAR (4000)  NULL,
    [Street2]        NVARCHAR (4000)  NULL,
    [Street3]        NVARCHAR (4000)  NULL,
    [PostCode]       NVARCHAR (4000)  NULL,
    [City]           NVARCHAR (4000)  NULL,
    [StateId]        UNIQUEIDENTIFIER NULL,
    [StateName]      NVARCHAR (4000)  NULL,
    [CountryId]      UNIQUEIDENTIFIER NULL,
    [CountryName]    NVARCHAR (4000)  NULL,
    [ContactName]    NVARCHAR (4000)  NULL,
    [ContactPhoneNo] NVARCHAR (4000)  NULL,
    [Street4]        NVARCHAR (4000)  NULL,
    [Street5]        NVARCHAR (4000)  NULL,
    [StateCode]      NVARCHAR (4000)  NULL,
    [CountryCode]    NVARCHAR (4000)  NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

