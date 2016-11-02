



CREATE VIEW [dbo].[uv_NewContractCustomer]
AS
SELECT
 ROW_NUMBER() OVER (PARTITION BY d.InvoiceId 
ORDER BY d.InvoiceId ASC) AS Position,
 ROW_NUMBER() OVER (PARTITION BY a.Name 
ORDER BY a.Name ASC) AS Position2,
IIF(ROW_NUMBER() OVER (PARTITION BY  d.InvoiceId
ORDER BY d.InvoiceId  ASC) = '1' , c.GrandTotal, 0) as Revenue,
a.accountno,count(c.accountid) as volume,category,
a.status, b.name as branchname,b.profitcentrecode,'Posting' as groupname,c.CreatedOn  as billdate,c.GrandTotal as InvoiceAmount ,a.Name as AccountName,a.createdon as billdate2
from Account a, 
	branch b, 
	Invoice c, 
	Consignment d, 
	product e
where  a.id in (select distinct accountid from Invoice) and a.branchid=b.id and c.accountid=a.id 
and  c.Id=d.InvoiceId and d.ProductId=e.Id 
group by a.accountno,a.category,a.status,--,a.CreatedOn,
--b.profitcentrecode,b.name,c.CreatedOn ,c.accountno,b.id,c.GrandTotal,a.Name,a.Id,e.Code,d.InvoiceId
  b.profitcentrecode,b.name,c.CreatedOn ,c.accountno,b.id,c.GrandTotal,a.Name,a.Id,e.Code,d.InvoiceId,a.createdon

UNION 
SELECT
99 as Position,'' As Position2, 0 as Revenue, a.accountno,count(a.id) as volume,category,status,b.name as branchname,b.profitcentrecode,'Registered' as groupname,
a.createdon as billdate,'0' as InvoiceAmount,a.Name as AccountName, a.createdon as billdate2
from Account a, branch b
where a.id not in( select distinct accountid from invoice) and a.branchid=b.id 
Group by a.accountno,category,status, a.branchid,b.name,b.profitcentrecode,a.CreatedOn,a.Name













