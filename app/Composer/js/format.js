ixmaps = ixmaps || {};
ixmaps.data = ixmaps.data || {};

(function () {
	
	// ---------------------------------------------------
	// format number display 
	// ---------------------------------------------------

	/**
	 * convert a number into a formatted string; if the number > 1000 it will be formatted like 1 023 234 
	 * @param nValue the number to format
	 * @param nPrecision the wanted decimal points 
	 * @param szFlag "CEIL" or "FLOOR" (round either up or down)
	 */
	ixmaps.formatValue = function (nValue, nPrecision, szFlag) {

		nValue = Number(nValue);

		if (!isFinite(nValue) || !isFinite(nPrecision)) {
			return String(nValue);
		}
		if (nValue == 0) {
			return String(nValue);
		}
		if (nValue > 1000000000000) {
			return String(nValue);
		}
		if (nValue < -1000000000000) {
			return String(nValue);
		}

		if (!nPrecision) {
			nPrecision = 0;
		}
		nPrecision = Math.max(0, nPrecision);

		// GR 02.12.2011 make that low values do not collapse to 0
		if ((nValue > 0.0000001) && (nPrecision > 0)) {
			while (nValue.toFixed(nPrecision - 1) == 0) {
				nPrecision++;
			}
		}

		// GR 11.03.2009 fix precision before CEIL or FLOOR to avoid JS errors eg. 0.0000000000003
		nValue = nValue.toFixed(nPrecision + 1);

		nClipDecimal = Math.pow(10, nPrecision);
		if (szFlag && szFlag.match(/CEIL/)) {
			nValue = Math.ceil(nValue * nClipDecimal) / nClipDecimal;
		} else
		if (szFlag && szFlag.match(/FLOOR/)) {
			nValue = Math.floor(nValue * nClipDecimal) / nClipDecimal;
		} else {
			nValue = Math.round(nValue * nClipDecimal) / nClipDecimal;
		}
		// format numbers > 1000
		if (0 && (nValue < 1000)) {
			return String(nValue);
		} else {
			var szDecimals = String(nValue);
			if (szDecimals.match(/\./)) {
				szDecimals = szDecimals.split(".")[1];
				while (szDecimals.length < nPrecision) {
					szDecimals += '0';
				}
			} else {
				szDecimals = "";
			}
			var szReturn = nValue < 0 ? "-" : "";
			var szLeading = "";

			nValue = Math.floor(Math.abs(nValue));

			// GR new flag
			if (!szFlag || !szFlag.match(/NOBREAKS/)) {
				var nClip = 1000;
				while (nValue > nClip) {
					nClip *= 1000;
				}
				nClip /= 1000;

				var nPart = 0;
				var szBreak = " ";
				while (nClip >= 1000) {
					nPart = Math.floor(nValue / nClip);
					szReturn += __formatpart(nPart, szLeading);
					nValue = nValue % nClip;
					nClip /= 1000;
					if (nPart) {
						szLeading = "0";
						if (szFlag && szFlag.match(/SPACE/)) {
							szBreak = "<span style=\"font-size:0.5em;\">&nbsp;</span>";
						} else
						if (szFlag && szFlag.match(/BLANK/)) {
							szBreak = "&nbsp;";
						} else {
							szBreak = ".";
						}
					}
					szReturn += szBreak;
				}
			}

			szReturn += __formatpart(nValue, szLeading);

			if (!szReturn.length || (szReturn == "-")) {
				szReturn += "0";
			}

			if (szDecimals.length && szDecimals != "00") {
				szReturn += ((szFlag && szFlag.match(/BLANK/)) ? "." : ",") + szDecimals;
			}
		}
		return szReturn;
	}

	/**
	 * helper to format a number from 0 to 999 into a string with leading character (sample 32 -> "032" )
	 * @param nPart the number to format
	 * @param szLeading the leading character to insert if necessary 
	 */
	function __formatpart(nPart, szLeading) {
		if (!szLeading) {
			szLeading = "";
		}
		var szPart = "";
		if (nPart < 100) {
			szPart += szLeading;
		}
		if (nPart < 10) {
			szPart += szLeading;
		}
		if (nPart == 0) {
			szPart += szLeading;
		} else {
			szPart += String(nPart);
		}
		return szPart;
	}

	/**
	 * convert a number into a formatted string; if the number > 1000 it will be formatted like 1 023 234 
	 * @param nValue the number to format
	 */
	ixmaps.bestFormatValue = function (nValue) {
		if (nValue >= 10) {
			return ixmaps.formatValue(nValue, 0, "SPACE");
		} else
		if (nValue >= 1) {
			return ixmaps.formatValue(nValue, 1, "SPACE");
		} else {
			return ixmaps.formatValue(nValue, 2, "SPACE");
		}
	};
})();

// -----------------------------
// EOF
// -----------------------------
