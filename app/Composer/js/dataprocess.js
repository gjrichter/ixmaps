/**
 * @fileoverview This file is part of the iXMaps Composer (DataKrauti)
 *
 * @author Guenter Richter guenter.richter@medienobjekte.de
 * @version 1.0.0
 * @date 2025-01.01
 * @description this code creates a HTML table view of tabular data
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
    window.ixmaps = window.ixmaps || {};
    window.ixmaps.data = window.ixmaps.data || {};

    // --------------------------------------------------------------------------------------------
    // tooltips
    // --------------------------------------------------------------------------------------------

    __hideTimeout = null;
    __showTooltip = function (evt, text) {
        setTimeout(() => {
            doShowTooltip(evt.pageX, evt.pageY, text);
        }, 250);
    }
    doShowTooltip = function (x, y, text) {
        if (text && text.length) {

            var tooltip = document.getElementById("tooltip");
            tooltip.innerHTML = text;
            tooltip.style.display = "block";
            tooltip.style.left = x + 15 + 'px';
            tooltip.style.top = y - 5 + 'px';
            tooltip.setAttribute("onMouseOver", "clearTimeout(__hideTimeout)");
            tooltip.setAttribute("onMouseOut", "hideTooltip()");
        }
    }

    hideTooltip = function () {
        __hideTimeout = setTimeout("doHideTooltip()", 250);
    }
    doHideTooltip = function () {
        var tooltip = document.getElementById("tooltip");
        tooltip.style.display = "none";
    }
    // --------------------------------------------------------------------------------------------
    // stringify table object to csv   
    // --------------------------------------------------------------------------------------------

    var result = null;

    var dumpTable = function (tableObj) {

        var numRows = tableObj.records.length;
        var numCols = tableObj.fields.length;
        var records = tableObj.records;

        var columns = [];
        for (i = 0; i < numCols; i++) {
            columns.push({
                "title": tableObj.fields[i].id
            });
        }

        var szText = "";
        for (i in columns) {
            szText += (szText.length ? ";" : "") + columns[i].title;
        }
        szText += "\r\n";
        for (i in records) {
            var szRow = "";
            for (ii in records[i]) {
                szRow += (szRow.length ? ";" : "") + records[i][ii];
            }
            szText += szRow;
            szText += "\r\n";
        }

        return szText;
    };

    // --------------------------------------------------------------------------------------------
    // save content of HTML text area id="oputput" to local filesystem
    // --------------------------------------------------------------------------------------------

    var saveAsCSV = function () {
        var textToWrite = dumpTable(result);
        var textFileAsBlob = new Blob([textToWrite], {
            type: 'text/plain'
        });
        var fileNameToSaveAs = "test.csv";

        var downloadLink = document.createElement("a");
        downloadLink.download = fileNameToSaveAs;
        downloadLink.innerHTML = "Download File";
        if (window.URL != null) {
            // Chrome allows the link to be clicked
            // without actually adding it to the DOM.
            downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
        } else {
            // Firefox requires the link to be added to the DOM
            // before it can be clicked.
            downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
            downloadLink.onclick = destroyClickedElement;
            downloadLink.style.display = "none";
            document.body.appendChild(downloadLink);
        }

        downloadLink.click();
    };

    /**
     * Represents a data sink, holding the data and related properties.
     *
     * @class DataSink
     * @param {object} data - The data object.
     * @property {object} data - The data object of the sink.
     * @property {string} type - The type of data.
     * @property {array} filterA - The array of actual filters.
     * @property {string} facetsFilter - The filter string.
     * @property {string} sortDir - The sort direction.
     * @property {boolean} fPivot - Whether the data has been pivoted.
     * @property {boolean} fShowAnalytics - Whether to show analytics.
     * @property {boolean} fShowFilter - Whether to show the filter.
     * @property {object} map - The map object.
     * @constructor
     */
    DataSink = function (data) {
        this.data = data;
        this.type = null;

        this.filterA = null;
        this.facetsFilter = null;

        this.sortDir = null;

        this.fPivot = null;
        this.fShowAnalytics = null;
        this.fShowFilter = null;
        this.fShowCards = null;

        this.map = null;
    };

    /**
     * Creates a data table with sorting, filtering, analytics, and pivot capabilities
     * @param {Object} data - The data object containing records and fields
     * @param {string} name - Unique identifier for the table
     * @param {number} height - Table height
     * @returns {string} HTML string of the generated table
     */
    DataSink.prototype.makeDataTable = function (data, name, height) {
        
        if (this.fShowCards){
            return this.makeDataCards(data, name, height);
        }

        // Constants
        const MAX_RECORDS = 100;
        const MAX_TEXT_LENGTH = 20;
        const TABLE_ID = `input-table-table-${name}-table`;

        // Process data table with filters if needed
        let dbtable = data;
        if (dataA[name]?.facetsFilter && !dataA[name]?.fPivot) {
            dbtable = dbtable.select(dataA[name].facetsFilter);
        }

        // start table 
        // ------------    
        var table = `
                <div style='border-top:black solid 1px;'>
                    <div class='card-body'>
                        <div style='margin-top:0.5em'>
 		                     <table id='${TABLE_ID}' class='display dataTable' width='auto' onscroll='__onScroll()'>`;

        // header row    
        table += "<tr style='vertical-align:top;line-height:1em'>";
        for (i in dbtable.fields) {
            let szSort = (dataA[name].sortDir && (dataA[name].sortDir.split("-")[0] == dbtable.fields[i].id)) ? (dataA[name].sortDir.match(/up/i) ? "<i class='bi-sort-down-alt  me-1'></i>" : "<i class='bi-sort-down  me-1'></i>") : "";
            table += "<th style='min-width:50px'><a style='color:black;text-decoration:red;margin-right:1em;font-size:1em' href='javascript:__dataSort(\"" + name + "\",\"" + dbtable.fields[i].id + "\")' title='click to sort table by this column'><span style='white-space:nowrap'>" + (szSort + dbtable.fields[i].id) + "&nbsp;&nbsp;&nbsp;</span></a></th>";
        }
        table += "</tr>";

        // filter row    
        if (dataA[name].fShowFilter) {
            table += "<tr>";
            for (i in dbtable.fields) {
                var szSafeId = ("input-table-table-" + name + "-filter-" + dbtable.fields[i].id).replace(/ |\W/g, "_");
                table += "<th style='min-width:50px'><input id='" + szSafeId + "' style='color:black;text-decoration:red;margin-right:1em;font-size:1.1em;width:100px' onkeyup='javascript:__dataKeyupSelect(\"" + name + "\",\"" + dbtable.fields[i].id + "\",$(this).val(),event)' value='" + (dataA[name].filterA ? dataA[name].filterA[dbtable.fields[i].id] || "" : "") + "'></input></th>";
            }
            table += "</tr>";
        }

        // analytics row
        if (dataA[name].fShowAnalytics) {
            table += "<tr style='vertical-align:top;'>";
            for (i in dbtable.fields) {
                table += "<td id='analytics-" + name + "-" + i + "' style='min-width:50px;line-height:1em;background:#f8f8f8;border:2px solid #fff;padding-bottom:0.2em'>" + "<img src='./resources/images/loading_blue.gif' id='load-file-spinner' style='height:40px;margin:0 0 0 -1.2em;'>" + "</td>";
            }
            table += "</tr>";
        }

        // pivot row 
        if (dataA[name].fShowPivot) {
            table += "<tr style='vertical-align:top;'>";
            for (i in dbtable.fields) {
                table += "<th style='min-width:50px;padding-right:0.5em;'><select id='pivot-" + name + "-" + i + "' value='no role'><option value='no role'>---</option><option>row</option><option>columns</option><option>values</option></select></td>";
            }
            table += "</tr>";
        }

        // data rows
        // ----------
        let max = Math.min(MAX_RECORDS, dbtable.records.length)
        for (r = 0; r < max; r++) {
            table += r % 2 ? "<tr class='odd'>" : "<tr class='even'>";
            for (i in dbtable.fields) {
                let text = String(dbtable.records[r][i]).replace(/\'/i, "\\\'");
                if (text.match(/999999|000000/)){
                    text = Number(text).toFixed(2);
                }
                let tooltip = "";
                if (text.length > MAX_TEXT_LENGTH) {
                    tooltip = "onmouseover=\"__showTooltip(event,'" + text + "')\" onmouseout=\"hideTooltip()\"";
                }
                table += "<td nowrap class='" + name + "_column_" + i + "' style='padding-right:0.5em;overflow:hidden;text-overflow:ellipsis;max-width:300px;' " + tooltip + "'>" + text + "&nbsp;</td>";
            }
            table += "</tr>";
        }

        // finish table 
        // -------------
        table += `</table>
                    </div>
                </div>
            </div>`;

        // Handle analytics
        if (dataA[name].fShowAnalytics) {
            setTimeout(() => {
                dataA[name].getAnalyticsFromDataTable(data, name, height)
            }, 100);
        }

        // Update shown records count
        dataA[name].shown = max;

        return table;
    };

    /**
     * Add more rows to the data table
     * @param {string} name - Unique identifier for the table
     * @void
     */
    DataSink.prototype.addToDataTable = function (name) {

        var dbtable = dataA[name].data;
        if (dataA[name].facetsFilter) {
            dbtable = dbtable.select(dataA[name].facetsFilter);
        }

        let table = "";
        let start = dataA[name].shown;
        let max = Math.min(start + 100, dbtable.records.length)
        for (r = start; r < max; r++) {
            table += r % 2 ? "<tr class='odd'>" : "<tr class='even'>";
            for (i in dbtable.fields) {
                let text = String(dbtable.records[r][i]).replace(/\'/i, "\\\'");
                let tooltip = "";
                if (text.length > 40) {
                    tooltip = "onmouseover=\"__showTooltip(event,'" + text + "')\" onmouseout=\"hideTooltip()\"";
                }
                table += "<td nowrap class='" + name + "_column_" + i + "' style='padding-right:0.5em;overflow:hidden;text-overflow:ellipsis;max-width:500px;' " + tooltip + "'>" + dbtable.records[r][i] + "&nbsp;</td>";
            }
            table += "</tr>";
        }
        $("#input-table-table-" + name + "-table").append(table);


        if (dataA[name].fShowAnalytics && dataA[name].facetsA) {
            const facetsA = dataA[name].facetsA;
            for (i in dbtable.fields) {
                $("." + name + "_column_" + i).addClass(facetsA[i].undef ? "td_red" : facetsA[i].type == 'numeric' ? "td_blue" : (facetsA[i].uniqueValues ? "td_yellow" : ""));

                if (facetsA[i].type == 'numeric') {
                    $("." + name + "_column_" + i).addClass("td_right");
                    $("." + name + "_column_" + i).each(function (index) {
                        if ( !isNaN($(this).text())){
                            $(this).html(ixmaps.formatValue($(this).text(), 2, "BLANK"));
                        }
                    });
                }
            }
        }

        dataA[name].shown = max;
    };

    /**
     * Creates an extendet table header with information about the columns data type and quality
     * @param {Object} data - The data object containing records and fields
     * @param {string} name - Unique identifier for the table
     * @param {number} height - Table height
     * @returns {string} HTML string of the generated table
     */
    DataSink.prototype.getAnalyticsFromDataTable = function (data, name, height) {

        var facetsA = ixmaps.data.getFacets(dataA[name].data, dataA[name].facetsFilter);
        dataA[name].facetsA = facetsA;

        dbtable = dataA[name].data;
        for (i in dbtable.fields) {
            let value = "";
            if (facetsA[i]) {
                let type = "<b>" + (facetsA[i].type || "numeric") + "</b>";
                let unique = "<small style='white-space:nowrap'>" + (facetsA[i].uniqueValues ? (facetsA[i].uniqueValues + '<br>unique values') : '') + "</small>";
                value = type + "<br>" + unique;
                if (facetsA[i].min) {
                    value = type + "<small style='white-space:nowrap'>" +
                        "<br>min: " + ixmaps.formatValue(facetsA[i].min, 2, "BLANK") +
                        "<br>max: " + ixmaps.formatValue(facetsA[i].max, 2, "BLANK") +
                        "<br>sum: " + ixmaps.formatValue(facetsA[i].sum, 2, "BLANK") +
                        "</small>";
                }
                if (facetsA[i].undef) {
                    value += "<small style='white-space:nowrap'>" +
                        "<br>" + facetsA[i].undef + " missing values" +
                        "</small>";
                }
            }
            $("#analytics-" + name + "-" + i).html(value);

            $("." + name + "_column_" + i).addClass(facetsA[i].undef ? "td_red" : facetsA[i].type == 'numeric' ? "td_blue" : facetsA[i].type == 'time' ? "td_green" : facetsA[i].uniqueValues ? "td_yellow" : "");

            if (facetsA[i].type == 'numeric') {
                $("." + name + "_column_" + i).addClass("td_right");
                $("." + name + "_column_" + i).each(function (index) {
                    $(this).html(ixmaps.formatValue($(this).text(), 2, "BLANK"));
                });
            }
        }
    };

    /**
     * Creates a alternative data visualization as cards 
     * @param {Object} data - The data object containing records and fields
     * @param {string} name - Unique identifier for the table
     * @param {number} height - Table height
     * @returns {string} HTML string of the generated table
     */
    DataSink.prototype.makeDataCards = function (data, name, height) {

        dbtable = data;

        var leftWidth = "50px";
        var rightWidth = "100px";


        var table = "<div style='border-top:black solid 1px;'>";

        table += "<div class='card-body' >";
        table += "<div>";

        table += "<table class='display dataTable wrapword' width='100%' style='line-height:1.1em'>";

        let max = Math.min(101, dbtable.records.length)
        for (var r = 0; r < max; r++) {

            table += "<tr style='border-bottom:solid #dddddd 1px;'><td>" + (r + 1) + "</td></tr>";
            table += "<tr style='line-height:0.6em'><td>" + "&nbsp;" + "</td><td>" + "&nbsp;" + "</td></tr>";
            
            var delta = Math.ceil(dbtable.records[r].length/2);

            for (var d = 0; d < dbtable.records[r].length/2; d++) {

                var szValue1 = dbtable.records[r][d];
                if (szValue1.length && !isNaN(szValue1)) {
                    var nValue1 = (dbtable.records[r][d]);
                    szValue1 = ixmaps.formatValue(nValue1, 2, "BLANK");
                }
                var szValue2 = dbtable.records[r][d+delta];
                if (szValue2 && szValue2.length && !isNaN(szValue2)) {
                    var nValue2 = (dbtable.records[r][d+delta]);
                    szValue2 = ixmaps.formatValue(nValue2, 2, "BLANK");
                }
                table += "<tr><td style='text-align:right;vertical-align:top;padding-top:0.3em;width:" + leftWidth + ";color:#aaa;font-size:0.8em;'>" + dbtable.fields[d].id + "</td><td style='padding-left:0.5em;vertical-align:top;width:" + rightWidth + ";'>" + szValue1 + "</td>";
                szValue2 = szValue2 || " ";
                if (dbtable.fields[d+delta]?.id){
                    table += "<td style='text-align:right;vertical-align:top;padding-top:0.3em;width:" + leftWidth + ";color:#aaa;font-size:0.8em;'>" + dbtable.fields[d+delta].id + "</td><td style='padding-left:0.5em;vertical-align:top;width:" + rightWidth + ";'>" + szValue2 + "</td>";
                }
                table += "</tr>";
            }
        }

        table += "</table>";
        table += "</div>";

        return table;
    };

})();

// -----------------------------
// EOF
// -----------------------------
