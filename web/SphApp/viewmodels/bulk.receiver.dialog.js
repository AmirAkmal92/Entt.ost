define([objectbuilders.datacontext, objectbuilders.system, "plugins/dialog"],

    function(context, system, dialog) {

        var receiver = ko.observable(new bespoke.Ost_consigmentRequest.domain.Receiver(system.guid())),
            id = ko.observable(),
            i18n = null,
            activate = function(con) {
                receiver(new bespoke.Ost_consigmentRequest.domain.Receiver(system.guid()));
                return true;
            },
            formatRepo = function(contact) {
                if (!contact) return "";
                if (contact.loading) return contact.text;
                var markup = "<div class='select2-result-repository clearfix'>" +
                    "<div class='select2-result-repository__avatar'><img src='/assets/layouts/layout/img/avatar3_small.jpg' /></div>" +
                    "<div class='select2-result-repository__meta'>" +
                    "<div class='select2-result-repository__title'>" + contact.ContactPerson + "</div>";

                markup += "<div class='select2-result-repository__description'>" + contact.CompanyName + "</div>";


                markup += "<div class='select2-result-repository__statistics'>" +
                    "<div class='select2-result-repository__forks'><i class='fa fa-flash'></i> " + contact.ReferenceNo + " Ref</div>" +
                    "<div class='select2-result-repository__stargazers'><i class='fa fa-star'></i> " + contact.ContactInformation.EmailAddress + " Email</div>" +
                    "<div class='select2-result-repository__watchers'><i class='fa fa-eye'></i> " + contact.ContactInformation.ContactNumber + " Phone</div>" +
                    "</div>" +
                    "</div>";

                return markup;
            },
            attached = function(view) {
                $("#receiver-company-name").select2({
                        ajax: {
                            url: "/api/address-books/",
                            dataType: 'json',
                            delay: 250,
                            data: function(params) {
                                return {
                                    q: params.term, // search term
                                    page: params.page
                                };
                            },
                            processResults: function(data, params) {
                                params.page = params.page || 1;
                                var results = _(data._results).map(function(v) {
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
                        escapeMarkup: function(markup) { return markup; },
                        minimumInputLength: 3,
                        templateResult: formatRepo,
                        templateSelection: function(o) { return o.ContactPerson || o.text; }
                    })
                    .on("select2:select", function(e) {
                        console.log(e);
                        var contact = e.params.data;
                        if (!contact) {
                            return;
                        }
                        receiver().ContactPerson(contact.ContactPerson);
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
            },

            okClick = function(data, ev) {
                dialog.close(this, "OK");
            },
            cancelClick = function() {
                dialog.close(this, "Cancel");
            };
        var vm = {
            activate: activate,
            attached: attached,
            receiver: receiver,
            okClick: okClick,
            cancelClick: cancelClick
        };

        return vm;
    });