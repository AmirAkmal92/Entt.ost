(function($){
	$.fn.outside = function(ename, cb){
		return this.each(function(){
			var $this = $(this),
			self = this;
			$(document.body).bind(ename, function tempo(e){
				if(e.target !== self && !$.contains(self, e.target)){
					cb.apply(self, [e]);
					if(!self.parentNode) $(document.body).unbind(ename, tempo);
				}
			});
		});
	};
}(jQuery)); 

function detectIE() {
    var ua = navigator.appVersion;

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
		var version = parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        // IE 10 or older => return version number
        return version;
		console.log(version);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
       // IE 12 => return version number
       return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
}

if(detectIE() == 9) {
		$('#browser-support').css('display','block');
		if($('.hari-holder').length) {
			$('.hari-holder').css('visibility','hidden');
		}
		$('.browser-close').click(function(e) {
			e.preventDefault();
			$('#browser-support').css('display','none');
			if($('.hari-holder').length) {
				$('.hari-holder').css('visibility','visible');
			}
		});
		$('.browser-wrap').outside('click', function() {
			$('#browser-support').css('display','none');
			if($('.hari-holder').length) {
				$('.hari-holder').css('visibility','visible');
			}
		});
		if($('.hari-holder').attr('style') == 'visibility: visible') {
		  	$('.hari-img').outside('click', function(){
				$('.hari-holder').css('display','none');
			});
		}
	} 


function getCookie(c_name) {
    var c_value = document.cookie;
    var c_start = c_value.indexOf(" " + c_name + "=");
    if (c_start == -1) {
        c_start = c_value.indexOf(c_name + "=");
    }
    if (c_start == -1) {
        c_value = null;
    } else {
        c_start = c_value.indexOf("=", c_start) + 1;
        var c_end = c_value.indexOf(";", c_start);
        if (c_end == -1) {
            c_end = c_value.length;
        }
        c_value = unescape(c_value.substring(c_start, c_end));
    }
    return c_value;
}

$.resizeend = function(el, options){
        var base = this;
        
        base.$el = $(el);
        base.el = el;
        
        base.$el.data("resizeend", base);
        base.rtime = new Date(1, 1, 2000, 12,00,00);
        base.timeout = false;
        base.delta = 200;
        
        base.init = function(){
            base.options = $.extend({},$.resizeend.defaultOptions, options);
            
            if(base.options.runOnStart) base.options.onDragEnd();
            
            $(base.el).resize(function() {
                
                base.rtime = new Date();
                if (base.timeout === false) {
                    base.timeout = true;
                    setTimeout(base.resizeend, base.delta);
                }
            });
        
        };
        base.resizeend = function() {
            if (new Date() - base.rtime < base.delta) {
                setTimeout(base.resizeend, base.delta);
            } else {
                base.timeout = false;
                base.options.onDragEnd();
            }                
        };
        
        base.init();
    };
    
    $.resizeend.defaultOptions = {
        onDragEnd : function() {},
        runOnStart : false
    };
    
    $.fn.resizeend = function(options){
        return this.each(function(){
            (new $.resizeend(this, options));
        });
    };

$(document).ready(function() {
	if($('#search-page').length) {
			$('.green-font').each(function() {
				var link = $(this).text().split('/');
				$(this).text(link[0] + '//' + link[2] + '/' + link[3] + '/');
				$('.results-box a').attr('href', link[0] + '//' + link[2] + '/' + link[3] + '/');
			});
	}
});

