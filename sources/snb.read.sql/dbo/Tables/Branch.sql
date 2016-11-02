CREATE TABLE [dbo].[Branch] (
    [Id]                       UNIQUEIDENTIFIER NOT NULL,
    [SerializedPostCodeRanges] NVARCHAR (4000)  NULL,
    [Code]                     NVARCHAR (4000)  NULL,
    [Name]                     NVARCHAR (4000)  NULL,
    [ProfitCentreCode]         NVARCHAR (4000)  NULL,
    [State]                    NVARCHAR (4000)  NULL,
    [Type]                     NVARCHAR (4000)  NULL,
    [LinkCentreCode]           NCHAR (10)       NULL,
    [StateId]                  NCHAR (100)      NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

