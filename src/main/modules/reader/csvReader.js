import fs from "fs";

export default {
  parseFileSync: async function(filePathName) {
    try {
      const parse = require("csv-parse/lib/sync");
      let content = fs.readFileSync(filePathName, "utf-8");
      content = content.trimRight();
      const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
      });
      return records;
    } catch (e) {
      console.log(e);
      return null;
    }
  },
  parseFile: function(filePathName, callback) {
    const parse = require("csv-parse");
    fs.readFile(filePathName, "utf-8", function(err, data) {
      if (err) {
        callback(err);
        return;
      }
      const output = [];
      parse(
        data,
        {
          columns: true,
          skip_empty_lines: true,
        },
        function(err, output) {
          callback(output);
        }
      );
    });
  },
};
