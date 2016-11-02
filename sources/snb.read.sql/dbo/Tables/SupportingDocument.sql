CREATE TABLE [dbo].[SupportingDocument] (
    [Id]                        UNIQUEIDENTIFIER NOT NULL,
    [Name]                      NVARCHAR (4000)  NULL,
    [IsOptional]                BIT              NULL,
    [ForBerhad]                 BIT              NULL,
    [ForSendirianBerhad]        BIT              NULL,
    [ForEnterprisePerseorangan] BIT              NULL,
    [ForEnterprisePerkongsian]  BIT              NULL,
    [ForKerajaanBadanBerkanun]  BIT              NULL,
    [Order]                     FLOAT (53)       NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

