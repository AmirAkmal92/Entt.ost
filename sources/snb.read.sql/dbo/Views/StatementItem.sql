                
                    create view [dbo].[StatementItem] as 
                        select Id, AccountId, CreatedOn, InvoiceNo as 'RefNo', 0 as 'TransactionType', GrandTotal as 'Amount' 
	                        from Invoice
                        union all
                        select Id, AccountId, CreatedOn, RefNo, case MemoType when 0 then 1 else 2 end as 'TransactionType', case MemoType when 0 then NetValue*-1 else NetValue end as Amount 
	                        from Memo
                        union all
                        select Id, Id as 'AccountId', CreatedOn, AccountNo as 'RefNo', 3 as 'TransactionType', DepositAmount as 'Amount' 
	                        from Account 
	                        where DepositAmount is not null and DepositAmount <> 0
                        union all
                        select Id, AccountId, PaidOn as 'CreatedOn', RefNo, 4 as 'TransactionType', Amount*-1 
	                        from Payment
                        union all
                        select da.Id, ac.Id as 'AccountId', da.ReceivedOn as 'CreatedOn', da.TransactionNo as 'RefNo', 5 as 'TransactionType', da.Amount*-1
	                        from DepositAcceptance da
		                        inner join Account ac on da.RegistrationId=ac.RegistrationId
