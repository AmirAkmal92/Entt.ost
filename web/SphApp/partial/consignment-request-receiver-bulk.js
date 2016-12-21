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
                "<div class='select2-result-repository__title'>" + contact.CompanyName + "</div>";

            markup += "<div class='select2-result-repository__description'>" + contact.ContactPerson + "</div>";


            markup += "<div class='select2-result-repository__statistics'>" +
              "<div class='select2-result-repository__forks'><i class='fa fa-flash'></i> " + contact.ReferenceNo + " Ref</div>" +
              "<div class='select2-result-repository__stargazers'><i class='fa fa-star'></i> " + contact.ContactInformation.EmailAddress + " Email</div>" +
              "<div class='select2-result-repository__watchers'><i class='fa fa-eye'></i> " + contact.ContactInformation.PhoneNumber + " Phone</div>" +
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
                templateSelection: function (o) { return o.CompanyName || o.text; }
            })
                .on("select2:select", function (e) {
                    console.log(e);
                    var contact = e.params.data;
                    if (!contact) {
                        return;
                    }
                    receiver().Address().PremiseNoMailbox(contact.Address.PremiseNoMailbox);
                    receiver().CompanyName(contact.CompanyName);
                    receiver().Address().AreaVillageGardenName(contact.Address.AreaVillageGardenName);
                    receiver().Address().Block(contact.Address.Block);
                    receiver().Address().BuildingName(contact.Address.BuildingName);
                    receiver().Address().City(contact.Address.City);
                    receiver().Address().Country(contact.Address.Country);
                    receiver().Address().District(contact.Address.District);
                    receiver().Address().RoadName(contact.Address.RoadName);
                    receiver().Address().State(contact.Address.State);
                    receiver().Address().SubDistrict(contact.Address.SubDistrict);
                    receiver().Address().Postcode(contact.Address.Postcode);
                    receiver().ContactInformation().PrimaryEmail(contact.ContactInformation.EmailAddress);
                    receiver().ContactInformation().PrimaryFax(contact.ContactInformation.FaxNumber);
                    receiver().ContactInformation().PrimaryPhone(contact.ContactInformation.PhoneNumber);


                });
        };

    return {
        activate: activate,
        attached: attached
    };

});