$(document).ready(function() {
	 //scroll to anchors and top
	function scrollToAnchor(aid) {
	 	var aTag = $("a[name='" + aid + "']");
	 	$('html,body').animate({ scrollTop: aTag.offset().top }, 'slow');
	}

	$(".backtotop").click(function() {
	 	scrollToAnchor('top-page');
	});

	$('.ship-list').click(function() {
	 	if($('.ship-list').attr('id').length) {
	 		var linkId = $(this).attr('id').split('-')[1];
	 		scrollToAnchor('id' + linkId);
	 		$('.ship-list').removeClass('active');
	 		$(this).addClass('active');
	 	}
	});
	 
	 $('#pickupcoverage li').click(function(e){
	 	e.preventDefault();
	 	var elemId = $(this).attr("class").split('-')[1];
	 	$('.pickitup').removeClass('active');
	 	$('#pickup-'+elemId).addClass('active');
	 	var name = $(this).html();
	 	$(this).parents('.expand').find('span').html(name + '<i class="fa fa-minus"></i>');
	 });

	 $('#locations-list li').click(function(){
	 	var elemId = $(this).attr("id").split('-')[1];
	 	$('.location-list').removeClass('active');
	 	$('.locations-div').removeClass('active');
	 	$(this).addClass('active');
	 	$('#locations-'+elemId).addClass('active');
	 	var state = {
	 		"thisIsOnPopState": true
	 	};
	 	var wlh = window.location.href.split('?')[0];
	 	history.pushState(state, "New Title", wlh + '?id=' + elemId);
	 });
	 $('#locations li').click(function(e){
	 	e.preventDefault();
	 	var elemId = $(this).attr("class").split('-')[1];
	 	$('.location-toggle').css( "display", "none" );
	 	$('.nearest-location').removeClass('active');
	 	$('#nearestlocation-'+elemId).addClass('active');
	 	var name = $(this).html();
	 	$(this).parents('.expand').find('span').html(name + '<i class="fa fa-minus"></i>');
	 });
	 $('#nearestagent li').click(function(e){
	 	e.preventDefault();
	 	var elemId = $(this).attr("class").split('-')[1];
	 	$('.nearest-agent').removeClass('active');
	 	$('#nearestagent-'+elemId).addClass('active');
	 	var name = $(this).html();
	 	$(this).parents('.expand').find('span').html(name + '<i class="fa fa-minus"></i>');
	 });
	 $('.display-all-areas').click(function() {
	 	$('.nearest-location').addClass('active');
	 	$('.location-toggle').css( "display", "block" );
	 });
	 $("ul.abs li").click(function() {
	 	$("ul.abs li.active").removeClass("active");
	 	$(this).addClass("active");
	 });
	 $(".show-all-areas").click(function() {
	 	$(".pos-service.active").fadeOut('499');
	 	setTimeout(function() { $("table.small-areas").fadeIn('500'); }, 400);
	 	$(".pos-service").removeClass("active");
	 	$("table.small-areas").addClass("active");
	 });
	 $('.display-all-areas').click(function() {
	 	$('.time-list').addClass('active');
	 });
	 $('.display-all-areas').click(function() {
	 	$('.pickitup').addClass('active');
	 });
	 $('.faq').click(function() {
	 	$('#faq').slideToggle();
	 });
	
	if ($('#faq').length == true) {
		$('.question').click(function() {
			if ($(this).next('p.answer').css('display') == ('block')) {
				$(this).next('p.answer').slideUp();
			} else {
				$('p.answer').slideUp();
				$(this).next('p.answer').slideDown();
			}
		});
	}

	 //quick access widget
	 $('#callout').hover(function() {
	 	$('.hold-it').stop(true, false).animate({
	 		'right': '0px'
	 	}, 700);
	}, function() {
		//
	});
	$('.hold-it').hover(function() {
		// Do nothing
	}, function() {

		$('.hold-it').animate({
			right: '-77px'
		}, 600);

	});
	$('#shipment p').click(function() {
		$('#shipment div').not($(this).next('div')).slideUp('400');
	 	$(this).next('div').slideDown(400);
	});
	 $('.search-icon-small').click(function() {
	 	$('.small-search-bar').slideToggle();
	 });
	 $('#Button3').click(function() {
	 	$('.final-volumetric').addClass('active');
	 });
	 $('.final-volumetric, final-volumetric a').click(function(e) {
	 	e.preventDefault();
	 	$('.final-volumetric').removeClass('active');
	 });
});

