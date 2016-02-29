console.log('Start');

if (process.argv.length <= 2) {

    console.log('Error: Path not specified');

} else {

    var filepath = process.argv[2];

    var fs = require('fs');
    try {
        stats = fs.lstatSync(filepath);

        if (stats.isFile()) {


            var path = require('path');
            var raml1Parser = require('raml-1-0-parser');

            raml1Parser.loadApi(filepath)
               .then(function (api) {
                   
                   console.log('End a');

                   api.errors().forEach(function (x) {
                       console.log(JSON.stringify({
                           code: x.code,
                           message: x.message,
                           path: x.path,
                           start: x.start,
                           end: x.end,
                           isWarning: x.isWarning
                       }, null, 2));
                   });

                   console.log(JSON.stringify(api.toJSON(), null, 2));
               });
               
               console.log('End s');

        } else {
            
            console.log('Error: ' + path + ' does not exist or is not a file');

        }
    }
    catch (e) {

        console.log('Error: ' + e);

    }
}