 		__hideTimeout = null;
 		__showTooltip = function (evt, text) {
 		    setTimeout(() => {
 		        doShowTooltip(evt.pageX, evt.pageY, text);
 		    }, 250);
 		}
 		doShowTooltip = function (x, y, text) {
 		    if (text && text.length) {

 		        var tooltip = document.getElementById("tooltip");
 		        var sidebar = document.getElementById("sidebar");
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

 		var ixmaps = ixmaps || {};

 		makeDataTable = function (data, name, height) {

 		    dbtable = data;

 		    var table = "<div style='border-top:black solid 1px;'>";

 		    table += "<div class='card-body' >";
 		    table += "<div>";

 		    table += "<table class='display dataTable' width='100%'>";

 		    // show input table
 		    // -----------------

 		    table += "<tr>";
 		    for (i in dbtable.fields) {
 		        let szSort = (dataA[name].sortDir && (dataA[name].sortDir.split("-")[0] == dbtable.fields[i].id)) ? (dataA[name].sortDir.match(/up/i) ? "<i class='bi-sort-down-alt  me-1'></i> " : "<i class='bi-sort-down  me-1'></i> ") : "&nbsp;&nbsp;";
 		        table += "<th style='min-width:50px'><a style='color:black;text-decoration:red;margin-right:1em;font-size:1.1em' href='javascript:__dataSort(\"" + name + "\",\"" + dbtable.fields[i].id + "\")' title='click to sort table by this column'>" + dbtable.fields[i].id + "&nbsp;" + szSort + "</a></th>";
 		    }
 		    table += "</tr>";

 		    if (dataA[name].fShowFilter) {
 		        table += "<tr>";
 		        for (i in dbtable.fields) {
                    var szSafeId = ("input-table-table-" + name + "-filter-" + dbtable.fields[i].id).replace(/ |\W/g, "_");
 		            table += "<th style='min-width:50px'><input id='" + szSafeId + "' style='color:black;text-decoration:red;margin-right:1em;font-size:1.1em;width:100px' onkeyup='javascript:__dataKeyupSelect(\"" + name + "\",\"" + dbtable.fields[i].id + "\",$(this).val(),event)' value='" + (dataA[name].filterA ? dataA[name].filterA[dbtable.fields[i].id] || "" : "") + "'></input></th>";
 		        }
 		        table += "</tr>";
 		    }

 		    if (dataA[name].fShowAnalytics) {
                table += "<tr style='vertical-align:top;'>";
 		        for (i in dbtable.fields) {
 		            table += "<td id='analytics-" + name + "-" + i + "' style='min-width:50px;line-height:1em;background:#f8f8f8;border:2px solid #fff;padding-bottom:0.2em'>" + "<img src='./resources/images/loading_blue.gif' id='load-file-spinner' style='height:40px;margin:0 0 0 -1.2em;'>" + "</td>";
 		        }
 		        table += "</tr>";
 		    }

 		    if (dataA[name].fShowPivot) {
                table += "<tr style='vertical-align:top;'>";
 		        for (i in dbtable.fields) {
 		            table += "<th style='min-width:50px;padding-right:0.5em;'><select id='pivot-" + name + "-" + i + "' value='no role'><option value='no role'>---</option><option>row</option><option>columns</option><option>values</option></select></td>";
 		        }
 		        table += "</tr>";
 		    }

 		    let max = Math.min(101, dbtable.records.length)
 		    for (r = 0; r < max; r++) {
 		        table += r % 2 ? "<tr class='odd'>" : "<tr class='even'>";
 		        for (i in dbtable.fields) {
 		            let text = String(dbtable.records[r][i]).replace(/\'/i, "\\\'");
 		            let tooltip = "";
 		            if (text.length > 40) {
 		                tooltip = "onmouseover=\"__showTooltip(event,'" + text + "')\" onmouseout=\"hideTooltip()\"";
 		            }
 		            table += "<td nowrap class='"+name+"_column_"+i+"' style='padding-right:0.5em;overflow:hidden;text-overflow:ellipsis;max-width:500px;' " + tooltip + "'>" + dbtable.records[r][i] + "&nbsp;</td>";
 		        }
 		        table += "</tr>";
 		    }

 		    table += "</table>";
 		    table += "</div>";
 		    table += "</div>";
 		    table += "</div>";
            
            if (dataA[name].fShowAnalytics) {
                setTimeout(() => {getAnalyticsFromDataTable(data, name, height)},100);
            }

 		    return table;
 		};

 		getAnalyticsFromDataTable = function (data, name, height) {

 		    var facetsA = ixmaps.data.getFacets(dataA[name].data, dataA[name].facetsFilter);
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
 		                    "<br>sum: " + ixmaps.formatValue(facetsA[i].sum, 2, "BLANK")+
 		                    "</small>";
 		            }
 		            if (facetsA[i].undef) {
 		                value += "<small style='white-space:nowrap'>" +
 		                    "<br>" + facetsA[i].undef + " missing values" +
 		                    "</small>";
 		            }
 		        }
 		        $("#analytics-" + name + "-" + i).html(value);
                
                $("."+name+"_column_"+i).addClass(facetsA[i].undef?"td_red":facetsA[i].type=='numeric'?"td_blue":(facetsA[i].uniqueValues?"td_yellow":""));
                
                if (facetsA[i].type=='numeric'){
                    $("."+name+"_column_"+i).addClass("td_right");
                    $("."+name+"_column_"+i).each(function( index ) {
                        $( this ).html(ixmaps.formatValue($( this ).text(), 2, "BLANK"));
                    });                
                }
            }
 		};
 		makeDataCards = function (data, name, height) {
            
 		    dbtable = data;
            
            var leftWidth = 0;

            
 		    var table = "<div style='border-top:black solid 1px;'>";

 		    table += "<div class='card-body' >";
 		    table += "<div>";

 		    table += "<table class='display dataTable' width='100%'>";

 		    let max = Math.min(101, dbtable.records.length)
 		    for (var r = 0; r < max; r++) {

				table += "<tr style='border-bottom:solid black 1px;'><td>"+(r+1)+"</td></tr>";
				table += "<tr><td>"+"&nbsp;"+"</td></tr>";

                for (var d = 0; d<dbtable.records[r].length; d++ ){
						
						var szValue = dbtable.records[r][d];
						if (szValue.length && !isNaN(szValue)){
                            var nValue = (dbtable.records[r][d]);
							szValue = ixmaps.formatValue(nValue,2,"BLANK");
						}
						table += "<tr><td style='text-align:right;vertical-align:top;width:"+leftWidth+"px;color:#aaa;font-size:0.8em;'>"+dbtable.fields[d].id+"</td><td style='padding-left:0.5em;'>"+szValue+"</td></tr>";
					}
				}

 		    table += "</table>";
 		    table += "</div>";
            
 		    return table;
 		};

 		showInputTable = function (data, name) {

 		    dbtable = data;

 		    var table = "<div id='input-table-" + name + "'>";

 		    table += "<div style='background:black;height:1px'></div>";

 		    table += "<div class='card-body' style='margin: 0.2em 0em'>";
 		    table += "<div style='width:99%;max-height:400px;overflow:auto'>";

 		    table += "<table class='display dataTable' width='100%'>";

 		    // show input table
 		    // -----------------

 		    table += "<tr>";
 		    for (i in dbtable.fields) {
 		        table += "<th>" + dbtable.fields[i].id + "&nbsp;&nbsp;&nbsp;&nbsp;</th>";
 		    }
 		    table += "</tr>";

 		    for (r = 0; r <= 100; r++) {
 		        table += r % 2 ? "<tr class='odd'>" : "<tr class='even'>";
 		        for (i in dbtable.fields) {
 		            table += "<td nowrap>" + dbtable.records[r][i] + "&nbsp;</td>";
 		        }
 		        table += "</tr>";
 		    }

 		    table += "</table>";
 		    table += "</div>";
 		    table += "</div>";
 		    table += "</div>";
 		    //table += "</br></br>";

 		    $('#Input-table').append(table);
 		    $('#Input-table-card').show();
 		};

 		showOutputTable = function (data) {

 		    dbtable = data;

 		    var table = "";

 		    table += "<div class='card-body' style='margin:0em'>";
 		    table += "<div style='margin:0em -2.5em;width:99%;overflow:auto'>";

 		    table += "<table class='display dataTable' width='100%'>";

 		    // show input table
 		    // -----------------

 		    table += "<tr>";
 		    for (i in dbtable.fields) {
 		        table += "<th>" + dbtable.fields[i].id + "&nbsp;&nbsp;&nbsp;&nbsp;</th>";
 		    }
 		    table += "</tr>";

 		    for (r = 0; r <= 10; r++) {
 		        table += r % 2 ? "<tr class='odd'>" : "<tr class='even'>";
 		        for (i in dbtable.fields) {
 		            table += "<td nowrap>" + dbtable.records[r][i] + "&nbsp;</td>";
 		        }
 		        table += "</tr>";
 		    }

 		    table += "</table>";
 		    table += "</div>";
 		    table += "</div>";
 		    table += "</br></br>";

 		    $('#Output-table').append(table);
 		    $('#Output-table-card').show();

 		    $('#download-button').show();

 		};
