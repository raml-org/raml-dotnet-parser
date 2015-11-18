
if (process.argv.length <= 2) {

    console.log('Error: Path not specified');

} else {

    var path = process.argv[2];

    var fs = require('fs');
    try {
        stats = fs.lstatSync(path);

        if (stats.isFile()) {

            require('raml-1-0-parser');

            var RAML = global.RAML;

            var api = RAML.loadApi(path).getOrElse(null);

            if (!(api != null)) {

                console.log('Error: ' + path + ' returned null');

            } else {

                if (api != null && api.errors() != null && api.errors().length > 0) {

                    var errors = '';
                    for (var i = 0; i < api.errors().length; i++)
                        errors += api.errors()[i].message;

                    console.log('Error: ' + errors);

                } else {

                    console.log(JSON.stringify(RAML.toJSON(api)));
                }
            }

        } else {
            
            console.log('Error: ' + path + ' does not exist or is not a file');

        }
    }
    catch (e) {

        console.log('Error: ' + e);

    }
}