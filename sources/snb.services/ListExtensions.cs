using System.Collections.Generic;

namespace Bespoke.PostEntt.Ost.Services
{
    public static class ListExtensions
    {
        public static void AddRange<T>(this IList<T> list, IEnumerable<T> items)
        {
            foreach (var t in items)
            {
                list.Add(t);
            }
        }
    }
}