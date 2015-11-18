var express = require('express');

var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {

    var path = req.query.path;
    
	var fs = require('fs');
	try {
		stats = fs.lstatSync(path);
		
        if (!stats.isFile())
            res.send('Error: ' + path + ' does not exist or is not a file');
			
        var parser = require('raml-1-0-parser');
			
		var api = parser.loadApi(path).getOrElse(null);
			
		if (api == null)
			res.send('Error: ' + path + ' returned null');

				
		if (api != null && api.errors() != null && api.errors().length > 0) {
					
			var errors = '';
            for (var i = 0; i < api.errors().length; i++) {

                errors += (api.errors()[i].isWarning ? 'Warning: ' : 'Error: ') + api.errors()[i].message + '\r\n';
		        errors += 'Start: ' + api.errors()[i].start + ' - end: ' + api.errors()[i].end + '\r\n';
		        errors += 'Code: ' + api.errors()[i].code + '\r\n';
		    }
					
			res.send('Error: when parsing' + errors);

		}
        
        res.send(parser.toJSON(api));
	}
    catch (e) {
		
		res.send('Error: ' + e);

	}

});

module.exports = router;