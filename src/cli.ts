#!/usr/bin/env node
"use strict";

import * as a from './';
try {
    let root = process.argv[2];
    a.run(root);
}
catch (e) {
    console.log(111);
    console.log(e);
}
