/**
  Copyright (c) 2015, 2024, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
const fs = require('fs-extra');
const path = require('path');

'use strict';

module.exports = function (configObj) {
  return new Promise((resolve, reject) => {
  	console.log("Running after_build hook.");
    let moveDirectorySync = function(sourceDir, destDir) {
        try {
//            fs.renameSync(sourceDir, destDir);
            fs.copySync(sourceDir, destDir);
            console.log(`Directory moved from ${sourceDir} to ${destDir}`);
        } catch (error) {
            console.error(`Error moving directory: ${error.message}`);
        }
    };

    let source = path.join(__dirname, '../','../', 'web');
    let destination = path.join(__dirname, '../','../','../','BackEnd-App', 'public', 'ui');

    fs.rmSync(destination, { recursive: true, force: true });
    fs.mkdirSync(path.join(destination,"../"), { recursive: true });
    moveDirectorySync(source,destination);

  	resolve(configObj);
  });
};
