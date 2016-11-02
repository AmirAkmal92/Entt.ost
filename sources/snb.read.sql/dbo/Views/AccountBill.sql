
                    create view [dbo].[AccountBill] as 
                        select 
                            coalesce(b.Id, a.Id) as Id,

	                        coalesce(b.Id, '00000000-0000-0000-0000-000000000000') as BillId,
	                        coalesce(b.BillDate, a.NextBillingDate) as BillDate,

	                        coalesce(b.AccountId, a.Id) as AccountId,
	                        coalesce(b.AccountNo, a.AccountNo) as AccountNo,
	                        coalesce(b.AccountName, a.Name) as AccountName,

                            coalesce(b.InvoiceId, '00000000-0000-0000-0000-000000000000') as InvoiceId,	
                            b.InvoiceNo,
	                        coalesce(b.InvoiceAmount, 0) as InvoiceAmount,
	                        coalesce(b.CreditMemoAmount, 0) as CreditMemoAmount,
	                        coalesce(b.DebitMemoAmount, 0) as DebitMemoAmount,
	                        coalesce(b.DiscountAmount, 0) as DiscountAmount,
                            coalesce(b.RebateAmount, 0) as RebateAmount,
						    coalesce(b.NetAmount, 0) as NetAmount,

                            coalesce(b.CycleFrom, dateadd(day, 1,  [LastBillingDate])) as CycleFrom,
                            coalesce(b.CycleTo, a.NextBillingDate) as CycleTo,

						    b.Street1,
						    b.Street2,
						    b.Street3,
						    b.PostCode,
						    b.City,
						    coalesce(b.StateId, '00000000-0000-0000-0000-000000000000') as StateId,
						    b.StateName,
						    coalesce(b.CountryId, '00000000-0000-0000-0000-000000000000') as CountryId,
						    b.CountryName,

                            coalesce(b.IsCompleted, 0) as IsCompleted,
                            coalesce(b.IsManual, 0) as IsManual,
							coalesce(b.PostingStatus, 0) as PostingStatus,

                            coalesce(b.CreatedById, '00000000-0000-0000-0000-000000000000') as CreatedById,
                            b.CreatedByName,
	                        coalesce(b.CreatedOn, '1753-1-1') as CreatedOn,
                            b.ProfitCenterCode as ProfitCenterCode
                        from Account a
                        full join Bill b on a.Id = b.AccountId and a.NextBillingDate = b.BillDate
