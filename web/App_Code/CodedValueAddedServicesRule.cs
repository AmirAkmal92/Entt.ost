using System;
using System.Net.Http;
using System.Threading.Tasks;
using Bespoke.Ost.PosLajuBranchBranches.Domain;
using Bespoke.PostEntt.Ost.Services;
using Bespoke.Sph.Domain;
using Polly;

public class CodedValueAddedServicesRule
{
    public class CodedValuedAddedServicesRule : IValueAddedServicesRules
    {
        public async Task<bool> Validate(SuggestProductModel model, Product product, ValueAddedService vas)
        {
            var result = true;
            if (vas.Code == "V11")
            {
                var query = $@"{{
   ""query"": {{
      ""bool"": {{
         ""must"": [
            {{
               ""range"": {{
                  ""PostcodeFrom"": {{
                     ""lte"": ""{model.OriginPostcode}""
                  }}
               }}
            }},
            {{
                ""range"": {{
                   ""PostcodeTo"": {{
                      ""gte"": ""{model.OriginPostcode}""
                   }}
                }}
            }}
         ]
      }}
   }}
}}";
                var repos = ObjectBuilder.GetObject<IReadonlyRepository<PosLajuBranch>>();
                var pr = await Policy.Handle<HttpRequestException>()
                        .WaitAndRetryAsync(5, x => TimeSpan.FromMilliseconds(Math.Pow(2, x) * 500))
                        .ExecuteAndCaptureAsync(async () => await repos.GetCountAsync(query, "from=0&size=0"));

                if (null != pr.FinalException) return false;
                result = pr.Result > 0;
            }

            // TODO : insurance - which one

            return result;
        }
    }
}