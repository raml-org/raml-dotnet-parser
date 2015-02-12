namespace Raml.Parser.Expressions
{
	public class SecurityScheme: BasicInfo
	{
		public SecuritySchemeDescriptor DescribedBy { get; set; }

		public SecuritySettings Settings { get; set; }

	}
}