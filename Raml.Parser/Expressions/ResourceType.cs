using System.Collections.Generic;

namespace Raml.Parser.Expressions
{
	public class ResourceType
	{
		public Verb Get { get; set; }

		public Verb Post { get; set; }

		public Verb Put { get; set; }

		public Verb Delete { get; set; }

		public Verb Patch { get; set; }

		public Verb Options { get; set; }
	}
}