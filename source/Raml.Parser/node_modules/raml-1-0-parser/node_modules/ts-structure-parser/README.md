# TypeScript Structural Parser

[![Build Status](https://travis-ci.org/mulesoft-labs/ts-structure-parser.svg?branch=master)](https://travis-ci.org/mulesoft-labs/ts-structure-parser)

This repository provides a parser for `*.ts` files. It parses the structure of a file and provides JSON object that contains its declaration.

## Installation

```
npm install ts-structure-parser --save
```

## Usage

```js
import tsstruct=require("ts-structure-parser")

var filePath=path.resolve(path.resolve(__dirname,"src/"),"typescript-file.ts");
var decls=fs.readFileSync(filePath).toString();
var jsonStructure=tsstruct.parseStruct(decls,{},filePath);
```
