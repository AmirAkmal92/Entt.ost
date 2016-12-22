define([objectbuilders.datacontext, objectbuilders.logger, objectbuilders.router,
objectbuilders.system, objectbuilders.validation, objectbuilders.eximp,
objectbuilders.dialog, objectbuilders.watcher, objectbuilders.config,
objectbuilders.app, "plugins/dialog"],

function (context, logger, router, system, validation, eximp, dialog, watcher, config, app, dialog) {

    var receiver = ko.observable(new bespoke.Ost_consigmentRequest.domain.Receiver(system.guid())),
        watching = ko.observable(false),
        id = ko.observable(),
        i18n = null,

        activate = function (con) {
            receiver(new bespoke.Ost_consigmentRequest.domain.Receiver(system.guid()));
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
                templateSelection: function (o) { return o.ContactPerson || o.text; }
            })
                .on("select2:select", function (e) {
                    console.log(e);
                    var contact = e.params.data;
                    if (!contact) {
                        return;
                    }
                    receiver().Address().PremiseNoMailbox(contact.Address.PremiseNoMailbox);
                    receiver().ContactPerson(contact.ContactPerson);
                    receiver().CompanyName(contact.CompanyName);
                    receiver().ReferenceNo(contact.ReferenceNo);
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
        },

        okClick = function (data, ev) {
            //if (bespoke.utils.receiver.checkvalidity(ev.target)) {
                dialog.close(this, "OK");
            //}
        },
        cancelClick = function () {
            dialog.close(this, "Cancel");
        },
        compositionComplete = function () {
            $("[data-i18n]").each(function (i, v) {
                var $label = $(v),
                    text = $label.data("i18n");
                if (i18n && typeof i18n[text] === "string") {
                    $label.text(i18n[text]);
                }
            });
        };
    var vm = {
        activate: activate,
        attached: attached,
        config: config,
        receiver: receiver,
        compositionComplete: compositionComplete,
        okClick: okClick,
        cancelClick: cancelClick
    };

    return vm;
});