# RAML Parser for .NET 

[![Build status](https://ci.appveyor.com/api/projects/status/qt828j3w0w6talnr?svg=true)](https://ci.appveyor.com/project/woodp/raml-dotnet-parser)

A RAML Parser implementation in .NET for all CLR languages. The parser is implemented as a strongly-typed wrapper around the JavaScript parser, leveraging Edge.js as a Node.js host. Reuse of the JavaScript parser provides a robust and high-performance parser with a simple and natural .NET object model.

The preferred way of consuming the RAML parser in your .NET application is to include it in your project directly from nuget:


```ps
    Install-Package AMF.Parser
```

## Usage (C#)

Import the Raml.Parser namespace, and then use the RamlParser object to build an in-memory model of a RAML definition:

```csharp
    using AMF.Parser;
    
    async Task ParseRamlFile()
    {
        // load a RAML file
        var parser = new AmfParser();
        var model = await parser.Load("my.raml");

        // print the number of endpoints that this RAML definition contains
        Console.WriteLine(model.WebApi.EndPoints.Count());
        // print the number of types this RAML definition contains
        Console.WriteLine(model.Shapes.Count());

        // OAS 2.0 also supported
        model = await parser.Load("my.json");
    }
```

The Load methods of the parser return a RamlDocument instance, from which all properties of the RAML definition may
be discovered.