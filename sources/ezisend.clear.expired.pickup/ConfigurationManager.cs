using System;

namespace ezisend.clear.expired.pickup
{
    class ConfigurationManager
    {
        public static string GetEnvironmentVariable(string setting)
        {
            var process = Environment.GetEnvironmentVariable($"RX_Ost_{setting}", EnvironmentVariableTarget.Process);
            if (!string.IsNullOrWhiteSpace(process)) return process;

            var user = Environment.GetEnvironmentVariable($"RX_Ost_{setting}", EnvironmentVariableTarget.User);
            if (!string.IsNullOrWhiteSpace(user)) return user;

            return Environment.GetEnvironmentVariable($"RX_Ost_{setting}", EnvironmentVariableTarget.Machine);
        }
    }
}
