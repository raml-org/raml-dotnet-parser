using System.Collections.Generic;

namespace Raml.Parser.Expressions
{
	public class BasicInfo
	{
		public string Description { get; set; }

		public IDictionary<string, IDictionary<string, string>> Type { get; set; } 
	}
}