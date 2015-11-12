using System.Collections;
using System.Collections.Generic;
using System.Linq;
using Raml.Parser.Expressions;

namespace Raml.Parser.Builders
{
	public class SecuritySettingsBuilder
	{
		public SecuritySettings Build(IDictionary<string, object> dynamicRaml)
		{
			var settings = new SecuritySettings();
			settings.RequestTokenUri = dynamicRaml.ContainsKey("requestTokenUri")
				? (string) dynamicRaml["requestTokenUri"]
				: null;

			settings.TokenCredentialsUri = dynamicRaml.ContainsKey("tokenCredentialsUri")
				? (string) dynamicRaml["tokenCredentialsUri"]
				: null;

			settings.AuthorizationUri = dynamicRaml.ContainsKey("authorizationUri")
				? (string) dynamicRaml["authorizationUri"]
				: null;

			settings.AccessTokenUri = dynamicRaml.ContainsKey("accessTokenUri") ? (string) dynamicRaml["accessTokenUri"] : null;

			settings.AuthorizationGrants = dynamicRaml.ContainsKey("authorizationGrants")
				? ((object[]) dynamicRaml["authorizationGrants"]).Cast<string>().ToArray()
				: new string[0];

			settings.Scopes = dynamicRaml.ContainsKey("scopes")
				? ((object[]) dynamicRaml["scopes"]).Cast<string>().ToArray()
				: new string[0];

			return settings;
		}
	}
}