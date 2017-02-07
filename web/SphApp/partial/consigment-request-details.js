define([objectbuilders.config, objectbuilders.system], function (config, system) {
    var createdByQuery = "CreatedBy eq '" + config.userName + "'",
        request = null,
        activate = function (entity) {
            request = entity,
            guid = system.guid(),
            tcs = new $.Deferred();
            if (request.Id() === "0") {
                request.Id(guid);
            }
            setTimeout(function(){
                tcs.resolve(true);
            }, 500);

            return tcs.promise();
        },
        formatRepo =    function  (contact) {
             if(!contact)return "";
             if(contact.loading)return  contact.text;
              var markup = "<div class='select2-result-repository clearfix'>" +
                "<div class='select2-result-repository__avatar'><img src='/assets/layouts/layout/img/avatar3_small.jpg' /></div>" +
                "<div class='select2-result-repository__meta'>" +
                  "<div class='select2-result-repository__title'>" + contact.ContactPerson + "</div>";
        
                markup += "<div class='select2-result-repository__description'>" + contact.CompanyName + "</div>";
              
        
              markup += "<div class='select2-result-repository__statistics'>" +
                "<div class='select2-result-repository__forks'><i class='fa fa-flash'></i> " + contact.ReferenceNo + " Ref</div>" +
                "<div class='select2-result-repository__stargazers'><i class='fa fa-star'></i> " + contact.ContactInformation.Email + " Email</div>" +
                "<div class='select2-result-repository__watchers'><i class='fa fa-eye'></i> " + contact.ContactInformation.ContactNumber + " Phone</div>" +
              "</div>" +
              "</div></div>";
        
              return markup;
        },
        attached  = function(view){
            
            $("#sender-company-name").select2({
                  ajax: {
                    url: "/api/address-books/",
                    dataType: 'json',
                    delay: 250,
                    data: function (params) {
                      return {
                        q: params.term, // search term
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
                  templateSelection: function (o) { return o.ContactPerson || o.text; }
                })
                .on("select2:select", function(e){
                    console.log(e);
                    var contact = e.params.data;
                    if(!contact){
                        return;
                    }
                    request.Sender().CompanyName(contact.CompanyName);
                    request.Sender().ContactPerson(contact.ContactPerson);
                    request.Sender().Address().Address1(contact.Address.Address1);
                    request.Sender().Address().Address2(contact.Address.Address2);
                    request.Sender().Address().Address3(contact.Address.Address3);
                    request.Sender().Address().Address4(contact.Address.Address4);
                    request.Sender().Address().Postcode(contact.Address.Postcode);
                    request.Sender().Address().City(contact.Address.City);
                    request.Sender().Address().State(contact.Address.State);
                    request.Sender().Address().Country(contact.Address.Country);
                    request.Sender().ContactInformation().Email(contact.ContactInformation.Email);
                    request.Sender().ContactInformation().AlternativeContactNumber(contact.ContactInformation.AlternativeContactNumber);
                    request.Sender().ContactInformation().ContactNumber(contact.ContactInformation.ContactNumber);
                    
                    
                });
        };

    return {
        activate : activate,
        createdByQuery : createdByQuery,
        attached : attached
    };

});