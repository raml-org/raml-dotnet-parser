export function escapeTypescriptPropertyName( str: string ): string {
    return isValidTypescriptIdentifier( str ) ? str : JSON.stringify( str )
}

// TODO: these are made up lists. check the grammar
var tsKeywords = 'type class interface break case catch continue debugger default delete do else finally for function if in instanceof new return switch this throw try typeof var void while with'.split(' ')

var digitCodesL = "0".charCodeAt(0);
var digitCodesR = "9".charCodeAt(0);
var lowerCaseCodesL = "a".charCodeAt(0);
var lowerCaseCodesR = "z".charCodeAt(0);
var upperCaseCodesL = "A".charCodeAt(0);
var upperCaseCodesR = "Z".charCodeAt(0);

var digitChars = {}//:boolean[] = []
var validChars = {}//:boolean[] = []
//for(var i = 0 ; i < 128 ; i++){
//    digitCodes.push(false)
//    validCodes.push(false)
//}

for(var i = digitCodesL, end = digitCodesR ; i <= end ; i++ ){
    digitChars[String.fromCharCode(i)] = true
    validChars[String.fromCharCode(i)] = true
}

for(var i = lowerCaseCodesL, end = lowerCaseCodesR ; i <= end ; i++ ){
    validChars[String.fromCharCode(i)] = true
}

for(var i = upperCaseCodesL, end = upperCaseCodesR ; i <= end ; i++ ){
    validChars[String.fromCharCode(i)] = true
}

"_ $".split(" ").forEach(x=>validChars[x]=true)

export function isValidTypescriptIdentifier( str: string ): boolean {

    str = str.trim();
    if(str.length==0){
        return false;
    }
    if(tsKeywords.indexOf(str)>=0){
        return false;
    }
    if(digitChars[str.charAt(0)]){
        return false;
    }
    for(var i = 0 ; i < str.length ; i++){
        if(!validChars[str.charAt(i)]){
            return false;
        }
    }
    return true;
}

export function escapeToIdentifier( str: string ): string {

    str = str.trim();
    var result:string = ''
    if(str.length>0&&digitChars[str.charAt(0)]){
        result += '_';
    }
    for(var i = 0 ; i < str.length ; i++){
        var ch = str.charAt(i);
        if(validChars[ch]){
            result += ch;
        }
        else{
            result += '_';
        }
    }
    return result;
}

var typeMap={
    'string': 'string',
    'integer': 'number',
    'number': 'number',
    'boolean': 'boolean',
    'file': 'string',
    'date': 'string',
    'NumberType':'number'
};

export function ramlType2TSType(ramlType:string):string{
    var tsType=typeMap[ramlType];
    if(!tsType){
        tsType = 'any';
    }
    return tsType;
}

export function escapeToJavaIdentifier(str:string){
    str = escapeToIdentifier(str);
    return javaReservedWords[str] ? str + '_' : str;
}

export var tsToJavaTypeMap:{[key:string]:string} = {
    'number': 'Double',
    'string': 'String',
    'boolean': 'Boolean',
    'any': 'Object'
}

export var javaReservedWords:{[key:string]:boolean} = {
    "abstract": true,
    "continue": true,
    "for": true,
    "new": true,
    "switch": true,
    "assert": true,
    "default": true,
    "goto": true,
    "package": true,
    "synchronized": true,
    "boolean": true,
    "do": true,
    "if": true,
    "private": true,
    "this": true,
    "break": true,
    "double": true,
    "implements": true,
    "protected": true,
    "throw": true,
    "byte": true,
    "else": true,
    "import": true,
    "public": true,
    "throws": true,
    "case": true,
    "enum": true,
    "instanceof": true,
    "return": true,
    "transient": true,
    "catch": true,
    "extends": true,
    "int": true,
    "short": true,
    "try": true,
    "char": true,
    "final": true,
    "interface": true,
    "static": true,
    "void": true,
    "class": true,
    "finally": true,
    "long": true,
    "strictfp": true,
    "volatile": true,
    "const": true,
    "float": true,
    "native": true,
    "super": true,
    "while": true,
};