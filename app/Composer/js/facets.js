/**
 * @fileoverview This file provides functions for facet filtering
 *
 * @author Guenter Richter guenter.richter@medienobjekte.de
 * @version 1.0.0
 * @date 2025-01.01
 * @description this code analyses tabular data and creates facets
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

window.ixmaps = window.ixmaps || {};
window.ixmaps.data = window.ixmaps.data || {};

(() => {

    // ===========================================
    // Helper functions
    // ===========================================

    const __onlyUnique = (value, index, self) => self.indexOf(value) === index;

    const __getUniqueValues = (arr) => [...new Set(arr.map(String))];

    const __scanValue = (nValue) => {
        let strVal = String(nValue);
        if (strVal.includes(":")) return "date";
        return parseFloat(strVal.replace(/[\s,.]/g, (match) => (match === "," ? "." : ".")));
    };

    // ===========================================
    // Facet filter handling
    // ===========================================

    __facetFilterA = [];
    __rangesA = [];

    // ===========================================
    // Create filter facets from theme data
    // ===========================================

    ixmaps.data.getFacets = (mydata, szFilter, szFieldsA, szId, szMap, fFlag) => {
        let facetsA = [];
        let sizefield = null;

        console.log("=== Creating facet statistics ===", szId);

        __facetFilterA = [];

        // Apply filter if present
        if (szFilter && szFilter.includes("WHERE")) {
            console.log("Applying filter:", szFilter);
            mydata = mydata.select(szFilter);

            let szPartsA = szFilter.split("WHERE ")[1].split("AND");
            for (let i = 0; i < szPartsA.length; i++) {
                if (szPartsA[i].includes("BETWEEN")) {
                    szPartsA[i] += "AND" + szPartsA[i + 1];
                    szPartsA.splice(i + 1, 1);
                }
            }

            __facetFilterA = szPartsA.map((x) => x.trim());
        }

        // Define fields to analyze
        szFieldsA = szFieldsA || mydata.columnNames();
        szFieldsA = szFieldsA.filter((field) => field !== "geometry");

        let v = sizefield ? mydata.column(sizefield).values().map(__scanValue) : null;

        for (const szField of szFieldsA) {
            if (!mydata.column(szField)) continue;

            let facet = {
                id: szField
            };
            let values = mydata.column(szField).values();

            // test for undefined and only numeric values
            // ------------------------------------------ 
            facet.undef = 0;
            let isNumeric = true;
            let isDateTime = false;
            values.every(function (x) {
                if ((typeof (x) != "undefined") &&
                    (x != "undefined") &&
                    (x != '') &&
                    (x != ' ') &&
                    (x != '-') &&
                    (x != '""') &&
                    (x != "''") &&
                    (x != "NaN") &&
                    (x != "NULL")) {
                    if (!String(x).match(/^-?\d*(\.|,)*\d+$/)) {
                        isNumeric = false;
                    }
                    if (String(x).match(/^(\d{4})-(0[1-9]|1[0-2]|[1-9])-([1-9]|0[1-9]|[1-2]\d|3[0-1]).*$/)) {
                        isDateTime = true;
                        isNumeric = false;
                    }
                    if (String(x).match(/^(\d{4})\/(0[1-9]|1[0-2]|[1-9])\/([1-9]|0[1-9]|[1-2]\d|3[0-1]).*$/)) {
                        isDateTime = true;
                        isNumeric = false;
                    }
                    if (String(x).match(/^([1-9]|0[1-9]|[1-2]\d|3[0-1])\/(0[1-9]|1[0-2]|[1-9])\/(\d{4})$/)) {
                        isDateTime = true;
                        isNumeric = false;
                    }
                } else {
                    facet.undef++;
                }
                return isNumeric;
            });
            
            if (fFlag && fFlag.match(/NONUMERIC/)) {
                isNumeric = false;
            }

            let fActiveFacet = __facetFilterA.some(
                (filter) => filter.includes(`"${szField}" is `) || filter.includes(`"${szField}" = `)
            );

            let uniqueValues = __getUniqueValues(values);

            if (isNumeric || (uniqueValues.length > values.length / 2)) {
                if (isNumeric) {
                    let numericValues = values.map(__scanValue).filter((x) => !isNaN(x));
                    facet.type = "numeric";
                    var sum = 0;
                    var min = Number.MAX_VALUE;
                    var max = (-Number.MAX_VALUE);
                    var sum = 0;
                    values.map(function (x) {
                        x = __scanValue(x);
                        if (!isNaN(x)) {
                            min = Math.min(min, x || min);
                            max = Math.max(max, x || max);
                            sum += x || 0;
                        }
                        return (x);
                    });
                    facet.min = min;
                    facet.max = max;
                    facet.sum = sum;
                    //facet.min = Math.min(...numericValues);
                    //facet.max = Math.max(...numericValues);
                    //facet.sum = numericValues.reduce((a, b) => a + b, 0);
                    facet.values = numericValues;
                    facet.data = numericValues;
                } else {
                    facet.type = isDateTime?"time":"textual";
                    facet.values = uniqueValues; //.slice(0, 200);
                }
            } else {
                let valueCounts = values.reduce((acc, val) => {
                    acc[val] = (acc[val] || 0) + 1;
                    return acc;
                }, {});

                if (isNumeric) {
                    uniqueValues.sort((a, b) => a - b);
                } else {
                    uniqueValues.sort((a, b) => valueCounts[b] - valueCounts[a]);
                }

                facet.type = isDateTime?"time":"textual";
                facet.values = uniqueValues;
                facet.valuesCount = valueCounts;
                facet.uniqueValues = uniqueValues.length;
            }

            facetsA.push(facet);
        }

        console.log("=== Facet statistics completed ===", facetsA);
        return facetsA;
    };
})();