if ($('#quick-access-widget').length == true) {

	$('#widgetContent ul li').click(function() {
		if ($('#quick-access').hasClass('dont-display')) {
			$('#quick-access').removeClass('dont-display');
		}
		
		var div = '.' + $(this).data('div');
		if ($(div).hasClass('active')) {
				//do nothing
			} else {
				$('.slide-ship').slideUp().removeClass('active');
				$(div).slideDown();
				$(div).addClass('active');
			}


		});
}

$(document).ready(function() {
	$(".navbar-toggle").click(function() {
		$("body").toggleClass('show-menu');
	});

	$('.navbar-toggle').click(function() {
		$('.show-menu .navbar-collapse').removeAttr('style');
		$('.show-menu .navbar-collapse').css('min-height', $(window).height() - 47);
	});
	$(document).on('click touchstart', '.no-click', 
		function(e) {
			e.preventDefault();
			var $parent = $(this).parent();
			$('.nav li a').not(this).nextAll('.sub-menu').slideUp();
			$('.nav li a').not(this).next('i.fa-minus').toggleClass('fa-minus fa-plus');
			$(this).next('i').toggleClass('fa-plus fa-minus');
			$(this).nextAll('.sub-menu').slideToggle();
	});
	/*services accordion*/
	$('.accordion-trigger').click(function() {
		$(this).find('i').toggleClass('fa-plus fa-minus');
		$(this).next('.accordion').slideToggle();
	});
	
	$('#service-6 ol li:eq(0)').after('<li><i class="fa fa-arrow-right"></i></li>');
	$('#service-6 ol li:eq(2)').after('<li><i class="fa fa-arrow-right"></i></li>');
	$('#service-14 ol li:eq(0)').after('<li><i class="fa fa-arrow-right"></i></li>');
	$('#service-14 ol li:eq(2)').after('<li><i class="fa fa-arrow-right"></i></li>');
	//about-us page	

	$(".about-memu li").click(function() {
		if (!$(this).hasClass("active")) {
			$(".about-memu li.active").removeClass("active").addClass("no-print");
			$(this).addClass("active").removeClass("no-print");
		}
	});
	
	
	$('#dots li').click(function() {
		var indexId = $(this).index();
		$('.fronttab').eq(indexId).click();
	});
	
	
	$(".fronttab").click(function() {
		var thisID = $(this).attr('id').split('-')[1];
		$(".about-content").fadeOut('499');
		setTimeout(function() { $("#about-content-" + thisID).fadeIn('500'); }, 400);
		$(".change").removeClass("active");
		$("#dot-" + thisID).addClass("active");
		var state = {
			"thisIsOnPopState": true
		};
		var wlh = window.location.href.split('?')[0];
		history.pushState(state, "New Title", wlh + '?id=' + thisID);
	});
	
	//end of about us page
	$(".plus-minus").click(function() {
		$("i", $(this)).toggleClass("fa-plus fa-minus");
	});
	
	
	$(".expand").click(function(e) {
		$(".st", $(this)).slideToggle();
		$("i", $(this)).toggleClass("fa-plus fa-minus");
		$(this).not('li:nth-child(2)').toggleClass("border-bottom");
	});
	
	$('.expand').outside('click', function(){
		$('.st', $(this)).slideUp();
		$('i', $(this)).attr('class','fa fa-plus');
	});
	
	$('#user_button').toggle(function() {
		$("#user_button").css({ borderBottomLeftRadius: "0px" });
	}, function() {
		$("#user_button").css({ borderBottomLeftRadius: "5px" });
	});

});

$(document).ready(function() {
 //services load pages
	 $(".service-list").click(function() {
	 	var id = $(this).attr('id').split('-')[1];
	 	$(".pos-service.active").fadeOut('499');
	 	setTimeout(function() { $("#service-" + id).fadeIn('500'); }, 400);
	 	$(".pos-service").removeClass("active");
	 	$("#service-" + id).addClass("active");
	 	var state = {
	 		"thisIsOnPopState": true
	 	};
	 	var wlh = window.location.href.split('?')[0];
	 	history.pushState(state, "New Title", wlh + '?id=' + id);
	 });

	 
	 $("a.plus-minus.clearfix").click(function() {
	 	$(this).toggleClass("border-bottom");
	 });

	 if ($(window).width() < 768) {
	 	$('#warehouse').html('Warehouse <i class="fa fa-plus"></i>');
	 }
});

