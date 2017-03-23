"use strict";
var mappings = [
    {
        messagePatterns: [
            {
                "parser": "JS",
                "pattern": "Required property: (.+) is missed"
            },
            {
                "parser": "Java",
                "pattern": "Missing required field \"(.+)\""
            }
        ]
    }
];
module.exports = mappings;
//# sourceMappingURL=messageMappings.js.map