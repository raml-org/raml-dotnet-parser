# RAML Parser for .NET 

A RAML Parser implementation in .NET for all CLR languages. The parser is implemented as a strongly-typed wrapper around the JavaScript parser, leveraging Edge.js as a Node.js host. Reuse of the JavaScript parser provides a robust and high-performance parser with a simple and natural .NET object model.

The preferred way of consuming the RAML parser in your .NET application is to include it in your project directly from nuget:

PM> Install-Package raml-dotnet-parser

## Usage (C#)

Import the Raml.Parser namespace, and then use the RamlParser object to build an in-memory model of a RAML definition:

    using Raml.Parser;
    
    async Task ParseRamlFile()
    {
      // load a RAML file
      var parser = new RamlParser();
      var raml = await parser.LoadAsync("my.raml");
    
      // print the number of resources that this RAML definition contains
      Console.WriteLine(raml.Resources.Count);
    }

The Load methods of the parser return a RamlDocument instance, from which all properties of the RAML definition may
be discovered.