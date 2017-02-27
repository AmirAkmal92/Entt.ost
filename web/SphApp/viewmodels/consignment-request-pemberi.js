define([objectbuilders.datacontext, objectbuilders.logger, objectbuilders.router,
objectbuilders.system, objectbuilders.validation, objectbuilders.eximp,
objectbuilders.dialog, objectbuilders.watcher, objectbuilders.config,
objectbuilders.app, "viewmodels/_consignment-request-cart"],

function (context, logger, router, system, validation, eximp, dialog, watcher, config, app, crCart) {

    var entity = ko.observable(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid())),
        consignment = ko.observable(),
        pemberi = ko.observable(),
        availableCountries = ko.observableArray(),
        isUsingPickupAddress = ko.observable(true),
        errors = ko.observableArray(),
        id = ko.observable(),
        crid = ko.observable(),
        cid = ko.observable(),
        partial = partial || {},
        headers = {},
        activate = function (crId, cId) {
            id(crId);
            crid(crId);
            cid(cId);
            var tcs = new $.Deferred();
            if (!crId || crId === "0") {
                return Task.fromResult({
                    WebId: system.guid()
                });
            }
            return context.get("/api/consigment-requests/" + crId)
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
                    consignment(new bespoke.Ost_consigmentRequest.domain.Consignment(system.guid()));
                    pemberi(new bespoke.Ost_consigmentRequest.domain.Pemberi(system.guid()));
                    if (!cId || cId === "0") {
                        consignment().Pemberi(pemberi());
                        entity().Consignments().push(consignment());
                        consignment().Pemberi().Address().Country("MY");
                        cid(consignment().WebId());
                    } else {
                        var editIndex = -1;
                        for (var i = 0; i < entity().Consignments().length; i++) {
                            if (entity().Consignments()[i].WebId() === cId) {
                                editIndex = i;
                                break;
                            }
                        }
                        if (editIndex != -1) {
                            consignment().Pemberi(entity().Consignments()[editIndex].Pemberi());
                            if (consignment().Pemberi().Address().Country() === undefined) {
                                consignment().Pemberi().Address().Country("MY");
                            }
                            cid(entity().Consignments()[i].WebId());
                        } else {
                            app.showMessage("Sorry, but we cannot find any Parcel with Id : " + cId, "Ost", ["OK"]).done(function () {
                                router.navigate("consignment-request-cart/" + crId);
                            });
                        }
                    }

                    // always check for pickup location
                    if (entity().Pickup().Address().Postcode() === undefined) {
                        app.showMessage("Sorry, you must set Pickup Location first before you can send any Parcel.", "Ost", ["OK"]).done(function () {
                            router.navigate("consignment-request-pickup/" + crId);
                        });
                    }

                    // always check for pickup schedule
                    if (entity().Pickup().DateReady() === "0001-01-01T00:00:00" || entity().Pickup().DateClose() === "0001-01-01T00:00:00") {
                    } else {
                        app.showMessage("Pickup has been scheduled. No more changes are allowed to the Sender. You may proceed to make Payment now.", "Ost", ["OK"]).done(function () {
                            router.navigate("consignment-request-summary/" + crId);
                        });
                    }

                    // toggle Address Source
                    togglePemberiAddressSource();
                }, function (e) {
                    if (e.status == 404) {
                        app.showMessage("Sorry, but we cannot find any ConsigmentRequest with Id : " + crId, "Ost", ["OK"]).done(function () {
                                router.navigate("consignment-request-cart/" + crId);
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
        deactivate = function () {
            isUsingPickupAddress(true);
        },
        attached = function (view) {
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
                   fillUpContact(contact);
               });
        },
        togglePemberiAddressSource = function () {
            if (isUsingPickupAddress()) {
                fillUpContact(ko.toJS(entity().Pickup()))
            } else {
                fillUpContact(ko.toJS(new bespoke.Ost_consigmentRequest.domain.Pemberi(system.guid())));
                consignment().Pemberi().Address().Country("MY");
            }
        },
        toggleIsUsingPickupAddress = function () {
            isUsingPickupAddress(!isUsingPickupAddress());
            togglePemberiAddressSource();
        },
        fillUpContact = function (contact) {
            consignment().Pemberi().CompanyName(contact.CompanyName);
            consignment().Pemberi().ContactPerson(contact.ContactPerson);
            consignment().Pemberi().Address().Address1(contact.Address.Address1);
            consignment().Pemberi().Address().Address2(contact.Address.Address2);
            consignment().Pemberi().Address().Address3(contact.Address.Address3);
            consignment().Pemberi().Address().Address4(contact.Address.Address4);
            consignment().Pemberi().Address().Postcode(contact.Address.Postcode);
            consignment().Pemberi().Address().City(contact.Address.City);
            consignment().Pemberi().Address().State(contact.Address.State);
            consignment().Pemberi().Address().Country(contact.Address.Country);
            consignment().Pemberi().ContactInformation().Email(contact.ContactInformation.Email);
            consignment().Pemberi().ContactInformation().AlternativeContactNumber(contact.ContactInformation.AlternativeContactNumber);
            consignment().Pemberi().ContactInformation().ContactNumber(contact.ContactInformation.ContactNumber);
        },
        compositionComplete = function () {

        },
        saveCommand = function () {
            return defaultCommand()
                .then(function (result) {
                    if (result.success) {
                        return app.showMessage("Sender details has been successfully saved", "POS Online Shipping Tools", ["OK"]).done(function () {
                            crCart.activate();
                        });
                    } else {
                        return Task.fromResult(false);
                    }
                })
                .then(function (result) {
                    if (result) {
                        router.navigate("consignment-request-penerima/" + crid() + "/consignments/" + cid());
                    }
                });
        };
    var vm = {
        partial: partial,
        activate: activate,
        deactivate: deactivate,
        config: config,
        attached: attached,
        compositionComplete: compositionComplete,
        entity: entity,
        availableCountries: availableCountries,
        isUsingPickupAddress: isUsingPickupAddress,
        toggleIsUsingPickupAddress: toggleIsUsingPickupAddress,
        errors: errors,
        crid: crid,//temp
        cid: cid,//temp
        consignment: consignment,
        saveCommand: saveCommand        
    };

    return vm;
});