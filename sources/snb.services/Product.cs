using System;

namespace Bespoke.PostEntt.Ost.Services
{
    public class Product
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public DateTime? ValidFrom { get; set; }
        public DateTime? ValidTo { get; set; }
        public string Parent { get; set; }
    }
}