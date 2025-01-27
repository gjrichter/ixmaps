/**********************************************************************
 project2html.js

$Comment: provides JavaScript for ixmaps UI theme legends in HTML
$Source : theme_legend.js,v $

$InitialAuthor: guenter richter $
$InitialDate: $
$Author: guenter richter $
$Id: theme_legend.js 8 2015-02-10 08:14:02Z Guenter Richter $

Copyright (c) Guenter Richter
$Log: theme_legend.js,v $
**********************************************************************/


(function () {

    /**
     * __makeProjectHTML 
     * create a HTML page with an emdedded map and define the given project within
     * parses the given project definition string 
     * @param szProject project defintion string
     * @type string the generated HTML code 
     */
    Config.prototype.getProjectHTML = function () {

        // get JSON and formatted string
        //
        project = this.obj;

        // first make page html  
        //
        let szHtml = "";

        szHtml +=
            '<!DOCTYPE html>\n' +
            '<html>\n' +
            '  \n' +
            '<head>\n' +
            '\t<meta charset="UTF-8">\n' +
            '\t<meta http-equiv="X-UA-Compatible" content="IE=edge">\n' +
            '\t<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
            '\t<meta name="description" content="ixmaps embed example">\n' +
            '\t<meta name="author" content="guenter richter">\n' +
            '\t<link rel="shortcut icon" href="https://gjrichter.github.io/ixmaps/ui/resources/images/ixmaps_logo.png">\n' +
            ' \n' +
            '\t<title>Created by Composer</title>\n' +
            '</head>\n' +
            ' \n' +
            '<body style="margin:0;padding:0;">\n' +
            ' \n' +
            '\t<!-- here goes the map -->\n' +
            '\t<div id="map-div"></div>\n' +
            ' \n' +
            '\t<!-- include the ixmaps API -->\n' +
            '\t<script src="https://gjrichter.github.io/ixmaps_test/ui/js/htmlgui_api.js"><\/script>\n' +
            ' \n' +
            '\t<script type="text/javascript" charset="utf-8">\n' +
            ' \n';

        // script to embed a map  
        //
        szHtml +=
            '\t\t// create and embed the map\n' +
            '\t\t// ! reference to "map-div", the hosting html div\n' +
            '\n' +
            '\t\tixmaps.embed("map-div", {\n' +
            '\t\t\tmapService: "leaflet_vt",\n' +
            '\t\t\tmapType: "' + (project.map.basemap || "VT_OPENSTREETMAP") + '",\n' +
            '\t\t\tmap: "../../maps/svg/maps/generic/mercator.svg",\n' +
            '\t\t\tname: "map_1",\n' +
            '\t\t\tmode: "pan",\n' +
            '\t\t\tlegend: "true",\n' +
            '\t\t\ttools: "true",\n' +
            '\t\t\tsearch: "Europe",\n' +
            '\t\t\tabout: "test"\n' +
            '\t\t},\n';

        // map behaviour parameter
        //
        szHtml +=
            '\t\tmap => map\n' +
            '\t\t.options({\n' +
            '\t\t\tfeaturescaling: "' + (project.map.options.featurescaling || "true") + '",\n' +
            '\t\t\tobjectscaling: "' + (project.map.options.objectscaling || "true") + '",\n' +
            '\t\t\tnormalSizeScale: "' + (project.map.scaleParam.normalSizeScale || 10000000) + '",\n' +
            '\t\t\tflushChartDraw: "' + (project.map.scaleParam.flushChartDraw || 1000000) + '",\n' +
            '\t\t\tflushPaintShape: "' + (project.map.scaleParam.flushPaintShape || 1000000) + '",\n' +
            '\t\t\tbasemapopacity: "' + (project.map.scaleParam.basemapopacity || 0.5) + '",\n' +
            '\t\t\tworksilent: "' + ((typeof (project.map.scaleParam.worksilent) != 'undefined') ? project.map.scaleParam.worksilent : false) + '",\n' +
            '\t\t\tloadsilent: "' + ((typeof (project.map.scaleParam.loadsilent) != 'undefined') ? project.map.scaleParam.loadsilent : false) + '",\n' +
            '\t\t\thideOnPan:  "' + ((typeof (project.map.scaleParam.hideOnPan) != 'undefined') ? project.map.scaleParam.hideOnPan : false) + '",\n' +
            '\t\t\tfreezeOnPan:"' + ((typeof (project.map.scaleParam.freezeOnPan) != 'undefined') ? project.map.scaleParam.freezeOnPan : false) + '",\n' +
            '\t\t})\n';

        // external script to include by require
        // 
        for (var i in project.require) {
            szHtml +=
                '\t\t.require("' + project.require[i] + '")\n';
        }

        // attribution
        //
        szHtml +=
            '\t\t.attribution("' + (project.map.attribution || "").replace(/\"/g, '\\\"') + '")\n';


        // view 
        //
        let view = new Config({
            center: project.map.center,
            zoom: project.map.zoom
        });
        let szView = view.getPrettyString().replace(/\n/g, "\n\t\t");
        szHtml +=
            '\t\t.view(' + szView + ')\n';


        // themes
        //
        let szThemes = "";
        for (var i in project.themes) {
            let themeObj = project.themes[i];
            let newObj = {};

            szThemes +=
                '\t\t.layer(ixmaps.layer("' + themeObj.layer + '", layer => layer\n';

            // d a t a
            
            let data = {
                url: String(themeObj.style.dbtableUrl),
                type: String(themeObj.style.dbtableType),
                name: String(themeObj.style.dbtable),
                cache: String(themeObj.style.datacache)
            };
            let dataObj = new Config(data);
            let szData = dataObj.getPrettyString().replace(/\n/g, "\n\t\t\t");;
            szThemes +=
                '\t\t\t.data(' + szData + ')\n';

            delete themeObj.style.dbtableUrl;
            delete themeObj.style.dbtableExt;
            delete themeObj.style.dbtableType;
            delete themeObj.style.dbtable;
            delete themeObj.style.datacache;

            // f i l t e r 
            
            if (themeObj.style.filter) {
                szThemes +=
                    '\t\t\t.filter("' + themeObj.style.filter.replace(/\"/g, '\\\"') + '")\n';
                delete themeObj.style.filter;
            }

            // b i n d i n g 
            
            let binding = {
                geo: String(themeObj.style.lookupfield)
            };
            delete themeObj.style.lookupfield;
            
            if (themeObj.field) {
                binding.value = String(themeObj.field);
                delete themeObj.style.field;
            }
            if (themeObj.style.itemfield) {
                binding.id = String(themeObj.style.itemfield);
                delete themeObj.style.itemfield;
            }
            if (themeObj.style.sizefield) {
                binding.size = String(themeObj.style.sizefield);
                delete themeObj.style.sizefield;
            }
            if (themeObj.style.titlefield) {
                binding.title = String(themeObj.style.titlefield);
                delete themeObj.style.titlefield;
            }
            if (themeObj.style.valuefield) {
                binding.text = String(themeObj.style.valuefield);
                delete themeObj.style.valuefield;
            }
            let bindingObj = new Config(binding);
            let szBinding = bindingObj.getPrettyString().replace(/\n/g, "\n\t\t\t");;
            szThemes +=
                '\t\t\t.binding(' + szBinding + ')\n';

            // t y p e 
            
            szThemes +=
                '\t\t\t.type("' + themeObj.style.type + '")\n';
            delete themeObj.style.type;
            
            // m e t a
            
            let meta = {
                title: String(themeObj.style.title||""),
                snippet: String(themeObj.style.snippet||""),
                description: String(themeObj.style.description||""),
                name: String(themeObj.style.name),
                tooltip: String(themeObj.style.tooltip||"")
            };
            delete themeObj.style.title;
            delete themeObj.style.snippet;
            delete themeObj.style.description;
            delete themeObj.style.name;
            delete themeObj.style.tooltip;
            let metaObj = new Config(meta);
            let szMeta = metaObj.getPrettyString().replace(/\n/g, "\n\t\t\t");;

            // s t y l e
            
            if (themeObj.style.refreshtimeout == 0){
                delete themeObj.style.refreshtimeout;
            }

            let style = themeObj.style;
            let styleObj = new Config(style);
            let szStyle = styleObj.getPrettyString().replace(/\n/g, "\n\t\t\t");;
            szThemes +=
                '\t\t\t.style(' + szStyle + ')\n';
            
             szThemes +=
                '\t\t\t.meta(' + szMeta + ')\n';
           
            szThemes +=
                '\t\t))\n';
        }

        szThemes +=
            '\t);\n';

        szHtml += szThemes;

        szHtml +=
            '\t<\/script>\n' +
            '<\/body>\n' +
            '<\/html>\n';

        return szHtml;
    };

    /**
     * end of namespace
     */

})();

// -----------------------------
// EOF
// -----------------------------
