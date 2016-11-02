
CREATE VIEW [dbo].[uv_ContractCustomerSales]
AS
SELECT        a.ProfitCentreCode  , e.Name, e.SapCode, COUNT(e.SapCode) AS Volume, SUM(b.GrandTotal) AS Revenue, e.Description, b.CreatedOn AS BillDate,
                          st.Name  AS State, st.Id AS StateId,
							   (SELECT        bb.Name
      FROM            dbo.State AS cc, dbo.Branch bb
      WHERE        (a.ProfitCentreCode = bb.ProfitCentreCode AND cc.Id = f.StateId)) AS PPLName,1 as Number, e.KeyFeatured,d.ProductCode,e.Description as ProductDec,ac.Name as AccountName ,ac.AccountNo 
FROM            dbo.SalesOrder AS a INNER JOIN
                         dbo.Invoice AS b ON a.InvoiceId = b.Id INNER JOIN
                         dbo.Consignment AS d ON b.Id = d.InvoiceId INNER JOIN
						 dbo.Account AS ac ON ac.id   = a.AccountId  INNER JOIN
                         dbo.Product AS e ON d.ProductId = e.Id CROSS JOIN
                         dbo.Branch AS f CROSS JOIN
						 dbo.State as st
WHERE        a.ProfitCentreCode=f.ProfitCentreCode AND b.StateId=st.Id
GROUP BY e.SapCode, e.Description, b.CreatedOn, f.StateId, e.Name,
a.ProfitCentreCode , e.KeyFeatured,d.ProductCode,e.Description,ac.Name ,ac.AccountNo,st.Id ,st.Name,f.StateId









