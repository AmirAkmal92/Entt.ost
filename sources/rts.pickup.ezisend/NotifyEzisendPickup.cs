using System;
using System.Net.Mail;
using System.Threading.Tasks;

namespace Bespoke.PosEntt.CustomActions
{
    public class NotifyEzisendPickup
    {
        public async Task SendNotifyEmail(string emailTo, string emailSubject, string emailMessage,
            string consignmentNo, DateTime pickupDateTime, string pickupNo)
        {
            var emailBody = $@"Hello,

{emailMessage}.
Your item {consignmentNo} has been successfully picked up at {pickupDateTime} with pickup number {pickupNo}.";


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
    }
}
