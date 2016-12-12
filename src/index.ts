"use strict";

import * as fs from 'fs-extra-promise';
import * as utils from 'egret-node-utils';

export async function run(root) {
    if (!root || !(await fs.existsAsync(root))) {
        let error = `path not found : ${root}`;
        console.log(error);
        throw new Error(error);
    }
    let list = await utils.walk(root, (p) => p.indexOf(".json") >= 0);
    try {
        list.map(mapper);
    }
    catch (e) {
        console.log(e)
    }

    console.log("警告,已删除以下key");
    console.log(deleted_keys);
}

let deleted_keys: {
    [filepath: string]: string[]
} = {};

let isObject = (obj) => {
    return typeof obj == "object" && !(obj instanceof Array);
}

let isArray = (obj) => {
    return obj instanceof Array;
}

let isCollection = (obj) => {
    return isArray(obj) || isObject(obj);
}

let isNumber = (obj) => {
    return typeof (obj) == 'number';
}

let mapper = (filePath: string) => {

    var indexs = [];

    let remove = (obj, key) => {
        console.log(indexs.join("."),"===>", obj[key]);
        delete obj[key];
        let v = deleted_keys[filePath];
        if (v.indexOf(key) == -1) {
            v.push(key);
        }
    }
    deleted_keys[filePath] = [];
    var content = fs.readFileSync(filePath, "utf-8");
    var obj = JSON.parse(content);
    loop(obj);
    var output = JSON.stringify(obj);
    fs.writeFileSync(filePath + ".min", output, "utf-8");
    function loop(obj) {
        if (isCollection(obj)) {
            for (var key in obj) {
                indexs.push(key);
                var value = obj[key];
                if (isArray(value)) {
                    if (value.length == 0) {
                        remove(obj, key);
                    }
                    else {
                        loop(value);
                    }
                }
                else if (isObject(value)) {
                    if (Object.keys(value).length == 0) {
                        remove(obj, key);
                    }
                    else {
                        loop(value);
                    }

                }
                else if (value == "0" || value == 0 || value == false || value == null) {
                    if (isObject(obj)) {
                        remove(obj, key)
                    }
                }
                else if (isNumber(value)) {
                    if (value != Math.floor(value)) {
                        obj[key] = value.toFixed(3);
                    }
                }
                indexs.pop();
            }

        }

    }
};
