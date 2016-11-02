
                    create view [dbo].[CompanyHistory] as 
                        select Id, Id as RegistrationId, null as CompanyDirectorId, Name as CompanyName, RocNo, 
                            '(view detail)' as DirectorName, '(view detail)' as DirectorNric, 
                            CompanyIsBlackListed as IsBlackListed, CompanyIsCtosListed as IsCtosListed,
                            RefNo, UpdatedOn, FinalResult
                        from Registration
                        union all
                        select d.Id, r.Id as RegistrationId, d.Id as CompanyDirectorId, r.Name as CompanyName, RocNo, 
                            d.Name as DirectorName, d.Nric as DirectorNric, d.IsBlackListed, d.IsCtosListed,
                            RefNo, UpdatedOn, FinalResult
                        from CompanyDirector d
                        inner join Registration r on r.Id=d.RegistrationId
