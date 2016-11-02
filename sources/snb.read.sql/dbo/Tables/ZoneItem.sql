CREATE TABLE [dbo].[ZoneItem] (
    [Id]                    UNIQUEIDENTIFIER NOT NULL,
    [ZoneDefinitionId]      UNIQUEIDENTIFIER NULL,
    [SenderPostCodeBegin]   INT              NULL,
    [SenderPostCodeEnd]     INT              NULL,
    [ReceiverPostCodeBegin] INT              NULL,
    [ReceiverPostCodeEnd]   INT              NULL,
    [SenderCountry]         NVARCHAR (4000)  NULL,
    [ReceiverCountry]       NVARCHAR (4000)  NULL,
    [ZoneName]              NVARCHAR (4000)  NULL,
    [ValidFrom]             DATETIME2 (7)    NULL,
    [ValidTo]               DATETIME2 (7)    NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

