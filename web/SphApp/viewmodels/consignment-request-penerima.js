define([objectbuilders.datacontext, objectbuilders.logger, objectbuilders.router,
objectbuilders.system, objectbuilders.validation, objectbuilders.eximp,
objectbuilders.dialog, objectbuilders.watcher, objectbuilders.config,
objectbuilders.app],

function (context, logger, router, system, validation, eximp, dialog, watcher, config, app) {

    var entity = ko.observable(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid())),
        consignment = ko.observable(),
        penerima = ko.observable(),
        availableCountries = ko.observableArray(),
        errors = ko.observableArray(),
        form = ko.observable(new bespoke.sph.domain.EntityForm()),
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
            //return context.get("/api/consigment-requests/" + crId)
            return $.ajax({
                url: "/api/consigment-requests/" + crId,
                method: "GET",
                cache: false
            }).then(function (b, textStatus, xhr) {

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
                penerima(new bespoke.Ost_consigmentRequest.domain.Penerima(system.guid()));
                if (!cId || cId === "0") {
                    consignment().Penerima(penerima());
                    entity().Consignments().push(consignment());
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
                        consignment().Penerima(entity().Consignments()[editIndex].Penerima());
                        cid(entity().Consignments()[i].WebId());
                    } else {
                        app.showMessage("Sorry, but we cannot find any Parcel with Id : " + cId, "Ost", ["OK"]).done(function () {
                            router.navigate("consignment-request-cart/" + crId);
                        });
                    }
                }

                // always check for pickup location
                if (entity().Pickup().Address().Postcode() === undefined) {
                    app.showMessage("You must set Pickup Location first before you can send any Parcel.", "Ost", ["OK"]).done(function () {
                        router.navigate("consignment-request-pickup/" + crId);
                    });
                }

                // always check for pickup schedule
                if (entity().Pickup().DateReady() === "0001-01-01T00:00:00" || entity().Pickup().DateClose() === "0001-01-01T00:00:00") {
                } else {
                    app.showMessage("Pickup has been scheduled. No more changes are allowed to the Receiver. You may proceed to make Payment now.", "Ost", ["OK"]).done(function () {
                        router.navigate("consignment-request-summary/" + crId);
                    });
                }
            }, function (e) {
                if (e.status == 404) {
                    app.showMessage("Sorry, but we cannot find any ConsigmentRequest with Id : " + crId, "Ost", ["OK"]).done(function () {
                        router.navigate("consignment-request-cart/" + crId);
                    });
                }
            }).then(function () {
                var setToMY = false;
                if (consignment().Penerima().Address().Country() === undefined) {
                    setToMY = true;
                }
                context.get("/api/countries/available-country?size=300").done(function (cList) {
                    availableCountries(cList._results);
                    if (setToMY) {
                        consignment().Penerima().Address().Country("MY");
                    }
                });
            }).always(function () {
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
            if (!$("#consignment-request-penerima-form").valid()) {
                return Task.fromResult(false);
            }
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
            $("#consignment-request-pemberi-form").validate({
                rules: {
                },
                messages: {
                }
            });
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
                               consignment().Penerima().CompanyName(contact.CompanyName);
                               consignment().Penerima().ContactPerson(contact.ContactPerson);
                               consignment().Penerima().Address().Address1(contact.Address.Address1);
                               consignment().Penerima().Address().Address2(contact.Address.Address2);
                               consignment().Penerima().Address().Address3(contact.Address.Address3);
                               consignment().Penerima().Address().Address4(contact.Address.Address4);
                               consignment().Penerima().Address().Postcode(contact.Address.Postcode);
                               consignment().Penerima().Address().City(contact.Address.City);
                               consignment().Penerima().Address().State(contact.Address.State);
                               consignment().Penerima().Address().Country(contact.Address.Country);
                               consignment().Penerima().ContactInformation().Email(contact.ContactInformation.Email);
                               consignment().Penerima().ContactInformation().AlternativeContactNumber(contact.ContactInformation.AlternativeContactNumber);
                               consignment().Penerima().ContactInformation().ContactNumber(contact.ContactInformation.ContactNumber);
                           });
        },
        compositionComplete = function () {

        },
        saveCommand = function () {
            return defaultCommand()
                .then(function (result) {
                    if (result.success) {
                        return app.showMessage("Receiver details has been successfully saved.", "OST", ["OK"]);
                    } else {
                        return Task.fromResult(false);
                    }
                })
                .then(function (result) {
                    if (result) {
                        router.navigate("consignment-request-produk/" + crid() + "/consignments/" + cid());
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
        errors: errors,
        crid: crid,//temp
        cid: cid,//temp
        consignment: consignment,
        saveCommand: saveCommand
    };

    return vm;
});