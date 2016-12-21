/// <reference path="../../Scripts/jquery-2.1.3.intellisense.js" />
/// <reference path="../../Scripts/knockout-3.4.0.debug.js" />
/// <reference path="../../Scripts/knockout.mapping-latest.debug.js" />
/// <reference path="../../Scripts/require.js" />
/// <reference path="../../Scripts/underscore.js" />
/// <reference path="../../Scripts/moment.js" />
/// <reference path="../services/datacontext.js" />
/// <reference path="../schema/sph.domain.g.js" />


//define(["plugins/dialog", 'partial/bulk.receiver.dialog'],
//    function (dialog) {

//define([objectbuilders.datacontext, objectbuilders.logger, objectbuilders.router,
//objectbuilders.system, objectbuilders.validation, objectbuilders.eximp,
//objectbuilders.dialog, objectbuilders.watcher, objectbuilders.config,
//objectbuilders.app, 'partial/bulk.receiver.dialog'],

//function (context, logger, router, system, validation, eximp, dialog, watcher, config, app, partial) {

//        var route = ko.observable({
//            "role": ko.observable(),
//            "groupName": ko.observable(),
//            "route": ko.observable(),
//            "moduleId": ko.observable(),
//            "title": ko.observable(),
//            "nav": ko.observable(),
//            "icon": ko.observable(),
//            "caption": ko.observable(),
//            "settings": ko.observable(),
//            "showWhenLoggedIn": ko.observable(),
//            "isAdminPage": ko.observable(),
//            "startPageRoute": ko.observable()
//        }),
//            okClick = function (data, ev) {
//                if (bespoke.utils.form.checkValidity(ev.target)) {
//                    dialog.close(this, "Add");
//                }

//            },
//            cancelClick = function () {
//                dialog.close(this, "Cancel");
//            };

//        var vm = {
//            route: route,
//            okClick: okClick,
//            cancelClick: cancelClick
//        };


//        return vm;

//    });


define([objectbuilders.datacontext, objectbuilders.logger, objectbuilders.router,
objectbuilders.system, objectbuilders.validation, objectbuilders.eximp,
objectbuilders.dialog, objectbuilders.watcher, objectbuilders.config,
objectbuilders.app, "plugins/dialog"],

function (context, logger, router, system, validation, eximp, dialog, watcher, config, app, dialog) {

    var watching = ko.observable(false),
        id = ko.observable(),
        i18n = null,

        bulk = ko.observable({
            "role": ko.observable(),
            "groupName": ko.observable(),
            "route": ko.observable(),
            "moduleId": ko.observable(),
            "title": ko.observable(),
            "nav": ko.observable(),
            "icon": ko.observable(),
            "caption": ko.observable(),
            "settings": ko.observable(),
            "showWhenLoggedIn": ko.observable(),
            "isAdminPage": ko.observable(),
            "startPageRoute": ko.observable()
        }),
        okClick = function (data, ev) {
            if (bespoke.utils.form.checkvalidity(ev.target)) {
                dialog.close(this, "Add");
            }
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
        },

        activate = function (con) {
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
            validation.init($('#consignment-request-receiver-bulk-form'), form());
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
                    Address().PremiseNoMailbox(contact.Address.PremiseNoMailbox);
                    CompanyName(contact.CompanyName);
                    Address().AreaVillageGardenName(contact.Address.AreaVillageGardenName);
                    Address().Block(contact.Address.Block);
                    Address().BuildingName(contact.Address.BuildingName);
                    Address().City(contact.Address.City);
                    Address().Country(contact.Address.Country);
                    Address().District(contact.Address.District);
                    Address().RoadName(contact.Address.RoadName);
                    Address().State(contact.Address.State);
                    Address().SubDistrict(contact.Address.SubDistrict);
                    Address().Postcode(contact.Address.Postcode);
                    ContactInformation().PrimaryEmail(contact.ContactInformation.EmailAddress);
                    ContactInformation().PrimaryFax(contact.ContactInformation.FaxNumber);
                    ContactInformation().PrimaryPhone(contact.ContactInformation.PhoneNumber);


                });
        };
    var vm = {
        activate: activate,
        config: config,
        attached: attached,
        compositionComplete: compositionComplete,
        bulk: bulk,
        okClick: okClick,
        cancelClick: cancelClick
    };

    return vm;
});