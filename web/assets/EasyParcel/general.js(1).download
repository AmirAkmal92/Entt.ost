// JavaScript Document
$.extend({URLEncode:function(c){var o='';var x=0;c=c.toString();var r=/(^[a-zA-Z0-9_.]*)/;
  while(x<c.length){var m=r.exec(c.substr(x));
    if(m!=null && m.length>1 && m[1]!=''){o+=m[1];x+=m[1].length;
    }else{if(c[x]==' ')o+='+';else{var d=c.charCodeAt(x);var h=d.toString(16);
    o+='%'+(h.length<2?'0':'')+h.toUpperCase();}x++;}}return o;},
URLDecode:function(s){var o=s;var binVal,t;var r=/(%[^%]{2})/;
  while((m=r.exec(o))!=null && m.length>1 && m[1]!=''){b=parseInt(m[1].substr(1),16);
  t=String.fromCharCode(b);o=o.replace(m[1],t);}return o;}
});

var General = {
	
	// A UTF8 Encode function
	utf8_encode : function(argString){
		// *     example 1: utf8_encode('Kevin van Zonneveld');
		// *     returns 1: 'Kevin van Zonneveld'
		if (argString === null || typeof argString === "undefined") {
			return "";
		}
	 
		var string = (argString + ''); // .replace(/\r\n/g, "\n").replace(/\r/g, "\n");
		var utftext = "",
			start, end, stringl = 0;
	 
		start = end = 0;
		stringl = string.length;
		for (var n = 0; n < stringl; n++) {
			var c1 = string.charCodeAt(n);
			var enc = null;
	 
			if (c1 < 128) {
				end++;
			} else if (c1 > 127 && c1 < 2048) {
				enc = String.fromCharCode((c1 >> 6) | 192) + String.fromCharCode((c1 & 63) | 128);
			} else {
				enc = String.fromCharCode((c1 >> 12) | 224) + String.fromCharCode(((c1 >> 6) & 63) | 128) + String.fromCharCode((c1 & 63) | 128);
			}
			if (enc !== null) {
				if (end > start) {
					utftext += string.slice(start, end);
				}
				utftext += enc;
				start = end = n + 1;
			}
		}
		if (end > start) {
			utftext += string.slice(start, stringl);
		}
		return utftext;
	},
	
	// A Serialize function
	serialize : function(Obj){
		var output = "{";
		if(typeof Obj === "object"){
			var temp = ""
			for(p in Obj){
				temp += '"' + p + '":';
				if(typeof Obj[p] === "object"){
					temp += this.serialize(Obj[p]);
				}else if(typeof Obj[p] === "number"){
					temp += Obj[p];
				}else if(typeof Obj[p] === "string"){
					temp += '"' + Obj[p] + '"';
				}else{
					temp += '"null"';
				}
				temp += ',';
			}
			output += temp.substring(0,temp.length-1);
		}
		output += "}";
		return output;
	},
	
	// Load Ajax
	loadAjax : function(type ,url ,data ,callback){
		$.ajax({
			type : type,
			url  : url,
			data : data,
			success : function(data){
				if($.trim(data) != ""){
					callback($.trim(data));
				}else{}
			}
		}).fail(function(jqXHR, textStatus){
			alert("Error");
		});
	},
	
	
	/* 
	 * Input Checking
	 * 
	 */
	
	// Check Is Text Empty
	isTextEmpty : function(Obj){
		return ($.trim($(Obj).val()).length == 0);
	},
	
	//Check Is Number
	isNumber : function(Obj){		
		var val = $(Obj).val();		
		if (typeof (val) === 'string') {
		 val = val.replace(/,/, ".");
		}
		return !isNaN(parseFloat(val)) && isFinite(val);
	},
	
	//Check Is Text Exceed Length
	isLengthExceed : function(Obj,len){
		return ($.trim($(Obj).val()).length > len);
	},
	
	//Check Is Text Less Then Length
	isLengthLess : function(Obj,len){
		return ($.trim($(Obj).val()).length < len);
	},
	
	//Check is Text Empty and Exceed length
	checkFieldMax : function(Obj,len){
		var pass = false;
		if(!this.isTextEmpty(Obj)){
			if(!this.isLengthExceed(Obj,len)){
				pass = true;
			}
		}
		return pass;
	},
	
	//Check is Text Empty and Less then length
	checkFieldRange : function(Obj,mini,maxi){
		var pass = false;
		if(!this.isTextEmpty(Obj)){
			if(!this.isLengthLess(Obj,mini)){
				if(!this.isLengthExceed(Obj,maxi)){
					pass = true;
				}
			}
		}
		return pass;
	},
	
	// Check Is Email valid
	validateEmail : function(email) {
		var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,6})?$/;
		if( !emailReg.test( email ) ) {
			return false;
		} else {
			return true;
		}
	}
};