//Calling pages over url/?id=

$(document).ready(function() {
	if (document.location.search) {
		var url = window.location.href;
		var temp1 = url.split("?");
		var id1 = temp1[1];
		var temp2 = temp1[1].split("=");
		var id = temp2[1];

		if(id1 == "poslaju-domestic") {
			setTimeout(function() {
				$('#personal').click();								
			}, 1000);
			setTimeout(function() {
				$('.personal-accordion > li:first-child > a').click();
				$('.pos-service').removeClass('active');
				$('#service-1').addClass('active');
			}, 2000);
		}
		
		$('.fronttab').each(function(){
			$(this).removeClass('active');
		});
		
		$('#fronttab-'+ id).addClass('active');
		
		$('.triangle').each(function(){
			$(this).removeClass('active');
		});

		$('#triangle'+ id).addClass('active');


		//$('.log').each(function() {
		//	$(this).removeClass('active');
		//});
		
		//$('#login'+id).addClass('active');

		//$('.log-link').each(function() {
		//	$(this).removeClass('active');
		//});
		//$('.login'+id).addClass('active');	
		
		$('.about-content').each(function(){
			$(this).removeClass('active');
		});
		$('#about-content-'+id).addClass('active');
		
		$('.dot').each(function(){
			$(this).removeClass('active');
		});
		
		$('#dot-'+id).addClass('active');
		

		$('.pos-service').each(function() {
			$(this).removeClass('active');
		});
		$('#service-'+id).addClass('active');
		
		$('.locations-div').each(function(){
			$(this).removeClass('active');
			$('.location-list').removeClass('active');
		});
		$('#locations-'+id).addClass('active');
		$('#locationslist-'+id).addClass('active');
		
		$('.small-locations').each(function() {
			$(this).removeClass('active');
		});
		$('#smalllocations-'+id).addClass('active');
	}
});

$(document).ready(function() {
	function changeText() {
		if ($('#locationslist-4').hasClass('active')) {
			$('.change-enquiries').text('Where can I find this information?');
			$('.change-enquiries').next('h4').text('For further enquiries, please contact us via the details provided below');
		} else if ($('#locationslist-3').hasClass('active')) {
			$('.change-enquiries').text('Pos Laju Agents Location');
			$('.change-enquiries').next('h4').text('Find the nearest Pos Laju Agent in your area');
		} else if ($('#locationslist-2').hasClass('active')) {
			$('.change-enquiries').text('Pos Laju Kiosk Locations');
			$('.change-enquiries').next('h4').text('Find the nearest Pos Laju kiosk in your area');
		} else {
			$('.change-enquiries').text('Pos Laju Branch Locations');
			$('.change-enquiries').next('h4').text('Find the nearest Pos Laju Branch in your area');
		}
	};
	
	changeText();
	
	$('.location-list').click(function() {
		changeText();
	});
	
	//branches on mobile
	$('#small-branches a').on('click touchstart',
		function(e) {
			e.preventDefault();
			$('i', this).toggleClass('fa-plus fa-minus');
			$(this).nextAll('div').slideToggle();
	});
});

//Counter slider on home page
$(document).ready(function() {
	// settings
  var $slider = $('.slider'); // class or id of carousel slider
  var $slide = 'li'; // could also use 'img' if you're not using a ul
  var $transition_time = 1000; // 1 second
  var $time_between_slides = 4000; // 4 seconds

  function slides(){
  	return $slider.find($slide);
  }

  slides().fadeOut();

  // set active classes
  slides().first().addClass('active');
  slides().first().fadeIn($transition_time);

  // auto scroll 
  $interval = setInterval(
  	function(){
  		var $i = $slider.find($slide + '.active').index();

  		slides().eq($i).removeClass('active');
  		slides().eq($i).fadeOut($transition_time);

	  if (slides().length == $i + 1) $i = -1; // loop to start

	  slides().eq($i + 1).fadeIn($transition_time);
	  slides().eq($i + 1).addClass('active');
	}
	, $transition_time +  $time_between_slides 
	);
	$('#accordion li:nth-child(3)').click(function() {
  	$('#start p').text('Pos Laju is the national courier that provides a range of express courier and parcel services with the widest delivery network in Malaysia. Visit the nearest Pos Laju Centre to send your item without hassle at reasonable charges.');
  });
});

