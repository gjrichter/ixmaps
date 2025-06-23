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

    saveAsCSV = function (dataName) {
        
        let data = dataA[dataName].data;
        
        // Process data table with filters if needed
        if (dataA[dataName]?.facetsFilter && !dataA[dataName]?.fPivot) {
            data = data.select(dataA[dataName].facetsFilter);
        }

        var textToWrite = dumpTable(data);
        var textFileAsBlob = new Blob([textToWrite], {
            type: 'text/plain'
        });
        var fileNameToSaveAs = "export.csv";

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

        //return __makeDataTable_GEMINI(data, name, height);
        
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

            table += "<tr style='line-height:0.6em'><td>" + "&nbsp;" + "</td><td>" + "&nbsp;" + "</td></tr>";
            table += "<tr style='border-top:solid #dddddd 1px;padding-top:0.5em;padding-bottom:-0.5em;background:#ffffff'><td>" + (r + 1) + "</td><td></td><td></td><td></td></tr>";
           
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

    /**
 * Show the data as HTML table (wrapper)
 * @function __makeDataTable
 * @param {object} data - The data to display in the table.
 * @param {string} dataName - The name of the data.
 * @param {number} height - The height of the table.
 * @returns {string} - html with the data table
 * @private
 */
__makeDataTable_GEMINI = function (data, dataName, height) {
    const dataObj = dataA[dataName];
    if (!dataObj || !dataObj.data) {
        console.warn(`No data found for dataName: ${dataName}`);
        return;
    }

    if (dataObj.fShowCards) {
        return __makeCardView(data, dataName);
    } else {
        return __makeTableView(data, dataName, height);
    }
};

/**
 * Creates the table view.
 * @function __makeTableView
 * @param {object} data - The data to display in the table.
 * @param {string} dataName - The name of the data.
 * @param {number} height - The height of the table.
 * @returns {string} - html with the data table
 * @private
 */
const __makeTableView = (data, dataName, height) => {
    const dataObj = dataA[dataName];
    if (!dataObj || !dataObj.data) {
        console.warn(`No data found for dataName: ${dataName}`);
        return;
    }

    // get the data and make sure it's an array
    const records = data.records;
    if (!Array.isArray(records)) {
        return "<div>No data to display.</div>";
    }

    const table = document.createElement('table');
    table.className = 'data-table';
    table.style.width = '100%';

    // Create and append the table header
    table.appendChild(__createTableHeader(data, dataName));

    // Create and append the table rows
    const tbody = document.createElement('tbody');
    const start = dataObj.rowStart || 0;
    const end = dataObj.rowStart ? Math.min(start + 100, records.length) : Math.min(100, records.length);
    dataObj.rowEnd = end;

    for (let i = start; i < end; i++) {
        tbody.appendChild(__createDataRow(records[i], data, i, dataName));
    }
    table.appendChild(tbody);

    // Create a container div to hold the table
    const container = document.createElement('div');
    container.style.height = height + 'px';
    container.style.overflow = 'auto';
    container.appendChild(table);

    return container.outerHTML;
};

/**
 * Creates the card view.
 * @function __makeCardView
 * @param {object} data - The data to display in the table.
 * @param {string} dataName - The name of the data.
 * @returns {string} - html with the cards
 * @private
 */
const __makeCardView = (data, dataName) => {
    const dataObj = dataA[dataName];
    if (!dataObj || !dataObj.data) {
        console.warn(`No data found for dataName: ${dataName}`);
        return;
    }

    // get the data and make sure it's an array
    const records = data.records;
    if (!Array.isArray(records)) {
        return "<div>No data to display.</div>";
    }

    const container = document.createElement('div');
    container.className = 'card-container';

    const start = dataObj.rowStart || 0;
    const end = dataObj.rowStart ? Math.min(start + 100, records.length) : Math.min(100, records.length);
    dataObj.rowEnd = end;

    for (let i = start; i < end; i++) {
        container.appendChild(__createCard(records[i], data, i, dataName));
    }
    
    return container.outerHTML;
};

/**
 * Creates a single card element.
 * @function __createCard
 * @param {object} rowData - The data for a single row.
 * @param {object} data - The entire data set.
 * @param {number} rowIndex - The index of the current row.
 * @param {string} dataName - The name of the data.
 * @returns {HTMLElement} - The HTML card element.
 * @private
 */
const __createCard = (rowData, data, rowIndex, dataName) => {
    const card = document.createElement('div');
    card.className = 'card';

    data.fields.forEach((field,index) => {
        const cardItem = document.createElement('div');
        cardItem.className = 'card-item';

        const headerElement = document.createElement('span');
        headerElement.className = 'card-header';
        headerElement.textContent = field.id;
        cardItem.appendChild(headerElement);

        const valueElement = document.createElement('span');
        valueElement.className = 'card-value';
        valueElement.textContent = rowData[index];
        cardItem.appendChild(valueElement);

        card.appendChild(cardItem);
    });

    return card;
};

/**
 * Creates the table header row.
 * @function __createTableHeader
 * @param {object} data - The data object.
 * @param {string} dataName - The name of the data.
 * @returns {HTMLElement} - The HTML table header row.
 * @private
 */
const __createTableHeader = (data, dataName) => {
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    data.fields.forEach(field => {
        const th = document.createElement('th');
        th.style.whiteSpace = "nowrap"; // Prevent text from wrapping
        const headerText = document.createElement('span');
        headerText.textContent = field.id;
        th.appendChild(headerText);

        // Add sorting and filter functionality to header cells
        th.appendChild(__createHeaderActions(field, dataName));

        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    return thead;
};

/**
 * Creates the sorting and filtering actions for a header cell.
 * @function __createHeaderActions
 * @param {object} field - The field object.
 * @param {string} dataName - The name of the data.
 * @returns {HTMLElement} - The container for header actions.
 * @private
 */
const __createHeaderActions = (field, dataName) => {
    const actionsContainer = document.createElement('div');
    actionsContainer.style.display = 'flex';
    actionsContainer.style.alignItems = 'center';
    actionsContainer.style.justifyContent = 'space-between';
    actionsContainer.style.marginTop = '0.5em';

    // Add sort icons
    const sortIconsContainer = document.createElement('div');
    sortIconsContainer.style.display = 'flex';
    const sortUpIcon = document.createElement('i');
    sortUpIcon.className = 'bi bi-arrow-up sort-icon';
    sortUpIcon.style.cursor = 'pointer';
    sortUpIcon.onclick = () => __dataSort(dataName, field.id, 'UP');
    sortIconsContainer.appendChild(sortUpIcon);
    const sortDownIcon = document.createElement('i');
    sortDownIcon.className = 'bi bi-arrow-down sort-icon';
    sortDownIcon.style.cursor = 'pointer';
    sortDownIcon.onclick = () => __dataSort(dataName, field.id, 'DOWN');
    sortIconsContainer.appendChild(sortDownIcon);

    actionsContainer.appendChild(sortIconsContainer);

    // Add filter input
    const filterInput = document.createElement('input');
    const szSafeId = (`input-table-table-${dataName}-filter-${field.id}`).replace(/ |\W/g, "_");
    filterInput.setAttribute('id', szSafeId);
    filterInput.setAttribute('type', 'text');
    filterInput.setAttribute('placeholder', 'filter');
    filterInput.style.width = '80px'; // Adjust width as needed
    filterInput.style.display = 'none'; // Initially hidden
    filterInput.addEventListener('keyup', (event) => __dataKeyupSelect(dataName, field.id, event.target.value, event));

    const dataObj = dataA[dataName];
     if (dataObj.fShowFilter) {
        filterInput.style.display = 'inline';
        const filterValue = dataObj.filterA?.[field.id];
        filterInput.value = filterValue || "";
    }
    actionsContainer.appendChild(filterInput);
    return actionsContainer;
};

/**
 * Creates a single data row.
 * @function __createDataRow
 * @param {object} rowData - The data for a single row.
 * @param {object} data - The entire data set.
 * @param {number} rowIndex - The index of the current row.
 * @param {string} dataName - The name of the data.
 * @returns {HTMLElement} - The HTML table row element.
 * @private
 */
const __createDataRow = (rowData, data, rowIndex, dataName) => {
    const tr = document.createElement('tr');
    tr.className = rowIndex % 2 === 0 ? 'even' : '';

    // Iterate through the headers to create the cells
    data.fields.forEach((field,index) => {
        const td = document.createElement('td');
        td.style.verticalAlign = "top";

        if (rowData[index]) {
            // Check if the field is numeric
            if (typeof rowData[index] === 'number') {
                td.classList.add('td_right');
            }

            // Create a div to hold the cell content
            const div = document.createElement('div');
            div.className = "wrapword";

            // Add tooltip if present
            if (field.tooltip) {
                div.setAttribute('data-tooltip', field.tooltip);
            }
            
            let value = rowData[index];
            if (value.length > 100 && !field.tooltip) {
                 value = value.substring(0, 100) + ' ...';
             }
            // Set the text content of the div
            div.textContent = value;
            
            // Append the div to the cell
            td.appendChild(div);
            tr.appendChild(td);

        } else {
            td.textContent = '';
            tr.appendChild(td);
        }
    });

    return tr;
};


})();

// -----------------------------
// EOF
// -----------------------------
