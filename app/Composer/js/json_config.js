/**
 * @fileoverview This file is part of the iXMaps Composer (DataKrauti)
 *
 * @author Guenter Richter guenter.richter@medienobjekte.de
 * @version 1.0.0
 * @date 2025-01.01
 * @description this code handles json config objects
 * @license
 * This software is licensed under the MIT License.
 *
 * Copyright (c) 2025 Guenter Richter
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(() => {

    function expose() {
        var oldConfig = window.Config;

        ixmaps.noConflict = function () {
            window.Config = oldConfig;
            return this;
        };

        window.Config = Config;
    }

    // define Data for Node module pattern loaders, including Browserify
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = Config;

        // define Data as an AMD module
    } else if (typeof define === 'function' && define.amd) {
        define(Config);
    }

    // define Data as a global variable, saving the original Data to restore later if needed
    if (typeof window !== 'undefined') {
        expose();
    }

    /**************************************************************** 
     *
     * Config 
     *
     ****************************************************************/

    /**
     * This is the Config class.  
     * It realizes an object to configure and realize a map theme 
     * @constructor
     * @throws 
     * @return A new Config object
     */
    function Config(definition) {
        this.obj = null;
        this.szConfig = null;

        if (typeof (definition) == "string") {
            this.szConfig = definition;
            this.parse(definition);
        } else {
            this.obj = definition;
            //this.szConfig = JSON.stringify(definition);
        }
    }
    Config.prototype.parse = function (szConfigDef) {
        var szRaw = szConfigDef.replace(/\n\t+/g, '');
        try {
            this.obj = JSON.parse(szRaw);
        } catch (e) {
            ixmaps.parentApi.error("Code: " + e);
        }
    };
    Config.prototype.getString = function () {
        if (!this.szConfig) {
            this.szConfig = JSON.stringify(this.obj);
        }
        return this.szConfig;
    };
    Config.prototype.getObj = function () {
        if (!this.obj) {
            this.parse(definition);
        }
        return this.obj;
    };
    Config.prototype.getPrettyString = function () {
        this.szPrettyString = "";
        this.tab = 1;
        this.recurs = 0;
        this.formatObj(this.obj);
        return this.szPrettyString;
    };
    Config.prototype.isArray = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };
    Config.prototype.formatObj = function (obj) {

        if (++this.recurs > 10) {
            return;
        }
        if (this.isArray(obj)) {

            this.szPrettyString += '[';
            var n = 0;
            for (var a in obj) {
                if (obj[a]) {
                    if (typeof (obj[a]) == "object") {
                        this.szPrettyString += (n ? ',' : '');
                        this.tab++;
                        this.formatObj(obj[a]);
                        this.tab--;
                    } else {
                        this.szPrettyString += (n ? ',\n' : '\n') + (this.getIndent()) + '"' + String(obj[a]).replace(/\"/g, "\\\"").replace(/\s\s+/g, ' ') + '"';
                    }
                    n++;
                }
            }
            this.szPrettyString += ']';

        } else {

            this.szPrettyString += '{';

            var n = 0;
            for (var a in obj) {
                if (a == "parent" || a == "listItem" || a == "gOverlayObject" || a == "gOverlayObjectPartsA" || a == "setLine" || a == "setPolygon" || a == "setPosition") {
                    continue;
                }
                if (obj[a] == null) {
                    continue;
                }
                if (typeof (obj[a]) == "object") {
                    this.szPrettyString += (n ? ',\n' : '\n') + (this.getIndent()) + '' + a + ': ';
                    this.tab++;
                    this.formatObj(obj[a]);
                    this.tab--;
                    n++;
                } else {
                    this.szPrettyString += (n ? ',\n' : '\n') + (this.getIndent()) + '' + a + ': "' + String(obj[a]).replace(/\"/g, "\\\"").replace(/\s\s+/g, ' ') + '"';
                    n++;
                }
            }
            this.szPrettyString += '\n' + (this.getIndent()) + '}';
        }

        this.recurs--;
    };
    Config.prototype.getIndent = function () {
        var szTab = "";
        for (var i = 0; i < this.tab; i++) {
            szTab += "\t";
        }
        return szTab;
    };

    /**
     * end of namespace
     */

})();