//Controlling cube on input focus and if input has value
$(document).ready(function() {
	$('input#panjang').focus(function() {
		$('#length').attr('class','style0 orange-input');
	});
	$('input#panjang').focusout(function() {
		if ($('input#panjang').val()) {
			//do nothing 
		} else {
			$('#length').attr('class','style0');
		}
	});
	$('input#lebar').focus(function() {
		$('#height').attr('class','style0 orange-input');
	});
	$('input#lebar').focusout(function() {
		if ($('input#lebar').val()) {
			//do nothing 
		} else {
			$('#height').attr('class','style0');
		}
	});
	$('input#tinggi').focus(function() {
		$('#width').attr('class','style0 orange-input');
	});
	$('input#tinggi').focusout(function() {
		if ($('input#tinggi').val()) {
			//do nothing 
		} else {
			$('#width').attr('class','style0');
		}
	});
});

function roundNumber(num, dec) {
	var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
	return result;
}

function isValidNumericInput(evt) {
	var charCode = evt ? (evt.which != undefined ? evt.which : evt.keyCode) : event.keyCode;

		// FF does not like event.keyCode; only allow digits + backspace (8) + . (46) + tab (0)
		if( (charCode >= 48 && charCode <= 57) || charCode == 8 || charCode == 46 || charCode == 0 ) {
			return true;
		}
		return false;
	}
	function calculateVolumetric1()
	{
		var length = 0;
		var width = 0;
		var height = 0;


		if ($('#panjang1').val()!="")
		{
			length=parseFloat($('#panjang1').val());
		}
		if ($('#lebar1').val()!="")
		{
			width=parseFloat($('#lebar1').val());
		}
		if ($('#tinggi1').val()!="")
		{
			height=parseFloat($('#tinggi1').val());
		}
		var dimWeight = (length * width * height)/6000;
	//$('#volumetricVal').val(roundNumber(dimWeight,2));
	//document.getElementById('mySpan').innerHTML = roundNumber(dimWeight,2)
	var paragraph = document.getElementById("volumetricVal1");
	paragraph.innerHTML = roundNumber(dimWeight,2);
}
function calculateVolumetric()
{
	var length = 0;
	var width = 0;
	var height = 0;
	
	if ($('#panjang').val()!="")
	{
		length=parseFloat($('#panjang').val());
	}
	if ($('#lebar').val()!="")
	{
		width=parseFloat($('#lebar').val());
	}
	if ($('#tinggi').val()!="")
	{
		height=parseFloat($('#tinggi').val());
	}
	var dimWeight = (length * width * height)/6000;
	//$('#volumetricVal').val(roundNumber(dimWeight,2));
	//document.getElementById('mySpan').innerHTML = roundNumber(dimWeight,2)
	var paragraph = document.getElementById("volumetricVal");
	paragraph.innerHTML = roundNumber(dimWeight,2);
}
function isDefaultValue(str)
{   
	alert("test");
	var val="Enter your tracking number(s)";
	var trackInput=$('#trackNo').val();
	
	if(trackInput.length==0 && trackInput=='')
	{      
		$('#trackNo').val(val);

	}    
	else if(trackInput.length==0 && trackInput==val)
	{       
		$('#trackNo').val(val);

	}
	else if(trackInput.length>0 && trackInput==val)
	{
	   //alert(val);
	   $('#trackNo').val('');
	   
	}
	else if(trackInput.length>0 && trackInput!=val)
	{
		$('#trackNo').val(trackInput);     
	}
	$('#ErrMsg').html('');        
}

