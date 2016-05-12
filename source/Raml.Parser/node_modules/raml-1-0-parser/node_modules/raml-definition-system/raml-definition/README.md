# Overview

This directory contains the actual definition system. It contains a set of TypeScript interfaces that reflects the RAML specification. Each interface and its properties usually have specific annotations applied to give context information for tools that read the definition system and, for example, generate code out of it.

All available annotations are defined in `metamodel.ts` and are used in two ways:

* for classes/interfaces

To apply annotations to classes/interfaces you need to simply follow the example below:

```js
import MetaModel = require("./metamodel")

class RAML {
  $ = [ MetaModel.description("some description") ] // class annotation indicated using '$'
}
```

* for properties

To apply annotations to properties you need to simply follow the example below:

```js
import MetaModel = require("./metamodel")

class RAML {
  type:string // property name is type
  $type = [ MetaModel.description("some description") ] // property annotation starts with '$' and continues with the name of the property
}
```

**Note:** This is a custom implementation to support annotation in TypeScript. There is a newer version of TypeScript that supports something similar OOTB. We currently investigating if that can replace what we have at the moment.
