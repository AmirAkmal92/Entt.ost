// JavaScript Document

var quote = {
	ajaxLoading : {},
	placeFrom : "Place",
	placeTo : "Place",
	errPoint : {
		err : false,
		arr : []
	},
	addBox : function(){
		var count = parseFloat($($("#QuoteAndBook [row]").get($("#QuoteAndBook [row]").length - 1)).attr("row"));
		if(isNaN(count)){count = 0;}
		//alert($("#TEMP").html());
		$("#QuoteAndBook .qrow:last").before($("#TEMP tbody").html());
		$("#QuoteAndBook [row=0] [step]").tooltip();
		$("#QuoteAndBook [row=0]").find("[ref=0]").attr("ref", count + 1);
		$("#QuoteAndBook [row=0]").attr("row", count + 1);
		this.step1($("#QuoteAndBook [row="+(count + 1)+"]").find("[step=1]"));
	},
	
	duplicateBox : function(obj){
		index = $(obj).parents("[row]").attr("row");
		var count = parseFloat($($("#QuoteAndBook [row]").get($("#QuoteAndBook [row]").length - 1)).attr("row"));
		if(isNaN(count)){count = 0;}
		$("#QuoteAndBook .qrow:last").before(
			'<tr class="qrow" row="'+(count + 1)+'">' +$("#QuoteAndBook [row="+index+"]").html() + "</tr>"
		    );	
		$("#QuoteAndBook [row="+(count + 1)+"] [step]").tooltip();
		$("#QuoteAndBook [row="+(count + 1)+"] .dup").attr("onclick","quote.duplicateBox(this)");
		$("#QuoteAndBook [row="+(count + 1)+"]").find("[ref="+index+"]").attr("ref", count + 1);
		this.UpdateDulicate(count + 1 , index-1);
		this.dataCache("",(count + 1));
		//this.step1($("#QuoteAndBook [row="+(count + 1)+"]").find("[step=1]"));
	},
	
	UpdateDulicate : function(rowI , SelI){
	//step 1
		var cart = quote.collectData();
		var selected = "[row="+rowI+"]";
		$(selected).find("[txt_weight]").val(cart[SelI].weight);
		$(selected).find("[step=1] [w]").html(cart[SelI].weight);
		$(selected).find("[txt_width]").val(cart[SelI].width);
		$(selected).find("[step=1] [wi]").html(cart[SelI].width);
		$(selected).find("[txt_length]").val(cart[SelI].length);
		$(selected).find("[step=1] [l]").html(cart[SelI].length);
		$(selected).find("[txt_height]").val(cart[SelI].height);
		$(selected).find("[step=1] [h]").html(cart[SelI].height);
		$(selected).find("[txt_refer]").val(cart[SelI].refer);
		$(selected).find("[txt_comment]").val(cart[SelI].comment);
		$(selected).find("[txt_parcel_contents]").val(cart[SelI].parcel_contents);
		//alert (cart[SelI].parcel_contents);l
		$(selected).find("[txt_estimated]").val(cart[SelI].estimated);
		$(selected).find("[txt_coll_date]").val(cart[SelI].coll_date);
		
	//step 2
     $(selected).find("[step=coll]").html(cart[SelI].c_state_text);
	   //alert(cart[SelI].c_state_text);
	   $(selected).find("[txt_c_state]").val(cart[SelI].c_state_text);
	   $(selected).find("[txt_c_name]").val(cart[SelI].c_name);
	   $(selected).find("[txt_c_company]").val(cart[SelI].c_company);
	   $(selected).find("[txt_c_contact]").val(cart[SelI].c_contact);
	   $(selected).find("[txt_c_contact_code]").val(cart[SelI].c_contact_code);
	   $(selected).find("[txt_c_alt_contact]").val(cart[SelI].c_alt_contact);
	   $(selected).find("[txt_c_alt_contact_code]").val(cart[SelI].c_alt_contact_code);
		 $(selected).find("[txt_c_building]").val(cart[SelI].c_building);
	   $(selected).find("[txt_c_unit]").val(cart[SelI].c_unit);
	   $(selected).find("[txt_c_floor]").val(cart[SelI].c_floor);
	   $(selected).find("[txt_c_block]").val(cart[SelI].c_block);
	   $(selected).find("[txt_c_addr1]").val(cart[SelI].c_addr1);
	   $(selected).find("[txt_c_addr2]").val(cart[SelI].c_addr2);
	   $(selected).find("[txt_c_addr3]").val(cart[SelI].c_addr3);
	   $(selected).find("[txt_c_postcode ]").val(cart[SelI].c_postcode);
	   $(selected).find("[txt_c_city]").val(cart[SelI].c_city );
	   $(selected).find("[txt_c_country]").val(cart[SelI].c_country);
	   $(selected).find("[txt_c_aid]").val(cart[SelI].c_aid);
	   
	 //step 3
	   $(selected).find("[step=deli]").html(cart[SelI].d_state_text);
	   $(selected).find("[txt_d_state]").val(cart[SelI].d_state_text);
	   $(selected).find("[txt_d_name]").val(cart[SelI].d_name);
	   $(selected).find("[txt_d_company]").val(cart[SelI].d_company);
	   $(selected).find("[txt_d_contact]").val(cart[SelI].d_contact);
	   $(selected).find("[txt_d_contact_code]").val(cart[SelI].d_contact);
	   $(selected).find("[txt_d_alt_contact]").val(cart[SelI].d_alt_contact);
	   $(selected).find("[txt_d_alt_contact_code]").val(cart[SelI].d_alt_contact_code);
		 $(selected).find("[txt_d_building]").val(cart[SelI].d_building);
	   $(selected).find("[txt_d_unit]").val(cart[SelI].d_unit);
	   $(selected).find("[txt_d_floor]").val(cart[SelI].d_floor);
	   $(selected).find("[txt_d_block]").val(cart[SelI].d_block);
	   $(selected).find("[txt_d_addr1]").val(cart[SelI].d_addr1);
	   $(selected).find("[txt_d_addr2]").val(cart[SelI].d_addr2);
	   $(selected).find("[txt_d_addr3]").val(cart[SelI].d_addr3);
	   $(selected).find("[txt_d_postcode ]").val(cart[SelI].d_postcode);
	   $(selected).find("[txt_d_city]").val(cart[SelI].d_city );
	   $(selected).find("[txt_d_country]").val(cart[SelI].d_country);
	   $(selected).find("[txt_d_aid]").val(cart[SelI].d_aid);
	   return;
	},
	
	addDropbox : function(obj){
		if($("#dropbox").length > 0){
			$("#dropbox").remove();
		}
		if($(".dropbox-select").length > 0){
			$(".dropbox-select").removeClass("dropbox-select");
		}
		for(p in quote.ajaxLoading){
			quote.ajaxLoading[p] = false;
		}
		$(obj).parent().parent().addClass("dropbox-select");
		$(obj).parents(".qrow").after(
			'<tr class="qrow" id="dropbox">'+
			'<td colspan="6">'+
				'<div class="dropbox-header">' + 
					'<button type="button" class="close" onclick="quote.closeDropbox()">&times;</button>' + 
					'<h3></h3>' + 
				'</div>' +
				'<div class="dropbox-body">' + 
				'</div>' + 
			'</td>'+
			'</tr>'/*+//*/
		);
		$("#dropbox").hide().show(200);
	},
	
	closeDropbox : function(){
		if($("#dropbox").length > 0){
			$("#dropbox").hide(200,function(){
				$("#dropbox").remove();
			})
		}
		if($(".dropbox-select").length > 0){
			$(".dropbox-select").removeClass("dropbox-select");
		}
	},
	
	delBox : function(obj){
		$(obj).parents("tr").remove();
		this.dataCache("delete");
		quote.closeDropbox();
		quote.SumTotal();
	},
	
	cal_max : function(obj){
		var p = $(obj).parents("[ref]");
		var selected = "[row="+p.attr("ref")+"]";
		 if($(obj).val() > 0 && !isNaN($(obj).val())){ /* set numeric value - solve bug on 15/12/14*/
			$.ajax({
			type : "post",
			url : "./?ac=getMaxWeightLimit",
			data : {},
			success : function(result){
				

				if(parseFloat($(obj).val())>parseFloat(result))
				{
					

					$(obj).val("");
					$(p).find("#max_w").html("___");
					//CJ-S
					$( "#dialog").html("Your weight should not exceeded " + result + " Kg.").dialog({
						title: "Oops!",
						resizable: false,
						maxWidth:500,
						width: 'auto',
						modal: true,
						buttons: {"Ok": function(){$( this ).dialog( "close" );}}
					});
					//CJ-E
				}
				else
				{
					//Below is to display the height and length
					var maxi = Math.round(Math.pow($(obj).val()* 5000,(1/3)) * 100) / 100
					var msg = $(obj).val();
					$(p).find("#max_w").html(msg);
				
				}
			}
			});
			

		}else{
			//CJ alert("Allowed numbers only. For eg : 1.00 or 1"); /* set numeric value - solve bug on 15/12/14*/
			//CJ-S
			$( "#dialog" ).html("Allowed numbers only. For eg : 1.00 or 1.").dialog({
						title: "<strong>WARNING</strong>",
						resizable: false,
						maxWidth:550,
						width: 'auto',
						modal: true,
						buttons: {"Ok": function(){$( this ).dialog( "close" );}}
					});
			//CJ-E
			$(obj).val("");
			$(p).find("#max_w").html("___");
		}
	},
	
	
	step1 : function(obj){
		this.addDropbox(obj);
		$('#dropbox .dropbox-body').html($(obj).parent().find('.editor').html());
		$('#dropbox .dropbox-header h3').html("Parcel Detail");
		$('#dropbox .dropbox-body [txt_weight]').val($(obj).parent().find('.editor [txt_weight]').val());
		$('#dropbox .dropbox-body [txt_width]').val($(obj).parent().find('.editor [txt_width]').val());
		$('#dropbox .dropbox-body [txt_length]').val($(obj).parent().find('.editor [txt_length]').val());
		$('#dropbox .dropbox-body [txt_height]').val($(obj).parent().find('.editor [txt_height]').val());
		$('#dropbox .dropbox-body [txt_refer]').val($(obj).parent().find('.editor [txt_refer]').val());
		$('#dropbox .dropbox-body [txt_comment]').val($(obj).parent().find('.editor [txt_comment]').val());
		$('#dropbox .dropbox-body [txt_parcel_contents]').val($(obj).parent().find('.editor [txt_parcel_contents]').val());
		$('#dropbox .dropbox-body [txt_estimated]').val($(obj).parent().find('.editor [txt_estimated]').val());
		$('#dropbox .dropbox-body [txt_coll_date]').val($(obj).parent().find('.editor [txt_coll_date]').val());
		$('#dropbox .dropbox-body [txt_coll_date]').datepicker({
			changeYear:true,
			changeMonth:true,
			dateFormat : 'yy-mm-dd',
			beforeShowDay: quote.loadDate,
			minDate:0,
			maxDate:14
		});
	},
	
	UpdateStep1 : function(obj){
		var p = $(obj).parent();
		//alert($(obj).parents(".qrow").html());
		//alert(p.attr("ref"));
		var selected = "[row="+p.attr("ref")+"]";
		var weight = width = length = height = 0.1;
		if($(p).find("[txt_weight]").val() != "" && !isNaN($(p).find("[txt_weight]").val())){
			weight = $(p).find("[txt_weight]").val();
		}
		if($(p).find("[txt_width]").val() != "" && !isNaN($(p).find("[txt_width]").val())){
			width = $(p).find("[txt_width]").val();
		}
		if($(p).find("[txt_length]").val() != "" && !isNaN($(p).find("[txt_length]").val())){
			length = $(p).find("[txt_length]").val();
		}
		if($(p).find("[txt_height]").val() != "" && !isNaN($(p).find("[txt_height]").val())){
			height = $(p).find("[txt_height]").val();
		}
		
		var pass = true;
		if(General.isTextEmpty($(p).find("[txt_weight]"))){
			pass = false;
		}
		if(General.isTextEmpty($(p).find("[txt_parcel_contents]"))){
			pass = false;
		}
		if(General.isTextEmpty($(p).find("[txt_estimated]"))){			
			pass = false;		
		}else{
			if(!General.isNumber($(p).find("[txt_estimated]"))){
				pass = false;
			}
		}
		if(General.isTextEmpty($(p).find("[txt_coll_date]"))){
			pass = false;
		}


		var courierpass = true;
		
		//start added by Willam, date : 24-12-2014, Error message display for no courier service
			var d = new Date();
			var strDate = d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate() + " " + "12:00:00";
			$.ajax({
				type : "post",
				url : "./?ac=getCurrentDateTime",
				async: false,
				data : {},
				success : function(result){

					var datetimesplit= result.split(" ");
					var todaysdate=datetimesplit[0]+ " " + "00:00:00";
					var selecteddate=$(p).find("[txt_coll_date]").val()+ " " + "00:00:00";


					if(Date.parse(todaysdate)===Date.parse(selecteddate))
					{
						if(Date.parse(result) > Date.parse(strDate))
						{
						pass = false;
						courierpass = false;
						}
					}
				}
			});
			
			//end added by Willam, date : 24-12-2014
		

		if(pass){
			//alert(selected);
			$(selected).find("[txt_weight]").val(weight);
			$(selected).find("[step=1] [w]").html(weight);
			$(selected).find("[txt_width]").val(width);
			$(selected).find("[step=1] [wi]").html(width);
			$(selected).find("[txt_length]").val(length);
			$(selected).find("[step=1] [l]").html(length);
			$(selected).find("[txt_height]").val(height);
			$(selected).find("[step=1] [h]").html(height);
			
			$(selected).find("[txt_refer]").val($(p).find("[txt_refer]").val());
			$(selected).find("[txt_comment]").val($(p).find("[txt_comment]").val());
			$(selected).find("[txt_parcel_contents]").val($(p).find("[txt_parcel_contents]").val());
			$(selected).find("[txt_estimated]").val($(p).find("[txt_estimated]").val());
			$(selected).find("[txt_coll_date]").val($(p).find("[txt_coll_date]").val());
					
			this.dataCache("",p.attr("ref"));
			
			$(selected).find("[step=1]").attr(
				"data-original-title",
				"Good : " + $(p).find("[txt_parcel_contents]").val() + ", " +
				"Value : RM " + $(p).find("[txt_estimated]").val() + ", " +
				"Collection Date : " + $(p).find("[txt_coll_date]").val()
			);
			
			if($($(selected).find(".step").get(0)).hasClass("step_new")){
				this.newStep(selected);
				//$('#popupbox').hide().show("scale",{},300);
				this.CollAddr($(selected).find("[step=coll]"));
			}else{
				//$('#popupbox').modal('hide');
				this.CollAddr($(selected).find("[step=coll]"));
			}
		}
		else if(courierpass === false)
		{
			$( "#dialog" ).html("No courier available! Same day delivery cut off time are 12pm. Kindly choose the next day to select available courier services.").dialog({
				title: "<strong>WARNING</strong>",
				resizable: false,
				maxWidth:550,
				width: 'auto',
				modal: true,
				buttons: {"Ok": function(){$( this ).dialog( "close" );}}
			});
		}
		else if(!General.isNumber($(p).find("[txt_estimated]")))
		{
			$( "#dialog" ).html("Value of goods can only support numeric input.").dialog({
				title: "<strong>WARNING</strong>",
				resizable: false,
				maxWidth:550,
				width: 'auto',
				modal: true,
				buttons: {"Ok": function(){$( this ).dialog( "close" );}}
			});
		}
		else
		{
			//CJ-S alert("Please Complete the required field.");
			$( "#dialog" ).html("Please Complete the required field.").dialog({
				title: "<strong>WARNING</strong>",
				resizable: false,
				maxWidth:550,
				width: 'auto',
				modal: true,
				buttons: {"Ok": function(){$( this ).dialog( "close" );}}
			});//CJ-E
		}
	},
	
	newStep:function(obj){
		var oldStep = $(obj).find(".step_new").get(0);
		var newStep = $(obj).find(".step_none").get(0);
		
		$(oldStep).addClass("step_done");
		$(oldStep).removeClass("step_new");
		
		if($(obj).find(".step_none").length == 1){
			$(newStep).addClass("step_done");
			$(newStep).addClass("end");
		}else{
			$(newStep).addClass("step_new");
		}
		$(newStep).removeClass("step_none");
		$(newStep).show();
	},
	
	ClickAddressBook : function(fix){
		var browseImage = 
		window.open(
			"./?cp=AddressBook&for="+fix,
			"easyparceladdressbook",
			"location=1,status=1,scrollbars=1,width=0,height=550;"
		);
	},
	
	OpenAddressBook : function(obj){
		//var name = $(obj).parent().find("input").val();
		 var row =$(obj).parent().attr("row");
		 var name = $("#list [row="+row+"]").find("input").val();
		//alert(name);
		//alert(row);
		var key = $("#list [row="+row+"]").attr("id");
		//alert(key);
		var browseImage = 
		window.open(
			"./?cp=ClientAddressBook&for="+name+"&row="+row+"&key="+key,
			"",
			"location=1,status=1,scrollbars=1,width=0,height=550;"
		);
	},
	
	RetriveAddressBook : function(key){
		var browseImage = 
		window.open(
			"./?cp=ClientAddressBook&key="+key,
			"",
			"location=1,status=1,scrollbars=1,width=0,height=550;"
		);
	},	
	
	CollAddr : function(obj){
		this.addDropbox(obj);
		$('#dropbox').css("background-color","#ffdfdd");
		$('#dropbox').css("color","#123456");
		$('#dropbox .dropbox-body').html($(obj).parent().find('.editor-c').html());
		$('#dropbox .dropbox-header h3').html("Collection Address <span style='font-size:12px'>- Where you want us to collect your parcel from?</span>");
		
		
		$('#dropbox .dropbox-body [txt_c_name]').val($(obj).parent().find('.editor-c [txt_c_name]').val());
		$('#dropbox .dropbox-body [txt_c_company]').val($(obj).parent().find('.editor-c [txt_c_company]').val());
		$('#dropbox .dropbox-body [txt_c_contact]').val($(obj).parent().find('.editor-c [txt_c_contact]').val());
		$('#dropbox .dropbox-body [txt_c_contact_code]').val($(obj).parent().find('.editor-c [txt_c_contact_code]').val());
		$('#dropbox .dropbox-body [txt_c_alt_contact]').val($(obj).parent().find('.editor-c [txt_c_alt_contact]').val());
		$('#dropbox .dropbox-body [txt_c_alt_contact_code]').val($(obj).parent().find('.editor-c [txt_c_alt_contact_code]').val());
		$('#dropbox .dropbox-body [txt_c_addr1]').val($(obj).parent().find('.editor-c [txt_c_addr1]').val());
		$('#dropbox .dropbox-body [txt_c_unit]').val($(obj).parent().find('.editor-c [txt_c_unit]').val());
		$('#dropbox .dropbox-body [txt_c_floor]').val($(obj).parent().find('.editor-c [txt_c_floor]').val());
		$('#dropbox .dropbox-body [txt_c_block]').val($(obj).parent().find('.editor-c [txt_c_block]').val());
		$('#dropbox .dropbox-body [txt_c_addr2]').val($(obj).parent().find('.editor-c [txt_c_addr2]').val());
		$('#dropbox .dropbox-body [txt_c_building]').val($(obj).parent().find('.editor-c [txt_c_building]').val());
		$('#dropbox .dropbox-body [txt_c_addr3]').val($(obj).parent().find('.editor-c [txt_c_addr3]').val());
		$('#dropbox .dropbox-body [txt_c_postcode]').val($(obj).parent().find('.editor-c [txt_c_postcode]').val());
		$('#dropbox .dropbox-body [txt_c_city]').val($(obj).parent().find('.editor-c [txt_c_city]').val());
		$('#dropbox .dropbox-body [txt_c_state]').val($(obj).parent().find('[step=coll]').attr("state"));
		$('#dropbox .dropbox-body [txt_c_state_text]').val($(obj).parent().find('.editor-c [txt_c_state_text]').val());
		$('#dropbox .dropbox-body [txt_c_aid]').val($(obj).parent().find('.editor-c [txt_c_aid]').val());
		$('#dropbox .dropbox-body [txt_c_country]').val($(obj).parent().find('.editor-c [txt_c_country]').val());
		$( "#dropbox .dropbox-body [txt_c_addr1],#dropbox .dropbox-body [txt_c_building],#dropbox .dropbox-body [txt_c_addr2],#dropbox .dropbox-body [txt_c_addr3]" ).autocomplete({
			source : function(request, response){
				var url = "./?ac=StreetAutoComplete&street="+request.term;
				$.ajax({
					type : "get",
					url : url,
					success : function(data){
						//*
						response( $.map(data, function(item){
							return {
								label : item.street + " ("+ item.state +")",
								value : item.street,
								state : item.state_code,
								postcode : item.postcode
							}
						}));//*/
					}
				});
			},
			select : function (event , ui){
				$("#dropbox .dropbox-body [txt_c_postcode]").val(ui.item.postcode);
				$("#dropbox .dropbox-body [txt_c_state]").val(ui.item.state);
			}
		});
	},
	
	CollAddrChange : function(obj){
		$('#dropbox .dropbox-body [txt_c_aid]').val(0);
	},
	
	UpdateCollAddr : function(obj){
		var p = $(obj).parent();
		var selected = "[row="+p.attr("ref")+"]";
		var aid = $(p).find("[txt_c_aid]").val();
		var name = $(p).find("[txt_c_name]").val();
		var company = $(p).find("[txt_c_company]").val();
		var contact = $(p).find("[txt_c_contact]").val();
		var contact_code = $(p).find("[txt_c_contact_code]").val();
		var contact_alt = $(p).find("[txt_c_alt_contact]").val();
		var contact_alt_code = $(p).find("[txt_c_alt_contact_code]").val();
		var addr1 = $(p).find("[txt_c_addr1]").val();
		var unit = $(p).find("[txt_c_unit]").val();
		var floor = $(p).find("[txt_c_floor]").val();
		var block = $(p).find("[txt_c_block]").val();
		var addr2 = $(p).find("[txt_c_addr2]").val();
		var addr3 = $(p).find("[txt_c_addr3]").val();
		var txt_c_building = $(p).find("[txt_c_building]").val();
		var postcode = $(p).find("[txt_c_postcode]").val();
		var city = $(p).find("[txt_c_city]").val();
		var state = $(p).find("[txt_c_state]").val();
		var country = $(p).find("[txt_c_country]").val();
		
		var pass = true;
		if(General.isTextEmpty($(p).find("[txt_c_name]"))){
			pass = false;
		}
		if(General.isTextEmpty($(p).find("[txt_c_contact]"))){
			pass = false;
		}
		if(General.isTextEmpty($(p).find("[txt_c_addr1]"))){
			pass = false;
		}
		if(General.isTextEmpty($(p).find("[txt_c_postcode]"))){
			pass = false;
		}
		
		$(selected).find("[txt_c_name]").val(name);
		$(selected).find("[txt_c_company]").val(company);
		$(selected).find("[txt_c_contact]").val(contact);
		$(selected).find("[txt_c_contact_code]").val(contact_code);
		$(selected).find("[txt_c_alt_contact]").val(contact_alt);
	  	$(selected).find("[txt_c_alt_contact_code]").val(contact_alt_code);
		$(selected).find("[txt_c_building]").val(txt_c_building);
		$(selected).find("[txt_c_addr1]").val(addr1);
		$(selected).find("[txt_c_unit]").val(unit);
		$(selected).find("[txt_c_floor]").val(floor);
		$(selected).find("[txt_c_block]").val(block);
		$(selected).find("[txt_c_addr2]").val(addr2);
		$(selected).find("[txt_c_addr3]").val(addr3);
		$(selected).find("[txt_c_postcode]").val(postcode);
		$(selected).find("[txt_c_city]").val(city);
		$(selected).find("[txt_c_state]").val(state);
		$(selected).find("[txt_c_state_text]").val(this.stateName(state));
		$(selected).find("[txt_c_aid]").val(aid);
		$(selected).find("[txt_c_country]").val(country);
		//alert(aid);
		
		$(selected).find("[step=coll]").html(this.stateName(state) + " ( " + name + " ) ");
		$(selected).find("[step=coll]").attr("state",state);
		//alert($(selected).find("[step=coll]").attr("state"));
		/*
		var addr1 = "";
		if(unit.length > 0) addr1 += "Unit " + unit;
		if(floor.length > 0) addr1 += "Floor " + floor;
		if(block.length > 0) addr1 += "Block " + block;//*/
		$(selected).find("[step=coll]").attr(
			"data-original-title",
			name + " (" + contact + ")," + 
			addr1 + " " + txt_c_building + " " + addr2 + " " + addr3 + "," +
			postcode + " " + city + ", " +
			this.stateName(state) + ", " + country
		);
		//alert("end This");
		if(pass){
			// added by Willam
			// date : 30/12/2014
			// description : Add error message for wrong postcode and state for delivery address
			$.ajax({
			type : "post",
			url : "./?ac=checkAddress",
			data : {
				postcode : postcode,
				state : state
			},
			success : function(result){
				/* temporaly close by zhen on 9 jan due to postcode database not complete 
				if(result == 0){
					//CJ-S
					//BackCollAddr(this);
					$( "#dialog").html("Collection Postcode Or State Does Not Match.").dialog({
						title: "Oops!",
						resizable: false,
						maxWidth:500,
						width: 500,
						modal: true,
						buttons: {"Ok": function(){$( this ).dialog( "close" );}}
					}); */
					//CJ-E					
			//	} else {
					quote.checkStep2Complete(selected);//alert("1");
					quote.dataCache("UpdateCollection",p.attr("ref"));//alert("2");
					//$('#popupbox').hide().show("scale",{},300);
					quote.DeliAddr($(selected).find("[step=deli]"));//alert("3");
			//	}
			}
			});
			// end added by Willam
		}else{
			//CJ-S alert("Please Complete the required field.");
			$( "#dialog").html("Please Complete the required field.").dialog({
						title: "Oops!",
						resizable: false,
						maxWidth:500,
						width: 'auto',
						modal: true,
						buttons: {"Ok": function(){$( this ).dialog( "close" );}}
					});
			//CJ-E

		}
	},
	
	BackCollAddr : function(obj){
		var p = $(obj).parent();
		var selected = "[row="+p.attr("ref")+"]";
		var aid = $(p).find("[txt_c_aid]").val();
		var name = $(p).find("[txt_c_name]").val();
		var company = $(p).find("[txt_c_company]").val();
		var contact = $(p).find("[txt_c_contact]").val();
		var contact_code = $(p).find("[txt_c_contact_code]").val();
		var contact_alt = $(p).find("[txt_c_alt_contact]").val();
		var contact_alt_code = $(p).find("[txt_c_alt_contact_code]").val();
		var addr1 = $(p).find("[txt_c_addr1]").val();
		var unit = $(p).find("[txt_c_unit]").val();
		var floor = $(p).find("[txt_c_floor]").val();
		var block = $(p).find("[txt_c_block]").val();
		var addr2 = $(p).find("[txt_c_addr2]").val();
		var addr3 = $(p).find("[txt_c_addr3]").val();
		var txt_c_building = $(p).find("[txt_c_building]").val();
		var postcode = $(p).find("[txt_c_postcode]").val();
		var city = $(p).find("[txt_c_city]").val();
		var state = $(p).find("[txt_c_state]").val();
		var country = $(p).find("[txt_c_country]").val();
		
		var pass = true;
		
		$(selected).find("[txt_c_name]").val(name);
		$(selected).find("[txt_c_company]").val(company);
		$(selected).find("[txt_c_contact]").val(contact);
		$(selected).find("[txt_c_contact_code]").val(contact_code);
		$(selected).find("[txt_c_alt_contact]").val(contact_alt);
	  $(selected).find("[txt_c_alt_contact_code]").val(contact_alt_code);
		$(selected).find("[txt_c_building]").val(txt_c_building);
		$(selected).find("[txt_c_addr1]").val(addr1);
		$(selected).find("[txt_c_unit]").val(unit);
		$(selected).find("[txt_c_floor]").val(floor);
		$(selected).find("[txt_c_block]").val(block);
		$(selected).find("[txt_c_addr2]").val(addr2);
		$(selected).find("[txt_c_addr3]").val(addr3);
		$(selected).find("[txt_c_postcode]").val(postcode);
		$(selected).find("[txt_c_city]").val(city);
		$(selected).find("[txt_c_state]").val(state);
		$(selected).find("[txt_c_state_text]").val(this.stateName(state));
		$(selected).find("[txt_c_aid]").val(aid);
		$(selected).find("[txt_c_country]").val(country);
		//alert(aid);
		
		$(selected).find("[step=coll]").html(this.stateName(state) + " ( " + name + " ) ");
		$(selected).find("[step=coll]").attr("state",state);
		//alert($(selected).find("[step=coll]").attr("state"));
		/*
		var addr1 = "";
		if(unit.length > 0) addr1 += "Unit " + unit;
		if(floor.length > 0) addr1 += "Floor " + floor;
		if(block.length > 0) addr1 += "Block " + block;//*/
		$(selected).find("[step=coll]").attr(
			"data-original-title",
			name + " (" + contact + "), " + 
			addr1 + " " + txt_c_building + " " + txt_c_building + addr2 + " " + addr3 + ", " +
			postcode + " " + city + ", " +
			this.stateName(state) + ", " + country
		);
		//alert("end This");
		if(pass){
			this.checkStep2Complete(selected);//alert("1");
			this.dataCache("",p.attr("ref"));//alert("2");
			//$('#popupbox').hide().show("scale",{},300);
			//this.DeliAddr($(selected).find("[step=deli]"));//alert("3");
			quote.step1($(selected).find("[step=1]"));
		}else{
			alert("Please Complete the required field.");
		}
	},
	
	DeliAddr : function(obj){
		this.addDropbox(obj);
		$('#dropbox').css("background-color","#dff0d8");
		$('#dropbox .dropbox-header h3').html("Delivery Address <span style='font-size:12px'>- Where you want us to send your parcel to?</span>");
		$('#dropbox .dropbox-body').html($(obj).parent().find('.editor-d').html());
		
		$('#dropbox .dropbox-body [txt_d_name]').val($(obj).parent().find('.editor-d [txt_d_name]').val());
		$('#dropbox .dropbox-body [txt_d_company]').val($(obj).parent().find('.editor-d [txt_d_company]').val());
		
		$('#dropbox .dropbox-body [txt_d_contact]').val($(obj).parent().find('.editor-d [txt_d_contact]').val());
		$('#dropbox .dropbox-body [txt_d_contact_code]').val($(obj).parent().find('.editor-d [txt_d_contact_code]').val());
		$('#dropbox .dropbox-body [txt_d_alt_contact]').val($(obj).parent().find('.editor-d [txt_d_alt_contact]').val());
		$('#dropbox .dropbox-body [txt_d_alt_contact_code]').val($(obj).parent().find('.editor-d [txt_d_alt_contact_code]').val());
		$('#dropbox .dropbox-body [txt_d_addr1]').val($(obj).parent().find('.editor-d [txt_d_addr1]').val());
		$('#dropbox .dropbox-body [txt_d_unit]').val($(obj).parent().find('.editor-d [txt_d_unit]').val());
		$('#dropbox .dropbox-body [txt_d_floor]').val($(obj).parent().find('.editor-d [txt_d_floor]').val());
		$('#dropbox .dropbox-body [txt_d_block]').val($(obj).parent().find('.editor-d [txt_d_block]').val());
		$('#dropbox .dropbox-body [txt_d_addr2]').val($(obj).parent().find('.editor-d [txt_d_addr2]').val());
		$('#dropbox .dropbox-body [txt_d_addr3]').val($(obj).parent().find('.editor-d [txt_d_addr3]').val());
		$('#dropbox .dropbox-body [txt_d_building]').val($(obj).parent().find('.editor-d [txt_d_building]').val());
		$('#dropbox .dropbox-body [txt_d_postcode]').val($(obj).parent().find('.editor-d [txt_d_postcode]').val());
		$('#dropbox .dropbox-body [txt_d_city]').val($(obj).parent().find('.editor-d [txt_d_city]').val());
		$('#dropbox .dropbox-body [txt_d_state]').val($(obj).parent().find('[step=deli]').attr("state"));
		$('#dropbox .dropbox-body [txt_d_state_text]').val($(obj).parent().find('.editor-d [txt_d_state_text]').val());
		$('#dropbox .dropbox-body [txt_d_aid]').val($(obj).parent().find('.editor-d [txt_d_aid]').val());
		$('#dropbox .dropbox-body [txt_d_country]').val($(obj).parent().find('.editor-d [txt_d_country]').val());
		$( "#dropbox .dropbox-body [txt_d_addr1],#dropbox .dropbox-body [txt_d_building],#dropbox .dropbox-body [txt_d_addr2],#dropbox .dropbox-body [txt_d_addr3]" ).autocomplete({
			source : function(request, response){
				var url = "./?ac=StreetAutoComplete&street="+request.term;
				$.ajax({
					type : "get",
					url : url,
					success : function(data){
						//*
						response( $.map(data, function(item){
							return {
								label : item.street + " ("+ item.state +")",
								value : item.street,
								state : item.state_code,
								postcode : item.postcode
							}
						}));//*/
					}
				});
			},
			select : function (event , ui){
				$("#dropbox .dropbox-body [txt_d_postcode]").val(ui.item.postcode);
				$("#dropbox .dropbox-body [txt_d_state]").val(ui.item.state);
			}
		});
	},
	
	DeliAddrChange : function(obj){
		$('#dropbox .dropbox-body [txt_d_aid]').val(0);
	},
	
	UpdateDeliAddr : function(obj){
		var p = $(obj).parent();
		var selected = "[row="+p.attr("ref")+"]";
		var aid = $(p).find("[txt_d_aid]").val();
		var name = $(p).find("[txt_d_name]").val();
		var company = $(p).find("[txt_d_company]").val();
		var contact = $(p).find("[txt_d_contact]").val();
		var contact_code =$(p).find("[txt_d_contact_code]").val();
		var contact_alt= $(p).find("[txt_d_alt_contact]").val();
		var contact_alt_code =$(p).find("[txt_d_alt_contact_code]").val();
		var addr1 = $(p).find("[txt_d_addr1]").val();
		var unit = $(p).find("[txt_d_unit]").val();
		var floor = $(p).find("[txt_d_floor]").val();
		var block = $(p).find("[txt_d_block]").val();
		var addr2 = $(p).find("[txt_d_addr2]").val();
		var addr3 = $(p).find("[txt_d_addr3]").val();
		var postcode = $(p).find("[txt_d_postcode]").val();
		var city = $(p).find("[txt_d_city]").val();
		var del_building = $(p).find("[txt_d_building]").val();
		var state = $(p).find("[txt_d_state]").val();
		var country = $(p).find("[txt_d_country]").val();
		
		var pass = true;
		
		if(General.isTextEmpty($(p).find("[txt_d_name]"))){
			pass = false;
		}
		if(General.isTextEmpty($(p).find("[txt_d_contact]"))){
			pass = false;
		}
		if(General.isTextEmpty($(p).find("[txt_d_addr1]"))){
			pass = false;
		}
		if(General.isTextEmpty($(p).find("[txt_d_postcode]"))){
			pass = false;
		}
		
		$(selected).find("[txt_d_name]").val(name);
		$(selected).find("[txt_d_company]").val(company);
		$(selected).find("[txt_d_contact]").val(contact);
		$(selected).find("[txt_d_contact_code]").val(contact_code);
		$(selected).find("[txt_d_alt_contact]").val(contact_alt);
		$(selected).find("[txt_d_alt_contact_code]").val(contact_alt_code);
		$(selected).find("[txt_d_addr1]").val(addr1);
		$(selected).find("[txt_d_unit]").val(unit);
		$(selected).find("[txt_d_floor]").val(floor);
		$(selected).find("[txt_d_block]").val(block);
		$(selected).find("[txt_d_addr2]").val(addr2);
		$(selected).find("[txt_d_addr3]").val(addr3);
		$(selected).find("[txt_d_building]").val(del_building);
		$(selected).find("[txt_d_postcode]").val(postcode);
		$(selected).find("[txt_d_city]").val(city);
		$(selected).find("[txt_d_state]").val(state);
		$(selected).find("[txt_d_state_text]").val(this.stateName(state));
		$(selected).find("[txt_d_aid]").val(aid);
		$(selected).find("[txt_d_country]").val(country);
		
		
		$(selected).find("[step=deli]").html(this.stateName(state) + " ( " + name + " ) ");
		$(selected).find("[step=deli]").attr("state",state);
		//alert($(selected).find("[step=deli]").attr("state"));
		/*
		var addr1 = "";
		if(unit.length > 0) addr1 += "Unit " + unit;
		if(floor.length > 0) addr1 += "Floor " + floor;
		if(block.length > 0) addr1 += "Block " + block;//*/
		
		$(selected).find("[step=deli]").attr(
			"data-original-title",
			name + " (" + contact + "), " + 
			addr1 + " " + del_building + " " + addr2 + " " + addr3 + ", " +
			postcode + " " + city + ", " +
			this.stateName(state) + ", " + country
		);
		if(pass){
			// added by Willam
			// date : 30/12/2014
			// description : Add error message for wrong postcode and state for delivery address
			$.ajax({
			type : "post",
			url : "./?ac=checkAddress",
			data : {
				postcode : postcode,
				state : state
			},
			success : function(result){
				/* temporaly close on 9 jan 2015 due to postcode database not complete
				if(result == 0){
					$( "#dialog").html("Delivery Postcode Or State Does Not Match.").dialog({
						title: "Oops!",
						resizable: false,
						maxWidth:500,
						width: 500,
						modal: true,
						buttons: {"Ok": function(){$( this ).dialog( "close" );}}
					});
				} else { */
					
					if($(selected).find("[txt_d_aid]").val() === $(selected).find("[txt_c_aid]").val())
					{
						$( "#dialog").html("Hi, we just realized that the collection address and the delivery address is same. If it is right just ignore us. Thanks").dialog({
						title: "Just Curious..",
						resizable: false,
						maxWidth:500,
						width: 500,
						modal: true,
						buttons: {"Ok": function(){$( this ).dialog( "close" );}}
						});
	
					}
					quote.checkStep2Complete(selected);
					quote.dataCache("UpdateDelivery",p.attr("ref"));
					//$('#popupbox').hide().show("scale",{},300);
					quote.step3($(selected).find("[step=3]"));
			//	} temporally close on 9 jan by zhen
			}
			});
			// -- end added by Willam
		}else{
			//CJ - S alert("Please Complete the required field.");
			$( "#dialog").html("Please Complete the required field.").dialog({
						title: "Oops!",
						resizable: false,
						maxWidth:500,
						width: 500,
						modal: true,
						buttons: {"Ok": function(){$( this ).dialog( "close" );}}
					});
			//CJ - E
		}
	},
	
	BackDeliAddr : function(obj){
		var p = $(obj).parent();
		var selected = "[row="+p.attr("ref")+"]";
		var aid = $(p).find("[txt_d_aid]").val();
		var name = $(p).find("[txt_d_name]").val();
		var company = $(p).find("[txt_d_company]").val();
		var contact = $(p).find("[txt_d_contact]").val();
		var contact_code =$(p).find("[txt_d_contact_code]").val();
		var contact_alt= $(p).find("[txt_d_alt_contact]").val();
		var contact_alt_code =$(p).find("[txt_d_alt_contact_code]").val();
		var addr1 = $(p).find("[txt_d_addr1]").val();
		var unit = $(p).find("[txt_d_unit]").val();
		var floor = $(p).find("[txt_d_floor]").val();
		var block = $(p).find("[txt_d_block]").val();
		var addr2 = $(p).find("[txt_d_addr2]").val();
		var addr3 = $(p).find("[txt_d_addr3]").val();
		var postcode = $(p).find("[txt_d_postcode]").val();
		var city = $(p).find("[txt_d_city]").val();
		var del_building = $(p).find("[txt_d_building]").val();
		var state = $(p).find("[txt_d_state]").val();
		var country = $(p).find("[txt_d_country]").val();
		
		var pass = true;
		
		$(selected).find("[txt_d_name]").val(name);
		$(selected).find("[txt_d_company]").val(company);
		$(selected).find("[txt_d_contact]").val(contact);
		$(selected).find("[txt_d_contact_code]").val(contact_code);
		$(selected).find("[txt_d_alt_contact]").val(contact_alt);
		$(selected).find("[txt_d_alt_contact_code]").val(contact_alt_code);
		$(selected).find("[txt_d_addr1]").val(addr1);
		$(selected).find("[txt_d_unit]").val(unit);
		$(selected).find("[txt_d_floor]").val(floor);
		$(selected).find("[txt_d_block]").val(block);
		$(selected).find("[txt_d_addr2]").val(addr2);
		$(selected).find("[txt_d_addr3]").val(addr3);
		$(selected).find("[txt_d_building]").val(del_building);
		$(selected).find("[txt_d_postcode]").val(postcode);
		$(selected).find("[txt_d_city]").val(city);
		$(selected).find("[txt_d_state]").val(state);
		$(selected).find("[txt_d_state_text]").val(this.stateName(state));
		$(selected).find("[txt_d_aid]").val(aid);
		$(selected).find("[txt_d_country]").val(country);
		
		
		$(selected).find("[step=deli]").html(this.stateName(state) + " ( " + name + " ) ");
		$(selected).find("[step=deli]").attr("state",state);
		//alert($(selected).find("[step=deli]").attr("state"));
		/*
		var addr1 = "";
		if(unit.length > 0) addr1 += "Unit " + unit;
		if(floor.length > 0) addr1 += "Floor " + floor;
		if(block.length > 0) addr1 += "Block " + block;//*/
		
		$(selected).find("[step=deli]").attr(
			"data-original-title",
			name + " (" + contact + "), " + 
			addr1 + " " + del_building + " " + addr2 + " " + addr3 + ", " +
			postcode + " " + city + ", " +
			this.stateName(state) + ", " + country
		);
		if(pass){
			this.checkStep2Complete(selected);
			this.dataCache("",p.attr("ref"));
			//$('#popupbox').hide().show("scale",{},300);
			this.CollAddr($(selected).find("[step=coll]"));
		}else{
			alert("Please Complete the required field.");
		}
	},
	
	checkStep2Complete : function(obj){
		var state1 = $(obj).find("[step=coll]").html();
		var state2 = $(obj).find("[step=deli]").html();
		if(state1 != quote.placeFrom && state2 != quote.placeTo){
			if($($(obj).find(".step").get(1)).hasClass("step_new")){
				this.newStep(obj);
			}
		}
	},
	
	step3 : function(obj){
		//alert("step3");
		var p = $(obj).parents("[row]");
		var w = wi = l = h = 0,c = d = "";
		w = $(p).find("[txt_weight]").val();
		wi = $(p).find("[txt_width]").val();
		l = $(p).find("[txt_length]").val();
		h = $(p).find("[txt_height]").val();
		c = $(p).find('[step=coll]').attr("state");
		d = $(p).find('[step=deli]').attr("state");
		cc = $(p).find('[txt_c_country]').val();
		dc = $(p).find('[txt_d_country]').val();
		cp = $(p).find('[txt_c_postcode]').val();
		dp = $(p).find('[txt_d_postcode]').val();
		dt = $(p).find('[txt_coll_date]').val();
		this.addDropbox(obj);
		quote.ajaxLoading[p.attr("row")] = true;
		//alert(w + " " + wi + " " + l + " " + h + " " + c + " " + d);
		$.ajax({
			type : "post",
			url : "./?cp=CourierRateList",
			data : {
				c : c, d : d,
				w : w, wi : wi, l : l, h : h,
				cc : cc, dc : dc, cp : cp, dp : dp, dt : dt
			},
			success : function(result){
				if(quote.ajaxLoading[p.attr("row")]){
					$('#dropbox .dropbox-body [ref]').html(result);
					var jplist = $(".Courier_Component").jplist({
						items_box: ".Courier_List",
						item_path: ".Courier_Item",
						sort_name: "courier_price",
						sort_is_num : true,
						sort_path: ".Courier_List_Sort",
						sort: {
							courier_name : ".Courier_Name",
							courier_type : ".Courier_Type",
							courier_price	: ".Courier_Price"
						}
					});
				}
			}
		});
		
		$('#dropbox .dropbox-body').html($(obj).parent().find('.editor').html());
		$('#dropbox .dropbox-header h3').html("Courier Service");
	},
	
	UpdateStep3 : function(obj){
		var sid = $(obj).find(".sid").html();
		var courier = $(obj).find(".courier").html();
		var service = $(obj).find(".service").html();
		var type = $(obj).find(".type").html();
		var price = $(obj).find(".price").html();		

		price=parseFloat(price).toFixed(2);
		var p = $(obj).parents("[ref]");
		var selected = "[row="+p.attr("ref")+"]";
		
		/* 
		*  Insurance plugin - Start
		*  Added by ET
		*  Edited on 2015-01-19
		*/		
		var cid = $(obj).find(".cid").html();
		var insure_info = $(obj).find(".insure_info").html();
		$(selected).find("[txt_cid]").val(cid);
		$(selected).find("[txt_insure_info]").val(insure_info);	
		var i_d_state = $(selected).find('[step=deli]').attr("state");
		var i_estimated = parseFloat($(selected).find('[txt_estimated]').val());
		var i_weight = parseFloat($(selected).find('[txt_weight]').val());
		
		//alert('cid: '+cid+'\ndelistate: '+i_d_state+'\nestimated: ' + i_estimated + '\nweight: '+i_weight+'\ninsureinfo: '+insure_info);				
		
		var basicCover = false;
		var tempValue = '';
		var tempTax = '';		
		var tempInsurance = 'N/A';
		var insureCheckBox = 'disabled';				
		
		//validate good value		
		if(isNaN(i_estimated) || i_estimated == ''){
			i_estimated = 0;				
		}		
		//alert(cid+'/n'+i_estimated);
		//check good values and basic insurance cover			
		if(cid == '2' || cid == '6' || cid == '8'){ //airpak, nationwide, skynet
			if(i_estimated <= 100){
				basicCover = true;				
			}			
		}else if(cid == '1'){ //poslaju
			if(i_weight <= 2){
				if(i_estimated <= 100){
					basicCover = true;					
				}
			}else{
				if(i_estimated <= 300){
					basicCover = true;					
				}
			}
		}				
		//alert('cover: '+basicCover+'\ni_estimated: '+i_estimated+'\ni_weight: '+i_weight+'\ncid: '+cid+'\ni_d_state: '+i_d_state);
		//check and count courier rate
		if(!basicCover){
			switch(cid){
				// poslaju
				// 1.5%+6% (National)			
				case '1':
					tempValue = (i_estimated*0.015).toFixed(2);
					tempTax = (tempValue*0.06).toFixed(2);
					tempInsurance = (parseFloat(tempValue) +  parseFloat(tempTax)).toFixed(2);	
					//alert('poslaju');					
					break;			
				// airpak
				//	1.5%+6% (National)
				case '2':
					tempValue = (i_estimated*0.015).toFixed(2);
					tempTax = (tempValue*0.06).toFixed(2);
					tempInsurance = (parseFloat(tempValue) +  parseFloat(tempTax)).toFixed(2);	
					//alert('airpak');					
					break;				
				// skynet
				// 1.6%+6% (Penisular) | 1.8%+6% (Sabah/Sarawak)
				case '6': 
					if(i_d_state == 'sbh' || i_d_state == 'srw' || i_d_state == 'lbn'){ //sabah and sarawak
						tempValue = (i_estimated*0.018).toFixed(2);
						tempTax = (tempValue*0.06).toFixed(2);
						tempInsurance = (parseFloat(tempValue) +  parseFloat(tempTax)).toFixed(2);
						//alert('skynet1');							
					}else{
						tempValue = (i_estimated*0.016).toFixed(2);
						tempTax = (tempValue*0.06).toFixed(2);
						tempInsurance = (parseFloat(tempValue) +  parseFloat(tempTax)).toFixed(2);
						//alert('skynet2');							
					}
					break;
				// nationwide
				//	1.5%+6% (National)
				case '8': 
					tempValue = (i_estimated*0.015).toFixed(2);
					tempTax = (tempValue*0.06).toFixed(2);
					tempInsurance = (parseFloat(tempValue) +  parseFloat(tempTax)).toFixed(2);	
					//alert('nationwide');					
					break;
			}
			//alert('if1-tempInsurance: '+tempInsurance);
			if(tempInsurance<5){
				tempInsurance = 5.00;
			}
			//alert('if2-tempInsurance: '+tempInsurance);			
		}else{
			//alert('else-tempInsurance: '+tempInsurance);
			tempInsurance = 'Basic';
			$(selected).find("[chk_insurance]").attr('checked',true);			
		}		
		$(selected).find("[txt_insure_price]").val(tempInsurance);	
				
		//check insurance checkbox enabled/disabled
		if(tempInsurance != 'N/A'){
			//Ajaxdata[i].insurance_checkbox = "";
			$(selected).find("[chk_insurance]").removeAttr('disabled');
		}
		//alert('tempInsurance: '+tempInsurance);
		
		//check, process and display insurance company info
		//*
		if(insure_info != '' && typeof insure_info != 'undefined'){			
			var insureString = insure_info;
			insureString = insureString.replace(/\\/g,'');
			//alert('jsonstring: '+insureString);
			var insureObj = JSON.parse(insureString);			
			//alert('insureObj:' +insureObj);
			$('#insuranceURL').attr('href','http://'+insureObj.url);	
			$('#insuranceCompany').html(insureObj.url);
			$('#insuranceAmount').html('RM '+tempInsurance);
			//*
			if(tempInsurance == 'N/A' || tempInsurance == 'Basic'){
				$(selected).find("[insure=end]").html(tempInsurance);				
				$("#insCoverYes").hide();	
				//alert('hide');					
			}else{
				$(selected).find("[insure=end]").html('RM '+parseFloat(tempInsurance).toFixed(2));				
				$("#insCoverYes").show();	
				//alert('show');	
			}
			//*/	
			//alert('insurance_info');			
		}
		
		//alert('me');
		/* 
		*  Insurance plugin - End
		*/
		
		
		$(selected).find("[txt_sid]").val(sid);
		$(selected).find("[txt_type]").val(type);
		$(selected).find("[step=3]").html(courier + "<br />" + service);
		$(selected).find("[step=end]").html(price);
		quote.SumTotal();
		//*
		if($($(selected).find(".step").get(2)).hasClass("step_new"))
			this.newStep(selected);//*/
	
		$('input[name="acceptInsurance"]').val(p.attr("ref"));		
		$('#popupbox .modal-header h3').html("Buyer's Protection Plan (Insurance)");
		$("#popupbox .modal-body").html($(".insurance .body").html());
		$("#popupbox .modal-footer").html('<button type="button" class="btn btn-default" data-dismiss="modal">Close</button> <button type="button" class="btn btn-default" onclick="closeCoverBox()">Agree</button>');
		$('#popupbox').modal('toggle');
		$('#popupbox').modal({backdrop : "static"});
		
		this.dataCache("",p.attr("ref"));
		quote.closeDropbox();
	},
	
	UpdateCourierService : function(obj){
		var sid = $(obj).find(".sid").html();
		// Insurance plugin - Start
		var cid = $(obj).find(".cid").html();
		var insure_info = $(obj).find(".insure_info").html();
		// Insurance plugin - End
		var courier = $(obj).find(".courier").html();
		var service = $(obj).find(".service").html();
		var type = $(obj).find(".type").html();
		var price = $(obj).find(".price").html();

		price=parseFloat(price).toFixed(2);
		// Insurance plugin - Start
		$(selected).find("[txt_cid]").val(cid);
		$(selected).find("[txt_insure_info]").val(insure_info);
		// Insurance plugin - End
		var p = $(obj).parents("[ref]");
		var selected = "[row="+p.attr("ref")+"]";
		
		$(selected).find("[txt_sid]").val(sid);
		$(selected).find("[txt_type]").val(type);
		$(selected).find("[step=3]").html(courier + "<br />" + service);
		$(selected).find("[step=end]").html(price);
		quote.SumTotal();
		if($($(selected).find(".step").get(2)).hasClass("step_new"))
			this.newStep(selected);
		
		this.dataCache("",p.attr("ref"));
		//quote.AddCart();
	},
	
	AddCart : function(){
		var row = $("#QuoteAndBook [row]");
		var step = $("#QuoteAndBook .step");
		
		pass = quote.ValidateData();
		if(pass){
			var img = $("#TEMP [step=3]").parent().find("img").attr("src");

			//created by amira on 6.09pm 30th dec 2014
			//alert(show);
			if(show == "")
			{
				$('#popupbox .modal-header h3').html("");
				$("#popupbox .modal-body").html($(".checkoutpopup .body").html());
				$("#popupbox .modal-footer").html('System is sending your order, please wait <img src="'+img+'">');
				$('#popupbox').modal('toggle');
				$('#popupbox').modal({backdrop : "static"});
			}
			else
			{
				//$("#popupbox .modal-body").html("");
			}

			
			$.ajax({
				type : "get",
				url : "./?ac=CheckOut",
				success : function(html){
					//alert(html);
					
					if(show == "")
					{	
					if($.trim(html) == ""){
						$("#popupbox .modal-footer").html(
							'You do not have any cart item to checkout. '+
							'<button type="button" class="btn btn-default" data-dismiss="modal">close</button>'
						);
					}else if($.trim(html) == "login"){
						$("#popupbox .modal-footer").html(
							'Please Login as an user to continue your checkout.'+
							'<button type="button" class="btn btn-default" data-dismiss="modal">close</button>'
						);
					}else{
						//$("#popupbox .modal-footer").html('<p>Your order have submitted and <br>you will be auto refresh in 5 second, Thank you.</p>');
						$("#popupbox .modal-footer").html(
							'<a href="./?pg=Payment&id='+$.trim(html)+'" class="btn btn-default">proceed</a>'
						);
					}
					}
					else
					{
					if($.trim(html) == ""){
						
						//CJ - S alert("Please Complete the required field.");
						$( "#dialog").html("You do not have any cart item to checkout.").dialog({
									title: "Oops!",
									resizable: false,
									maxWidth:500,
									width: 'auto',
									modal: true,
									buttons: {"Ok": function(){$( this ).dialog( "close" );}}
								});
						//CJ - E

						
					}else if($.trim(html) == "login"){
						//CJ - S alert("Please Complete the required field.");
						$( "#dialog").html("Please Login as an user to continue your checkout.").dialog({
									title: "Oops!",
									resizable: false,
									maxWidth:500,
									width: 'auto',
									modal: true,
									buttons: {"Ok": function(){$( this ).dialog( "close" );}}
								});
						//CJ - E
						
					}else{
						//$("#popupbox .modal-footer").html('<p>Your order have submitted and <br>you will be auto refresh in 5 second, Thank you.</p>');
						window.location.href="./?pg=Payment&id="+$.trim(html);
						
					}
					
					}
				}
			}).fail(function(){alert("Server execution error. Please contact and report this issue to us. Thank you..");});
		}else{
			var 
			msg = "Your quote and book are not complete.<br>";
			//msg += "Please refer the follow detail to complete your quote and book.<br>";
			//msg += "<h3 style='color:#E00'><strong>If you have complete entered your data,<br> ";
			//msg += "Please click Next to proceed.</strong></h3>";
			msg += "";
			for(i = 0; i < quote.errPoint.arr.length; i++){
				var k = quote.errPoint.arr[i].row;
				var no = quote.getNo(k);
				msg += "<br><h4 style='color:#C90'><strong>Parcel No " + no + " </strong></h4>";
				if(quote.errPoint.arr[i].msg1.length > 0){
					msg += "<u><b style='color:#000'>1. Parcel Information</b></u>";
					msg += "<ul>";
					for(j = 0; j < quote.errPoint.arr[i].msg1.length; j++){
						msg += "<li>" + quote.errPoint.arr[i].msg1[j] + "</li>";
					}
					msg += "</ul>";
				}
				if(quote.errPoint.arr[i].msg2.length > 0){
					msg += "<u><b style='color:#000'>2. Collection & Delivery Address</b></u>";
					msg += "<ul>";
					for(j = 0; j < quote.errPoint.arr[i].msg2.length; j++){
						msg += "<li>" + quote.errPoint.arr[i].msg2[j] + "</li>";
					}
					msg += "</ul>";
				}
				if(quote.errPoint.arr[i].msg3.length > 0){
					msg += "<u><b style='color:#000'>3. Select Delivery Service</b></u>";
					msg += "<ul>";
					for(j = 0; j < quote.errPoint.arr[i].msg3.length; j++){
						msg += "<li>" + quote.errPoint.arr[i].msg3[j] + "</li>";
					}
					msg += "</ul>";
				}
			}
			$('#popupbox .modal-header h3').html("Warning !");
			$("#popupbox .modal-body").html(msg);
			$("#popupbox .modal-footer").html('<button type="button" class="btn btn-default" data-dismiss="modal">close</button>');
			$('#popupbox').modal('toggle');
			$('#popupbox').modal({backdrop : false});
		}
		
		//alert(step.length);
	},
	
	getNo : function(no){
		switch(no){
			case 1 : return no + "st"; break;
			case 2 : return no + "nd"; break;
			case 3 : return no + "rd"; break;
			default : return no + "th"; break
		}
	},
	
	NotVerifyUser : function(){
		var msg = "<strong>Your account has not been verified yet.</strong><br>" + 
							"Please verify your account now.<br>" +
							"<a class='btn btn-default' onclick='quote.userVerifyAccount()'>Click here</a> to verify your account now using mobile verification code<br>";			
					
		$('#popupbox .modal-header h3').html("Warning !");
		$("#popupbox .modal-body").html(msg);
		$("#popupbox .modal-footer").html('<button type="button" class="btn btn-default" data-dismiss="modal">close</button>');
		$('#popupbox').modal('toggle');
		$('#popupbox').modal({backdrop : false});
	},
	
	NotLoginUser : function(){
		alert("You have not login yet.");
	},
	
	ValidateData : function(){
		var row = $("#QuoteAndBook [row]"), pass = true;
		quote.errPoint.err = false;
		quote.errPoint.arr = [];
		for(var i = 0; i < row.length; i++){
			var 
			step = $(row.get(i)).find(".step"),
			ep = {
				row : i+1,
				msg1 : [],
				msg2 : [],
				msg3 : []
			},
			ipass = true;
			
			$(row.get(i)).find("td").css("background-color","#F8E9F4");
			$(row.get(i)).find("[step]").css("color","#428bca");
			
			p = step.get(0);
			if(General.isTextEmpty($(p).find("[txt_weight]"))){
				ipass = false;
				ep.msg1.push("Parcel weight not entered");
				$(p).css("background-color","#FCF");
				$(p).find("[step=1]").css("color","#F00");
			}else if(!General.isNumber($(p).find("[txt_weight]"))){
				ipass = false;
				ep.msg1.push("Parcel weight not in number format");
				$(p).css("background-color","#FCF");
				$(p).find("[step=1]").css("color","#F00");
			}
			if(General.isTextEmpty($(p).find("[txt_parcel_contents]"))){
				ipass = false;
				ep.msg1.push("Parcel Content");
				$(p).css("background-color","#FCF");
				$(p).find("[step=1]").css("color","#F00");
			}
			if(General.isTextEmpty($(p).find("[txt_estimated]"))){
				ipass = false;
				ep.msg1.push("Value Of Good");
				$(p).css("background-color","#FCF");
				$(p).find("[step=1]").css("color","#F00");
			}else if(!General.isNumber($(p).find("[txt_estimated]"))){
				ipass = false;
				ep.msg1.push("Value Of Good not in number format");
				$(p).css("background-color","#FCF");
				$(p).find("[step=1]").css("color","#F00");
			}
			if(General.isTextEmpty($(p).find("[txt_coll_date]"))){
				ipass = false;
				ep.msg1.push("Collection Date not selected");
				$(p).css("background-color","#FCF");
				$(p).find("[step=1]").css("color","#F00");
			}
			
			p = step.get(1);
			if(parseInt($(p).find("[txt_c_aid]").val()) > 0 ){}else{
				ipass = false;
				ep.msg2.push("Collection Address not selected");
				ep.msg2.push("(Please click \"Next\", If you have entered the address )");
				$(p).css("background-color","#FCF");
				$(p).find("[step=coll]").css("color","#F00");
			}
			if(parseInt($(p).find("[txt_d_aid]").val()) > 0 ){}else{
				ipass = false;
				ep.msg2.push("Delivery Address not selected");
				ep.msg2.push("(Please click \"Next\", If you have entered the address )");
				$(p).css("background-color","#FCF");
				$(p).find("[step=deli]").css("color","#F00");
			}
			
			p = step.get(2);
			if(parseInt($(p).find("[txt_sid]").val()) > 0 ){
				p = step.get(4);
				if(isNaN($(p).find("price").html())){
					p = step.get(2); ipass = false;
					ep.msg3.push("The selected service is not available");
					$(p).css("background-color","#FCF");
					$(p).find("[step]").css("color","#F00");
				}
			}else{
				ipass = false;
				ep.msg3.push("Courier service not selected");
				$(p).css("background-color","#FCF");
				$(p).find("[step]").css("color","#F00");
			}
			
			if(!ipass){
				quote.errPoint.arr.push(ep);
				quote.errPoint.err = !ipass;
				pass = false;
			}else{
				$(row.get(i)).find("td").css("background-color","");
			}
		}
		return pass;
	},
	
	// Insurance plugin - Start	
	updateInsurance : function(obj){		
		var p = $(obj).parent();				
		this.dataCache("",p.attr("ref"));			
	},
	// Insurance plugin - End
	
	updatePrice : function(ref){
		//alert(ref);
		$.ajax({
			type : "post",
			url : "./?ac=UpdateCartPrice",
			data : {ref : ref},
			success : function(result){
				//alert(result);
				if($.trim(result).length > 0){
					if(ref != "undifined"){
						$("[row="+ref+"]").find("price").html($.trim(result));
						if($.trim(result) == "No Available"){
							quote.step3($("[row="+ref+"]").find("[step=3]"));
						}		
					}else{
					}			
					quote.SumTotal();					
				}
			}
		}).fail(function(){
			alert("Server execution error. Please contact and report this issue to us. Thank you.");
		});
	},
	
	SumTotal : function(){
		var price = $("#QuoteAndBook [step=end]"), total = 0;
		var insurance = $("#QuoteAndBook [insure=end]");
		
		for(var i = 0 ; i < price.length ; i++){	
			var p = $(insurance.get(i)).parent();
			var insureStatus = $(p).find("[chk_insurance]").is(':checked');			
			var subtotal = parseFloat($(price.get(i)).html());					
			if(!isNaN(subtotal)){
				if(insureStatus){
					var tempStr = $(insurance.get(i)).html();
					var tempInsurance = tempStr.replace("RM ","");
					var subinsurance = parseFloat(tempInsurance);
					//alert('insurancePrice:' + subinsurance);
					if(isNaN(subinsurance)){
						subinsurance = parseFloat(0.00);
					}	
					//alert('insurancePrice1:' + subinsurance);						
					total += (subtotal+subinsurance);
				}else{
					total += subtotal;
				}	
				//alert('subtotal:' + total);			
			}			
		}
		//alert('total: '+total);
		$("[step=total]").html(parseFloat(total).toFixed(2));
	},
	
	collectData : function(){
		var row = $("#QuoteAndBook [row]");
		var Ajaxdata = {};
		for(var i = 0; i < row.length; i++){
			Ajaxdata[i] = {};
			Ajaxdata[i].row = $(row.get(i)).attr("row");
			var step = $(row.get(i)).find(".step");
			
			// Step 1
			if($(step.get(0)).hasClass("step_done")){
				Ajaxdata[i].cls_step1 = "step_done";
			}else if($(step.get(0)).hasClass("step_new")){
				Ajaxdata[i].cls_step1 = "step_new";
			}else{
				Ajaxdata[i].cls_step1 = "step_none";
			}
			var p = step.get(0);
			Ajaxdata[i].weight = $(p).find("[txt_weight]").val();
			Ajaxdata[i].weight = Ajaxdata[i].weight.split(" ").join("");
			Ajaxdata[i].width = $(p).find("[txt_width]").val();
			Ajaxdata[i].length = $(p).find("[txt_length]").val();
			Ajaxdata[i].height = $(p).find("[txt_height]").val();
			Ajaxdata[i].refer = $(p).find("[txt_refer]").val();
			Ajaxdata[i].comment = $(p).find("[txt_comment]").val();
			Ajaxdata[i].parcel_contents = $(p).find("[txt_parcel_contents]").val();
			Ajaxdata[i].estimated = $(p).find("[txt_estimated]").val();
			Ajaxdata[i].coll_date = $(p).find("[txt_coll_date]").val();			
						
			
			// Step 2
			if($(step.get(1)).hasClass("step_done")){
				Ajaxdata[i].cls_step2 = "step_done";
			}else if($(step.get(1)).hasClass("step_new")){
				Ajaxdata[i].cls_step2 = "step_new";
			}else{
				Ajaxdata[i].cls_step2 = "step_none";
			}
			//alert("check point");
			var p = step.get(1);
			Ajaxdata[i].c_aid = $(p).find("[txt_c_aid]").val();
			Ajaxdata[i].c_name = $(p).find("[txt_c_name]").val();
			Ajaxdata[i].c_company = $(p).find("[txt_c_company]").val();
			Ajaxdata[i].c_contact = $(p).find("[txt_c_contact]").val();
			Ajaxdata[i].c_contact_code = $(p).find("[txt_c_contact_code]").val();
			Ajaxdata[i].c_alt_contact = $(p).find("[txt_c_alt_contact]").val();
			Ajaxdata[i].c_alt_contact_code = $(p).find("[txt_c_alt_contact_code]").val();
			Ajaxdata[i].c_unit = $(p).find("[txt_c_unit]").val();
			Ajaxdata[i].c_floor = $(p).find("[txt_c_floor]").val();
			Ajaxdata[i].c_block = $(p).find("[txt_c_block]").val();
			Ajaxdata[i].c_addr1 = $(p).find("[txt_c_addr1]").val();/*/alert("check point");
			if(Ajaxdata[i].c_unit.length > 0) Ajaxdata[i].c_addr1 += "Unit " + Ajaxdata[i].c_unit + " ";
			if(Ajaxdata[i].c_floor.length > 0) Ajaxdata[i].c_addr1 += "Floor " + Ajaxdata[i].c_floor + " ";
			if(Ajaxdata[i].c_block.length > 0) Ajaxdata[i].c_addr1 += "Block " + Ajaxdata[i].c_block + " ";//*/
			Ajaxdata[i].c_addr2 = $(p).find("[txt_c_addr2]").val();//alert("check point");
			Ajaxdata[i].c_addr3 = $(p).find("[txt_c_addr3]").val();
			Ajaxdata[i].c_postcode = $(p).find("[txt_c_postcode]").val();
			Ajaxdata[i].c_city = $(p).find("[txt_c_city]").val();
			Ajaxdata[i].c_state = $(p).find('[step=coll]').attr("state");
			var _statetext = $(p).find('[step=coll]').html().split("(");
			Ajaxdata[i].c_state_text = _statetext[0];
			Ajaxdata[i].c_building = $(p).find("[txt_c_building]").val();
			Ajaxdata[i].c_country = $(p).find("[txt_c_country]").val();
			
			Ajaxdata[i].d_aid = $(p).find("[txt_d_aid]").val();
			Ajaxdata[i].d_name = $(p).find("[txt_d_name]").val();
			Ajaxdata[i].d_company = $(p).find("[txt_d_company]").val();
			Ajaxdata[i].d_contact = $(p).find("[txt_d_contact]").val();
			Ajaxdata[i].d_contact_code = $(p).find("[txt_d_contact_code]").val();
			Ajaxdata[i].d_alt_contact = $(p).find("[txt_d_alt_contact]").val();
			Ajaxdata[i].d_alt_contact_code = $(p).find("[txt_d_alt_contact_code]").val();
			Ajaxdata[i].d_unit = $(p).find("[txt_d_unit]").val();
			Ajaxdata[i].d_floor = $(p).find("[txt_d_floor]").val();
			Ajaxdata[i].d_block = $(p).find("[txt_d_block]").val();
			Ajaxdata[i].d_addr1 = $(p).find("[txt_d_addr1]").val();/*/alert("check point");
			if(Ajaxdata[i].d_unit.length > 0) Ajaxdata[i].d_addr1 += "Unit " + Ajaxdata[i].d_unit + " ";
			if(Ajaxdata[i].d_floor.length > 0) Ajaxdata[i].d_addr1 += "Floor " + Ajaxdata[i].d_floor + " ";
			if(Ajaxdata[i].d_block.length > 0) Ajaxdata[i].d_addr1 += "Block " + Ajaxdata[i].d_block + " ";//*/
			Ajaxdata[i].d_addr2 = $(p).find("[txt_d_addr2]").val();//alert("check point");
			Ajaxdata[i].d_addr3 = $(p).find("[txt_d_addr3]").val();
			Ajaxdata[i].d_postcode = $(p).find("[txt_d_postcode]").val();
			Ajaxdata[i].d_city = $(p).find("[txt_d_city]").val();
			Ajaxdata[i].d_state = $(p).find('[step=deli]').attr("state");
			var _statetext = $(p).find('[step=deli]').html().split("(");;
			Ajaxdata[i].d_state_text = _statetext[0];
			Ajaxdata[i].d_building = $(p).find("[txt_d_building]").val();
			Ajaxdata[i].d_country = $(p).find("[txt_d_country]").val();
			
			
			// Step 3
			if($(step.get(2)).hasClass("step_done")){
				Ajaxdata[i].cls_step3 = "step_done";
			}else if($(step.get(2)).hasClass("step_new")){
				Ajaxdata[i].cls_step3 = "step_new";
			}else{
				Ajaxdata[i].cls_step3 = "step_none";
			}
			
			var p = step.get(2);
			// Insurance plugin - Start	
			Ajaxdata[i].cid = $(p).find("[txt_cid]").val();
			Ajaxdata[i].insure_info = $(p).find("[txt_insure_info]").val();
			// Insurance plugin - End	
			Ajaxdata[i].sid = $(p).find("[txt_sid]").val();
			Ajaxdata[i].type = $(p).find("[txt_type]").val();
			var text = $(p).find("[step=3]").html().split("<br>");
			if(text[0] != null){
				Ajaxdata[i].courier_name = $.trim(text[0]);
			}else{
				Ajaxdata[i].courier_name = "";
			}
			if(text[1] != null){
				Ajaxdata[i].service_name = $.trim(text[1]);
			}else{
				Ajaxdata[i].service_name = "";
			}
			
			// step 4				
			/* 
			*  Insurance plugin - Start
			*  Added by ET
			*  Edited on 2015-01-19
			*/		
			var basicCover = false;
			var tempValue = '';
			var tempTax = '';		
			var tempInsurance = '';
			var tempInsuranceText = 'N/A';
			var insureCheckBox = 'disabled';		
			var cid = parseInt(Ajaxdata[i].cid);			
			var i_d_state = Ajaxdata[i].d_state;	
			var p = step.get(3);		
			
			//validate good value
			var i_estimated = parseFloat(Ajaxdata[i].estimated);
			if(isNaN(i_estimated) || i_estimated == ''){
				i_estimated = 0;				
			}		
			//alert('i_estimated: '+i_estimated+'\nweight: '+Ajaxdata[i].weight);
			
			//check good values and basic insurance cover			
			if(cid == 2 || cid == 6 || cid == 8){ //airpak, nationwide, skynet
				if(i_estimated <= 100){
					basicCover = true;
				}
			}else if(cid == 1){ //poslaju
				if(Ajaxdata[i].weight <= 2){
					if(i_estimated <= 100){
						basicCover = true;
					}
				}else{
					if(i_estimated <= 300){
						basicCover = true;
					}
				}
			}				
			//alert('basicCover: '+basicCover+'\ncid: '+cid);
			
			//check and count courier rate
			if(!basicCover){
				if(isNaN(cid) || cid == ''){
					tempInsurance = 'N/A';
					tempInsuranceText = tempInsurance;
					//alert(isNaN(cid));
				}else{					
					switch(cid){
						// poslaju
						// 1.5%+6% (National)			
						case 1:
							tempValue = (i_estimated*0.015).toFixed(2);
							tempTax = (tempValue*0.06).toFixed(2);
							tempInsurance = (parseFloat(tempValue) +  parseFloat(tempTax)).toFixed(2);	
							//alert('poslaju');					
							break;			
						// airpak
						//	1.5%+6% (National)
						case 2:
							tempValue = (i_estimated*0.015).toFixed(2);
							tempTax = (tempValue*0.06).toFixed(2);
							tempInsurance = (parseFloat(tempValue) +  parseFloat(tempTax)).toFixed(2);
							//alert('airpak');						
							break;				
						// skynet
						// 1.6%+6% (Penisular) | 1.8%+6% (Sabah/Sarawak)
						case 6: 
							if(i_d_state == 'sbh' || i_d_state == 'srw' || i_d_state == 'lbn'){ //sabah and sarawak
								tempValue = (i_estimated*0.018).toFixed(2);
								tempTax = (tempValue*0.06).toFixed(2);
								tempInsurance = (parseFloat(tempValue) +  parseFloat(tempTax)).toFixed(2);
								//alert('skynet1');							
							}else{
								tempValue = (i_estimated*0.016).toFixed(2);
								tempTax = (tempValue*0.06).toFixed(2);
								tempInsurance = (parseFloat(tempValue) +  parseFloat(tempTax)).toFixed(2);
								//alert('skynet2: '+tempInsurance);							
							}
							break;
						// nationwide
						//	1.5%+6% (National)
						case 8: 
							tempValue = (i_estimated*0.015).toFixed(2);
							tempTax = (tempValue*0.06).toFixed(2);
							tempInsurance = (parseFloat(tempValue) +  parseFloat(tempTax)).toFixed(2);	
							//alert('nationwide');					
							break;
					}
					if(tempInsurance<5){
						tempInsurance = 5.00;
					}
					tempInsuranceText = 'RM '+parseFloat(tempInsurance).toFixed(2);
				}			
			}else{
				tempInsurance = 'Basic';
				tempInsuranceText = tempInsurance;
				$(p).find("[chk_insurance]").attr('checked',true);				
			}
			//alert(basicCover);			
			
			Ajaxdata[i].insurance = tempInsuranceText;
			Ajaxdata[i].insure_price = parseFloat(tempInsurance).toFixed(2);
			//alert("insure_price: "+Ajaxdata[i].insure_price+"/ninsurance: "+Ajaxdata[i].insurance);
			
			//update insurance price html
			$(p).find("[insure=end]").html(tempInsuranceText);
			$(p).find("[txt_insure_price]").val(tempInsurance);
			//check insurance buy or not buy by checkbox		
			if($(p).find("[chk_insurance]").is(':checked')){
				Ajaxdata[i].insurance_check = 'checked';
			}else{
				if(tempInsurance == 'Basic'){ //basic plan - we checked in frontend
					Ajaxdata[i].insurance_check = 'checked';
				}else{
					Ajaxdata[i].insurance_check = '';
				}				
			}
			
			//check insurance checkbox enabled/disabled
			if(tempInsurance != 'N/A'){
				Ajaxdata[i].insurance_checkbox = "";
				$(p).find("[chk_insurance]").removeAttr('disabled');
			}else{
				Ajaxdata[i].insurance_checkbox = insureCheckBox; 
			}					
			/* 
			*  Insurance plugin - End
			*/
			
			
			// Step 5
			var p = step.get(4);
			if($(p).hasClass("step_done")){
				Ajaxdata[i].cls_step4 = "step_done end";
			}else if($(p).hasClass("step_new")){
				Ajaxdata[i].cls_step4 = "step_new";
			}else{
				Ajaxdata[i].cls_step4 = "step_none";
			}
			Ajaxdata[i].price = $(p).find("[step=end]").html();
			
		}
		/*
		var str = "";
		for(p in Ajaxdata){
			if(typeof Ajaxdata[p] === "object"){
				str += p + " : {\n";
				for(k in Ajaxdata[p]){
					str += "  " + k + " : " + Ajaxdata[p][k] + "\n";
				}
				str += "}\n";
			}else{
				str += p + " : " + Ajaxdata[p] + "\n";
			}
		}alert(str);//*/
		//
		return Ajaxdata;
	},
	
	dataCache : function(data,ref){
		$.ajax({
			type : "post",
			url : "./?ac=CacheCart",
			data : {cart : quote.collectData(),action : data, ref : ref},
			success : function(result){
				if($.trim(result).length > 0){
					if(data == "UpdateCollection" && ref != "undefined"){ /* undifined change to undefined - 15/12/2014*/
						$("[row="+ref+"]").find("[txt_c_aid]").val(result);
					}
					if(data == "UpdateDelivery" && ref != "undefined"){ /* undifined change to undefined - 15/12/2014*/
						$("[row="+ref+"]").find("[txt_d_aid]").val(result);
					}
				}
				
				quote.updatePrice(ref);
				//alert('price1');
			}
		}).fail(function(){
			alert("Server execution error. Please contact and report this issue to us. Thank you.");
		});
	},
	
	stateName : function(code){
		var name = "";
		switch(code){
			case "jhr" : name = "Johor";break;
			case "kdh" : name = "Kedah";break;
			case "ktn" : name = "Kelantan";break;
			case "mlk" : name = "Melaka";break;
			case "nsn" : name = "Negeri Sembilan";break;
			case "phg" : name = "Pahang";break;
			case "prk" : name = "Perak";break;
			case "pls" : name = "Perlis";break;
			case "png" : name = "Pulau Pinang";break;
			case "sgr" : name = "Selangor";break;
			case "trg" : name = "Terengganu";break;
			case "kul" : name = "Kuala Lumpur";break;
			case "pjy" : name = "Putra Jaya";break;
			case "srw" : name = "Sarawak";break;
			case "sbh" : name = "Sabah";break;
			case "lbn" : name = "Labuan";break;
		}
		return name;
	},
	
	stateCode : function(name){
		var code = "";
		
		switch(name){
			case "Johor" : code = "jhr";break;
			case "Kedah" : code = "kdh";break;
			case "Kelantan" : code = "ktn";break;
			case "Melaka" : code = "mlk";break;
			case "Negeri Sembilan" : code = "nsn";break;
			case "Pahang" : code = "phg";break;
			case "Perak" : code = "prk";break;
			case "Perlis" : code = "pls";break;
			case "Pulau Pinang" : code = "png";break;
			case "Selangor" : code = "sgr";break;
			case "Terengganu" : code = "trg";break;
			case "Kuala Lumpur" : code = "kul";break;
			case "Putra Jaya" : code = "pjy";break;
			case "Sarawak" : code = "srw";break;
			case "Sabah" : code = "sbh";break;
			case "Labuan" : code = "lbn";break;
		}
		return code;
	},
	
	popContent : function(obj){
		$("#popupbox .modal-body").html($(obj).children("div").html());
		$('#popupbox .modal-header h3').html($(obj).children("div").attr("title"));
		$('#popupbox').modal('toggle');
		$("#popupbox .modal-footer").html('<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>');
	},
	
	resend : function(){
		$('#popupbox .modal-header h3').html("Resend Verification");
		$("#popupbox .modal-body").html("Resending verification code.");
		$("#popupbox .modal-footer").html('');
		$('#popupbox').modal('show');
		
		$.ajax({
			type : "post",
			url : "./?ac=doResendVerification",
			success : function(result){//alert(result);
				if($.trim(result) == 'pass'){
					$("#popupbox .modal-body").html("A verification code have been resend to your email.");
				}else{
					$("#popupbox .modal-body").html("Fail to resend your verification code.");
				}$("#popupbox .modal-footer").html('<button class="btn btn-default" data-dismiss="modal" aria-hidden="true">Close</button>');
			}
		}).fail(function(){
			$("#popupbox .modal-body").html("System have facing difficulty to send out an email.");
			$("#popupbox .modal-footer").html('<button class="btn btn-default" data-dismiss="modal" aria-hidden="true">Close</button>');
		});
	},

	userVerifyAccount : function(){
		window.location.href ="./?pg=MyAccount&tab=UserVerifyAccount";
	},

	loadDate: function(date) {
		//alert(date);
		var noWeekend = $.datepicker.noWeekends(date);
		//alert(noWeekend);
		if(noWeekend[0]){
			//alert("yes");
			return quote.noHoliday(date);
		}else{
			//alert("no");
			return noWeekend;
		}
	},
	
	noHoliday : function (date){
		var Holiday = ['2015-01-01','2015-02-03','2015-02-19','2015-02-20'];
		var AllowToday = ['14','15',''];
		var Today = new Date();
		var datestring = jQuery.datepicker.formatDate('yy-mm-dd', date);
		var todaystring = jQuery.datepicker.formatDate('yy-mm-dd', Today);
		if(Holiday.indexOf(datestring) != -1){
			return [false];
		}else{
			if(datestring == todaystring){
				if(Today.getHours() >= 12){
					return [false];
				}else{
					var row = $("#dropbox").find("[ref]").attr("ref");
					var cr = $("[row="+row+"]").find("[txt_sid]").val();
					if(AllowToday.indexOf(cr) == -1){
						return [false];
					}
				}
			}
			return [true];
		}
	}
}