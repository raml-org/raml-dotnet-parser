# RAML Data Type System

[![Build Status](https://travis-ci.org/raml-org/typesystem-ts.svg?branch=master)](https://travis-ci.org/raml-org/typesystem-ts)

This module contains a lightweight implementation of the type system that was introduced with [RAML 1.0](http://raml.org).

It allows you to to parse, validate , modify RAML types, as well as store them back to JSON.

## Installation

```
npm install raml-typesystem --save
```

## Usage

Parsing and validating a single type:

```js
import ts = require("raml-typesystem")

var personType = ts.loadType( {
    type: "string[]",
    minItems:3,
    maxItems:2
})

var isValid = personType.validateType();
```

Parsing and validating a `types` collection:

```js
import ts = require("raml-typesystem")

var typeCollection = ts.loadTypeCollection({
    types: {
        Person: {
            type: "object",
            properties:{
                kind: "string"
            }
        },
        Man: {
            type: "Person",
            discriminator: "kind"
        }
    }
})
var isValid = typeCollection.getType("Person").validateType()
```


Validating object against type:

```js
import ts = require("raml-typesystem")

var typeCollection = ts.loadTypeCollection({
    types: {
        Person: {
            type: "object",
            properties:{
                kind: "string"
            }
        },
        Man: {
            type: "Person",
            discriminator: "kind"
        }
    }
})
var isValid = typeCollection.getType("Person").validate({dd: true})
```

## Contribute

The typesystem-ts repo is an open source project and any contribution is always welcome. Please follow these simple steps when contributing to this project:

1. Check for open issues or open a fresh issue to start a discussion around an idea or a bug.
2. Fork the repository on Github and make your changes on the develop branch (or branch off of it).
3. Send a pull request (with the develop branch as the target).
4. One of the main contributor or admin will review the PR and merge.

A big thank you goes out to everyone who helped with the project, the contributors and everyone who took the time to report issues and give feedback.

You can also directly get in touch with us. Simply send us an email to: info@raml.org
