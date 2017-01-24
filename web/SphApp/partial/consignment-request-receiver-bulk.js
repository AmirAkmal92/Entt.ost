define([objectbuilders.system, "viewmodels/consigment-request-details-bulk", "services/_google.places.api"], function (system, step1, googlePlacesApi) {
    var activate = function (con) {
        return true;
    },
        formatRepo = function (contact) {
            if (!contact) return "";
            if (contact.loading) return contact.text;
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
        attached = function (view) {

            $("#receiver-company-name").select2({
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
                        var results = _(data._results).map(function (v) {
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
                .on("select2:select", function (e) {
                    console.log(e);
                    var contact = e.params.data;
                    if (!contact) {
                        return;
                    }
                    receiver().CompanyName(contact.CompanyName);
                    receiver().Address().Address1(contact.Address.Address1);
                    receiver().Address().Address2(contact.Address.Address2);
                    receiver().Address().Address3(contact.Address.Address3);
                    receiver().Address().Address4(contact.Address.Address4);
                    receiver().Address().Postcode(contact.Address.Postcode);
                    receiver().Address().City(contact.Address.City);
                    receiver().Address().State(contact.Address.State);
                    receiver().Address().Country(contact.Address.Country);
                    receiver().ContactInformation().Email(contact.ContactInformation.Email);
                    receiver().ContactInformation().AlternativeContactNumber(contact.ContactInformation.AlternativeContactNumber);
                    receiver().ContactInformation().ContactNumber(contact.ContactInformation.ContactNumber);

                });
        };

    return {
        activate: activate,
        attached: attached
    };

});