function submitPickup()
{
	
	if(jQuery('#form1').validationEngine('validate')==true)
	{   

		//alert("Masuk");
		var url="Service1.asmx/";

		var sName=$('#SendersName').val();
		var sCompany=$('#SendersCompany').val();
		var sAddress1=$('#SendersAddress1').val();
		var sAddress2=$('#SendersAddress2').val();
		var sPostCode=$('#SendersPostCode').val();
		var sCity=$('#SendersCity').val();
		var sState=$('#SendersState').val();
		var sPhoneNo=$('#SendersPhoneNo').val();
		var sEmail=$('#SendersEmail').val();    

		var rName=$('#RcvrsName').val();
		var rCompany=$('#RcvrsCompany').val();
		var rAddress1=$('#RcvrsAddress1').val();
		var rAddress2=$('#RcvrsAddress2').val();
		var rPostCode=$('#RcvrsPostCode').val();
		var rCity=$('#RcvrsCity').val();
		var rState=$('#RcvrsState').val();
		var rPhoneNo=$('#RcvrsPhoneNo').val();
		var rEmail=$('#RcvrsEmail').val();
		
		
		$.ajaxDotNet(url + "saveConsignment_ODP", {
			verb: "POST",
			data: {SenderName:sName,SenderCompany:sCompany,SenderAddress1:sAddress1,SenderAddress2:sAddress2,SenderPostCode:sPostCode,SenderCity:sCity,SenderState:sState,SenderPhoneNo:sPhoneNo,SenderEmail:sEmail,RcvrName:rName,RcvrCompany:rCompany,RcvrAdd1:rAddress1,RcvrAdd2:rAddress2,RcvrPostcode:rPostCode,RcvrCity:rCity,RcvrState:rState,RcvrPhone:rPhoneNo,RcvrEmail:rEmail},
			success: function(obj) {		    
				if(obj!=null)
				{    
					//alert(obj);
					if(obj=="System Error 1515")
					{
						alert("Connote Range Error!!!\nPlease Contact Poslaju System Admin!!!");
					}
					else if(obj=="System Error")
					{
						alert("System Error!!!\nPlease Contact Poslaju System Admin!!!");
					}
					else if(obj=="")
					{
						alert("System Error!!!");
					}
					else
					{
						//Redirect to print poslaju connoteno
						alert("Please Print the Consignment Note.");
						location.href="PrintingPoslajuConnote_A4.aspx?ConsId="+obj;		                
					}
				}
				else
				{
					alert("Error !!!");
				}   

			},
			error: function(xhr, st, e) {
				alert("Error :"+ e.Message);
			 //$('#progress').dialog('close');
			}
			
		});
	}       
}
	
window.goBack = function (e){
	var defaultLocation = "http://poslaju.com.my/";
	var oldHash = window.location.hash;

	history.back(); // Try to go back

	var newHash = window.location.hash;

	/* If the previous page hasn't been loaded in a given time (in this case
	* 1000ms) the user is redirected to the default location given above.
	* This enables you to redirect the user to another page.
	*
	* However, you should check whether there was a referrer to the current
	* site. This is a good indicator for a previous entry in the history
	* session.
	*
	* Also you should check whether the old location differs only in the hash,
	* e.g. /index.html#top --> /index.html# shouldn't redirect to the default
	* location.
	*/

	if(
		newHash === oldHash &&
		(typeof(document.referrer) !== "string" || document.referrer  === "")
		){
		window.setTimeout(function(){
			// redirect to default location
			window.location.href = defaultLocation;
		},1000); // set timeout in ms
	}
	if(e){
		if(e.preventDefault)
			e.preventDefault();
		if(e.preventPropagation)
			e.preventPropagation();
	}
	return false; // stop event propagation and browser default event
}

// Quck access Home Page

