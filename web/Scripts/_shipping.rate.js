$(function () {
    var ost = {};
    ost.ShippingRateModel = function () {
        var fromAddress = ko.observable(),
            fromPostcode = ko.observable(),
            toAddress = ko.observable(),
            toPostCode = ko.observable(),
            weight = ko.observable(),
            width = ko.observable(),
            height = ko.observable(),
            length = ko.observable(),
            valueAddedServices = ko.observableArray(),
            estimatedTotal = ko.observable();

        return {
            fromAddress :fromAddress,
            fromPostcode : fromPostcode,
            toAddress :toAddress,
            toPostCode : toPostCode,
            weight :weight,
            width :width,
            height : height,
            length : length,
            valueAddedServices : valueAddedServices,
            estimatedTotal : estimatedTotal
        };
    },
    formatRepo =    function  (address) {
             if(!address) return "";
             if(address.loading)return  address.text;
              var markup = "<div class='select2-result-repository clearfix'>" +
                "<div class='select2-result-repository__avatar'><img src='/assets/layouts/layout/img/avatar3_small.jpg' /></div>" +
                "<div class='select2-result-repository__meta'>" +
                  "<div class='select2-result-repository__title'>" + address.Location + "</div>";
        
                markup += "<div class='select2-result-repository__description'>" + address.City + "</div>";
              
        
              markup += "<div class='select2-result-repository__statistics'>" +
                "<div class='select2-result-repository__forks'><i class='fa fa-flash'></i> " + address.State + " </div>" +
                "<div class='select2-result-repository__stargazers'><i class='fa fa-star'></i> " + address.Postcode + " </div>" +
              "</div>" +
              "</div></div>";
        
              return markup;
        };

     $("#to-address, #from-address").select2({
                  ajax: {
                    url: "/api/address-lookups/",
                    dataType: 'json',
                    delay: 250,
                    data: function (params) {
                      return {
                        q: params.term.replace(/\//g, '\\/'), // search term
                        page: params.page
                      };
                    },
                    processResults: function (data, params) {
                      params.page = params.page || 1;
                      var results = _(data._results).map(function(v){
                          v.id = v.Id;
                          return v;
                      });
                      return {
                        results: results,
                        pagination: {
                          more: (params.page * 30) < data._count
                        }
                      };
                    },
                    cache: false
                  },
                  escapeMarkup: function (markup) { return markup; }, 
                  minimumInputLength: 3,
                  templateResult: formatRepo,
                  templateSelection: function(o){ return o.Location || o.text; }
                })
                .on("select2:select", function(e){
                    var address = e.params.data;
                    if(!address){
                        return;
                    }
                    console.log(e);
                    
                    
                });

    var model = new ost.ShippingRateModel();
    ko.applyBindings(model, document.getElementById("shipping-rate-form"))



});