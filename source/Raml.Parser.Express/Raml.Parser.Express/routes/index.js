var express = require('express');

var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    
    function position(pos, positions) {

        var row = -1;
        var col = -1;
        for (var i = 0; i < positions.length; i++) {
            if (positions[i] >= pos) {
                row = i + 1;
                col = positions[i-1] - pos;
                return { row: row, col: col };
            }
        }
        return { row: row, col: col };
    }

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
            
            var arr = [];
            var content = fs.readFileSync(path).toString();
            content.split('\n').forEach(function (x, i) {
                if (i == 0) {
                    arr.push(x.length + 1);
                } else {
                    arr.push(arr[i - 1] + x.length + 1);
                }
            }); //+1 stands for '\n'    
            
            var errors = '';
            
            for (var i = 0; i < api.errors().length; i++) {

                var pos = position(api.errors()[i].start, arr);

                errors += (api.errors()[i].isWarning ? 'Warning: ' : 'Error: ') + api.errors()[i].message + '\r\n';
                errors += 'Start: ' + api.errors()[i].start + ' - end: ' + api.errors()[i].end + '\r\n';
                errors += 'Line: ' + pos.row + ', col: ' + pos.col + '\r\n';
                if(api.errors()[i].path != null)
		            errors += 'In: ' + api.errors()[i].path + '\r\n';
		    }
					
			res.send('Error: when parsing.\r\n' + errors);

		}
        
        res.send(parser.toJSON(api));
	}
    catch (e) {
		
		res.send('Error: ' + e);

    }


});

module.exports = router;