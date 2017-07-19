using Bespoke.Ost.EstRegistrations.Domain;
using Bespoke.Sph.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace Bespoke.PosEntt.CustomActions
{

    public class NotifySnbRegister
    {
        private string m_ostBaseUrl;
        private string m_ostAdminToken;

        public NotifySnbRegister()
        {
            m_ostBaseUrl = ConfigurationManager.GetEnvironmentVariable("BaseUrl") ?? "http://localhost:50230";
            m_ostAdminToken = ConfigurationManager.GetEnvironmentVariable("AdminToken") ?? "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlcyI6WyJhZG1pbmlzdHJhdG9ycyIsImNhbl9lZGl0X2VudGl0eSIsImNhbl9lZGl0X3dvcmtmbG93IiwiZGV2ZWxvcGVycyJdLCJlbWFpbCI6ImFkbWluQHlvdXJjb21wYW55LmNvbSIsInN1YiI6IjYzNjIwNDQ2NTgyNzk2MDA0NDYwOGNjMzdjIiwibmJmIjoxNTAwNDU5MzgzLCJpYXQiOjE0ODQ4MjA5ODMsImV4cCI6MTUxNDY3ODQwMCwiYXVkIjoiT3N0In0.qIA-b-0XTI_GpgMCGJC1yAAtw04UoPaNYoxMSXeBrPk";
        }

        public async Task SendNotifyEmail(string emailTo, string emailSubject, string emailMessage, string userid)
        {
            var emailBody = $@"Hello,

{emailMessage}.
Your details has been successfully submitted with user id {userid}.";


            using (var smtp = new SmtpClient())
            {
                var mail = new MailMessage("entt.admin@pos.com.my", emailTo)
                {
                    Subject = emailSubject,
                    Body = emailBody,
                    IsBodyHtml = false
                };
                await smtp.SendMailAsync(mail);
            }
        }

        public async Task RegisterNewContractCustomer(EstRegistration item)
        {
            await Task.Delay(100);
            Console.WriteLine($"======================");
            Console.WriteLine($"Contact Id: {item.Id}");
            Console.WriteLine($"Contact User Id: {item.UserId}");
            Console.WriteLine($"Contact Person Name: {item.PersonalDetail.ContactPersonName}");
            Console.WriteLine($"Contact Person Ic: {item.PersonalDetail.ContactPersonIc}");
            Console.WriteLine($"Supporting Document (FormP13AndTnc): {item.FormP13AndTnc.BinaryStoreId}");
            var count = 0;
            foreach (var dirInfo in item.DirectorInformation)
            {
                count ++;
                Console.WriteLine($"Director {count} Name: {dirInfo.DirectorName}");
                Console.WriteLine($"Director {count} Ic: {dirInfo.DirectorIcNumber}");
            }
            Console.WriteLine($"======================");

            //TODO: Send Registration data to SnB
            //TODO: Print Snb RefNo to screen
        }
    }
}