$(document).ready(function() {
	var $location = location.pathname;
	var $home = '/';
	var $home1 = '/my/';
	var $width = $(window).width;
	if ($location == $home || $location == $home1) {
		$('#quick-access').removeClass('dont-display');
	}
	$('#quick-access h4 span').click(function() {
		$('#quick-access').addClass('dont-display');				
	});
	if (($location == $home || $location == $home1) && $width < 768) {
		$('#quick-access').css('display','block');
	}
	$(window).on('resize', function(){
		  var win = $(this); //this = window
		  if ($location == $home && win.innerWidth() < 750) {
		  	console.log(win.innerWidth());
		  	$('#quick-access').removeClass('dont-display');
		  	$('#close').css('display','none');
		  }
		  if ($location == $home && win.innerWidth() >= 750) {
		  	$('#close').css('display','inline-block');
		  }
	});
});

$.fn.hariWidth = function() {
	var widthImg = $('.hari-img').width();
	this.css('width', widthImg);
	return this;
}
$(window).load(function() {

	$('.hari-wrap').hariWidth();

	$(window).resize(function() {
		if ($(window).width() > 1060) {
			$('.hari-wrap').css('width','100%');
			
			$(window).resizeend(
				  {
						onDragEnd : function() {  $('.hari-wrap').hariWidth(); },
						runOnStart : true
				  }
			);

		} else {
			$('.hari-wrap').removeAttr('style');
		}
	});
});

$(document).ready(function() {
	
	if(detectIE() == false) {
		$('.hari-img').outside('click', function(){
			$('.hari-holder').css('display','none');
		});
	}
	$('.hari-close').click(function(e) {
		e.preventDefault();
		$('.hari-holder').css('display','none');
	});
	console.log(document.cookie);
	var visit = getCookie("cookie");
    if (visit == null) {
		$('.hari-close').click(function(e) {
			e.preventDefault();
			$('.hari-holder').css('display','none');
			var minutes = 1800;
			var expire = new Date();
			expire = new Date(expire.getTime() + (minutes * 60 * 1000));
			document.cookie = "cookie=here; expires=" + expire;
		});
        
	} else {
		$('.hari-holder').css('display','none');
	}
	
	if(detectIE() != false) {
		$('#browser-support').css('display','block');
		if($('.hari-holder').length) {
			$('.hari-holder').css('visibility','hidden');
		}
		$('.browser-close').click(function(e) {
			e.preventDefault();
			$('#browser-support').css('display','none');
			if($('.hari-holder').length) {
				$('.hari-holder').css('visibility','visible');
			}
		});
		$('.browser-wrap').outside('click', function() {
			$('#browser-support').css('display','none');
			if($('.hari-holder').length) {
				$('.hari-holder').css('visibility','visible');
			}
		});
		if($('.hari-holder').attr('style') == 'visibility: visible') {
		  	$('.hari-img').outside('click', function(){
				$('.hari-holder').css('display','none');
			});
		}
	}
});

$(document).ready(function() {
	var	url = window.location.pathname,
	temp = url.split("/"),
		//temp1 = url.split("?"),
		base1 = temp[0],
		//base2 = temp[2],
		id = temp[1];
		$('#tnt-submit').click(function() {
			var trackNtraceVal = $('#tnt-input').val();
			localStorage.setItem("trackingnumber", trackNtraceVal);
			window.location.href = base1 + "/track-trace/";
		});
		if((id == "track-trace") && (localStorage.getItem("trackingnumber") !== null)) {
			$("#tracking_ids").val(localStorage.getItem("trackingnumber"));
		//setTimeout(function() {
			$("#tracking_submit").click();
			localStorage.removeItem("trackingnumber");
		//},1000);
		}

// Hari raya greetings
	//$('.hari-img').outside('click', function(){
	//	$('.hari-holder').css('display','none');
	//});
	
//	$('.hari-close').click(function(e) {
//		e.preventDefault();
//		$('.hari-holder').css('display','none');
//	});
//	
//	var visit = getCookie("_close");
  //  if (visit == null) {
//		$('.hari-close').click(function(e) {
//			e.preventDefault();
//			$('.hari-holder').css('display','none');
//			var minutes = 1800;
//			var expire = new Date();
//			expire = new Date(expire.getTime() + (minutes * 60 * 1000));
//			document.cookie = "_close=hari; expires=" + expire;
//		});
  //      
//	} else {
//		$('.hari-holder').css('display','none');
//	}

});
