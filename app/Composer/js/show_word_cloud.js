/**
 * @fileoverview This file is part of the iXMaps Composer (DataKrauti)
 *
 * @author Guenter Richter guenter.richter@medienobjekte.de
 * @version 1.0.0
 * @date 2025-01.01
 * @description this code realizea word clouds for textual data facets
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
	//
	// create word cloud from theme data
	//
	// ===========================================

	ixmaps.data.makeWordCloud = function (dataObj,szColumn,szDiv,szDataName) {
        
		facetsA = [];

		var fTest = true;
		var sliderA = [];

		console.log("=== make word cloud ===");

		// create data object from theme data
		// ------------------------------------
		var mydata = new Data.Table(dataObj);
		
		// ..........................................................
		//
		// 1. loop over data request and set value into card templates
		//
		// ..........................................................

		// store absolut number of entries  				
		var records = mydata.table.records;

		var allText = "";

        allValues = mydata.column(szColumn).values(); 
        allText = allValues.join(" ").replace(/&amp;/g, '&').replace(/[^a-z0-9]/gmi, " ");

		var wordsA = allText.split(/\s+/);
		
		var stopWords = "a,able,about,across,after,all,almost,also,am,among,an,and,any,are,as,at,be,because,been,but,by,can,cannot,could,dear,did,do,does,either,else,ever,every,for,from,get,got,had,has,have,he,her,hers,him,his,how,however,i,if,in,into,is,it,its,just,least,let,like,likely,may,me,might,most,must,my,neither,no,nor,not,of,off,often,on,only,or,other,our,own,rather,said,say,says,she,should,since,so,some,than,that,the,their,them,then,there,these,they,this,tis,to,too,twas,us,wants,was,we,were,what,when,where,which,while,who,whom,why,will,with,would,yet,you,your";
		var stopWords_it = "a,adesso,ai,al,all,alla,allo,allora,altre,altri,altro,anche,ancora,avere,aveva,avevano,ben,buono,che,chi,cinque,comprare,con,consecutivi,consecutivo,cosa,cui,da,dal,dalla,dall,degli,dei,del,dell,della,delle,dello,dentro,deve,devo,di,doppio,due,e,ecco,fare,fine,fino,fra,gente,giu,gli,ha,hai,hanno,ho,il,indietro,invece,io,la,le,lei,lo,loro,lui,lungo,ma,me,meglio,molta,molti,molto,nei,nel,nella,no,noi,nome,nostro,nove,nuovi,nuovo,o,oltre,ora,otto,peggio,per,pero,persone,piu,poco,primo,promesso,qua,quarto,quasi,quattr,quello,questo,qui,quindi,quinto,rispetto,sara,secondo,sei,sembra,sembrava,senza,sette,sia,siamo,siete,solo,sono,sopra,soprattutto,sotto,stati,stato,stesso,su,subito,sul,sulla,tanto,te,tempo,terzo,tra,tre,triplo,ultimo,un,una,uno,va,vai,voi,volte,vostro";
		 
		var stopWordA = stopWords_it.split(',');
		var stopWord = function(i){
			for ( x in stopWordA ){
				if ( i == stopWordA[x] ){
					return true;
				}
			}
			return false;
		}
		//wordsA = nomeA;

		var wordsMap = {};
		  /*
			wordsMap = {
			  'Oh': 2,
			  'Feelin': 1,
			  ...
			}
		  */
		wordsA.forEach(function (key) {
			key = key.toLowerCase();
			if (wordsMap.hasOwnProperty(key)) {
				wordsMap[key]++;
			} else {
				wordsMap[key] = 1;	
			}
		});

		var words = [];
		for (var i in wordsMap ){
			if ( (i.length >= 3) && (wordsMap[i] >= 2) && !stopWord(i) ){
				words.push({"text":i,"size":wordsMap[i],"href":"javascript:__setFilter(\"" + szColumn + "\",\""+i+"\",\""+szDataName+"\");"});
				//words.push({"text":i,"size":wordsMap[i],"href":"javascript:ixmaps.map().changeThemeStyle(null,'filter:WHERE \""+szColumn+"\" like \""+i+"\"','set');"});
			}
		}
		words.sort(function(a,b){
					if(a.size<b.size){
						return 1;
					}
					if(a.size>b.size){
						return -1;
					}
					return 0;
				});

		$("#"+szDiv).show();
		$("#"+szDiv).html("");

		var selector = "#"+szDiv;

		var width = $("#"+szDiv).width();
		var height = 400;
		
		if ( words.length < 15 ){
			return;
		}
		d3.wordcloud()
			.selector(selector)
			.size([width||500, height||300])
			.font("Impact")
			.scale("linear")
			.fill(d3.scale.ordinal().range(["#444444", "#888888"]))
			//.fill(d3.scale.category20b())
			.words(words)
			.spiral("rectangular")
			.onwordclick(function(d, i) {
			if (d.href) { 
				window.location = d.href; 
			}
		}).start();
	};

	/**
	 * end of namespace
	 */

})();

// -----------------------------
// EOF
// -----------------------------

