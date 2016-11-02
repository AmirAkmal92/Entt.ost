CREATE TABLE [dbo].[CompanyDirector] (
    [Id]             UNIQUEIDENTIFIER NOT NULL,
    [RegistrationId] UNIQUEIDENTIFIER NULL,
    [Name]           NVARCHAR (4000)  NULL,
    [Nric]           NVARCHAR (4000)  NULL,
    [IsBlackListed]  BIT              NULL,
    [IsCtosListed]   BIT              NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

