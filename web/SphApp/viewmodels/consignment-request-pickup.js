define([objectbuilders.datacontext, objectbuilders.logger, objectbuilders.router,
objectbuilders.system, objectbuilders.validation, objectbuilders.eximp,
objectbuilders.dialog, objectbuilders.watcher, objectbuilders.config,
objectbuilders.app, "viewmodels/_consignment-request-cart"],

function (context, logger, router, system, validation, eximp, dialog, watcher, config, app, crCart) {

    var entity = ko.observable(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid())),
        availableCountries = ko.observableArray(),
        isPoscodeValid = ko.observable(false),
        errors = ko.observableArray(),
        id = ko.observable(),
        partial = partial || {},
        headers = {},
        activate = function (entityId) {
            id(entityId);
            var tcs = new $.Deferred();
            if (!entityId || entityId === "0") {
                return Task.fromResult({
                    WebId: system.guid()
                });
            }
            return context.get("/api/consigment-requests/" + entityId)
                .then(function (b, textStatus, xhr) {

                    if (xhr) {
                        var etag = xhr.getResponseHeader("ETag"),
                            lastModified = xhr.getResponseHeader("Last-Modified");
                        if (etag) {
                            headers["If-Match"] = etag;
                        }
                        if (lastModified) {
                            headers["If-Modified-Since"] = lastModified;
                        }
                    }
                    entity(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(b[0] || b));
                    if (entity().Pickup().Address().Postcode() != undefined) {
                        isPoscodeValid(true);
                    }
                }, function (e) {
                    if (e.status == 404) {
                        app.showMessage("Sorry, but we cannot find any ConsigmentRequest with Id : " + id, "Ost", ["OK"]).done(function () {
                            router.navigate("consignment-request-cart/" + id);
                        });
                    }
                }).always(function () {
                    context.get("/api/countries/available-country?size=300").done(function (cList) {
                        availableCountries(cList._results);
                    });
                    if (typeof partial.activate === "function") {
                        partial.activate(ko.unwrap(entity))
                            .done(tcs.resolve)
                            .fail(tcs.reject);
                    } else {
                        tcs.resolve(true);
                    }
                });
            return tcs.promise();

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
        defaultCommand = function () {
            var data = ko.mapping.toJSON(entity),
                tcs = new $.Deferred();

            context.put(data, "/api/consigment-requests/" + ko.unwrap(entity().Id) + "", headers)
                .fail(function (response) {
                    var result = response.responseJSON;
                    errors.removeAll();
                    if (response.status === 428) {
                        // out of date conflict
                        logger.error(result.message);
                    }
                    if (response.status === 422 && _(result.rules).isArray()) {
                        _(result.rules).each(function (v) {
                            errors(v.ValidationErrors);
                        });
                    }
                    logger.error("There are errors in your entity, !!!");
                    tcs.resolve(false);
                })
                .then(function (result) {
                    logger.info(result.message);
                    entity().Id(result.id);
                    errors.removeAll();
                    tcs.resolve(result);
                });
            return tcs.promise();
        },
        attached = function (view) {
            entity().Pickup().Address().Postcode.subscribe(function (newValue) {
                getPickupAvailability(newValue);
            });

            $("#pickup-company-name").select2({
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
                   entity().Pickup().CompanyName(contact.CompanyName);
                   entity().Pickup().ContactPerson(contact.ContactPerson);
                   entity().Pickup().Address().Address1(contact.Address.Address1);
                   entity().Pickup().Address().Address2(contact.Address.Address2);
                   entity().Pickup().Address().Address3(contact.Address.Address3);
                   entity().Pickup().Address().Address4(contact.Address.Address4);
                   entity().Pickup().Address().Postcode(contact.Address.Postcode);
                   entity().Pickup().Address().City(contact.Address.City);
                   entity().Pickup().Address().State(contact.Address.State);
                   entity().Pickup().Address().Country(contact.Address.Country);
                   entity().Pickup().ContactInformation().Email(contact.ContactInformation.Email);
                   entity().Pickup().ContactInformation().AlternativeContactNumber(contact.ContactInformation.AlternativeContactNumber);
                   entity().Pickup().ContactInformation().ContactNumber(contact.ContactInformation.ContactNumber);
               });
        },
        compositionComplete = function () {

        },
        getPickupAvailability = function (postcode) {
            context.get("/consignment-request/get-pickup-availability/" + postcode)
                .then(function (result) {
                    isPoscodeValid(true);
                    console.log(result);
                }, function (e) {
                    isPoscodeValid(false);
                    if (e.status == 404) {                        
                        app.showMessage("Sorry, no pickup coverage for given location / postcode: "
                            + postcode
                            + ". Please choose another Pickup Location.", "Ost", ["OK"]).done(function () {
                            entity().Pickup().CompanyName("");
                            entity().Pickup().ContactPerson("");
                            entity().Pickup().Address().Address1("");
                            entity().Pickup().Address().Address2("");
                            entity().Pickup().Address().Address3("");
                            entity().Pickup().Address().Address4("");
                            //entity().Pickup().Address().Postcode("");
                            entity().Pickup().Address().City("");
                            entity().Pickup().Address().State("");
                            entity().Pickup().Address().Country("");
                            entity().Pickup().ContactInformation().Email("");
                            entity().Pickup().ContactInformation().AlternativeContactNumber("");
                            entity().Pickup().ContactInformation().ContactNumber("");
                        });
                    }
                });
        },
        saveCommand = function () {
            //var postcode = entity().Pickup().Address().Postcode();
            //getPickupAvailability(postcode);
            return defaultCommand()
                .then(function (result) {
                    if (result.success) {
                        return app.showMessage("Pickup details has been successfully saved", "POS Online Shipping Tools", ["OK"]).done(function () {
                            crCart.activate();
                        });
                    } else {
                        return Task.fromResult(false);
                    }
                })
                .then(function (result) {
                    if (result) {
                        router.navigate("consignment-request-cart/" + id());
                    }
                });
        };
    var vm = {
        partial: partial,
        activate: activate,
        config: config,
        attached: attached,
        compositionComplete: compositionComplete,
        entity: entity,
        availableCountries: availableCountries,
        isPoscodeValid: isPoscodeValid,
        errors: errors,
        saveCommand: saveCommand
    };

    return vm;
});