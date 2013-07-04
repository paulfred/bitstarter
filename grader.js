#!/usr/bin/env node
/*
  Automatically grade files for the presence of specified HTML tags/attributes.
  Uses commander.js and cheerio. Teaches command line application development
  and basic DOM parsing.

*/
var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var restler = require('restler');

var HTMLFILE_DEFAULT='index.html';
var CHECKSFILE_DEFAULT='checks.json';

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1);
    }
    return instr;
};

var stringParam = function(urlparam) {
    return urlparam.toString();
}

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
}

var checkHtmlFile = function(htmldata, checksfile) {
    $ = htmldata;
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for( var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

if(require.main == module) {
    program
        .option('-c, --checks ', 'Path to checks.json', assertFileExists, CHECKSFILE_DEFAULT)
        .option('-f, --file ', 'Path to index.html', assertFileExists, HTMLFILE_DEFAULT)
        .option('-u, --url <url> ', 'URL to resource to check instead of file', stringParam, undefined)
        .parse(process.argv);
    if (program.url) {
	restler.get(program.url).on('complete', function(data) {
	    var htmldata = cheerio.load(data);
	    var checkJson = checkHtmlFile(htmldata, program.checks);
	    var outJson = JSON.stringify(checkJson, null, 4);
	    console.log(outJson);
	});
    } else {
	var htmldata = cheerioHtmlFile(program.file);
	var checkJson = checkHtmlFile(htmldata, program.checks);
	var outJson = JSON.stringify(checkJson, null, 4);
	console.log(outJson);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
