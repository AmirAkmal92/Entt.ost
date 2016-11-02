CREATE TABLE [dbo].[_zoneNames] (
    [zonegroup_key] UNIQUEIDENTIFIER NOT NULL,
    [id]            NVARCHAR (255)   NULL,
    CONSTRAINT [FK2E61D897C86F3A70] FOREIGN KEY ([zonegroup_key]) REFERENCES [dbo].[ZoneGroup] ([Id]),
    CONSTRAINT [FK7DC49F1976F2D7F4] FOREIGN KEY ([zonegroup_key]) REFERENCES [dbo].[ZoneGroup] ([Id])
);

