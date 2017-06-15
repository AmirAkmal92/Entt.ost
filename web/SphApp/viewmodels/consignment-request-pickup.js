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
            //return context.get("/api/consigment-requests/" + entityId)
            return $.ajax({
                url: "/api/consigment-requests/" + entityId,
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
                if (entity().Pickup().Address().Postcode() != undefined) {
                    isPoscodeValid(true);
                }
                //validate Personal Details, Default Billing Address, Default Pickup Address
                var goToDashboard = false;
                var userDetail = ko.observable();
                $.ajax({
                    url: "/api/user-details/user-profile",
                    method: "GET",
                    cache: false
                }).done(function (userDetailList) {

                    if (userDetailList._count == 0) {
                        goToDashboard = true;
                    } else {
                        userDetail(new bespoke.Ost_userDetail.domain.UserDetail(userDetailList._results[0]));
                        if ((ko.unwrap(userDetail().Profile().Address().Postcode) == undefined)
                            || (ko.unwrap(userDetail().PickupAddress().Address().Postcode) == undefined)
                            || (ko.unwrap(userDetail().BillingAddress().Address().Postcode) == undefined)) {
                            goToDashboard = true;
                        }
                    }
                    if (goToDashboard) {
                        app.showMessage("Personal Details, Default Billing Address or Default Pickup Address must be set first before you can send any Parcel.", "OST", ["Close"]).done(function () {
                            router.navigate("customer-home");
                        });
                        //user choose to use Default Pickup Address or own pickup address
                    } else {
                        if ((ko.unwrap(entity().Pickup().Address().Postcode)) == undefined) {
                            var msg = `<address>`
                                + `     <strong>${userDetail().PickupAddress().ContactPerson()}</strong><br />`
                                + `     ${userDetail().PickupAddress().ContactInformation().Email()}`
                                + `</address>`
                            if ((ko.unwrap(userDetail().PickupAddress().CompanyName()) != undefined)) {
                                msg += `     <strong>${userDetail().PickupAddress().CompanyName()}</strong><br />`
                            }
                            msg += `<address>`
                            + `     ${userDetail().PickupAddress().Address().Address1()}&nbsp;`
                            + `     ${userDetail().PickupAddress().Address().Address2()}&nbsp;`
                        
                            if ((ko.unwrap(userDetail().PickupAddress().Address().Address3) != undefined)) {
                                msg += `     <br />`
                                + `     ${userDetail().PickupAddress().Address().Address3()}&nbsp;`
                            }
                            if ((ko.unwrap(userDetail().PickupAddress().Address().Address4) != undefined)) {
                                msg += `     ${userDetail().PickupAddress().Address().Address4()}&nbsp;`
                            }
                            msg += `     <br />`
                            + `     ${userDetail().PickupAddress().Address().Postcode()}&nbsp;`
                            + `     ${userDetail().PickupAddress().Address().City()}&nbsp;`
                            + `     <br />`
                            + `     ${userDetail().PickupAddress().Address().State()}&nbsp;`
                            + `     Malaysia&nbsp;`
                            + `     <br />`
                            + `     Phone 1:&nbsp;${userDetail().PickupAddress().ContactInformation().ContactNumber()}<br />`
                            if ((ko.unwrap(userDetail().PickupAddress().ContactInformation().AlternativeContactNumber()) != undefined)) {
                                msg += `     Phone 2:&nbsp;${userDetail().PickupAddress().ContactInformation().AlternativeContactNumber()}`
                            }
                            msg += `</address>`
                            + `Do you want to use it as your current Pickup details?`;
                            app.showMessage(msg, "OST", ["Yes", "No"]).done(function (dialogResult) {
                                if (dialogResult === "Yes") {
                                    //use default pickup address                                  
                                    entity().Pickup().CompanyName(userDetail().PickupAddress().CompanyName());
                                    entity().Pickup().ContactPerson(userDetail().PickupAddress().ContactPerson());
                                    entity().Pickup().Address().Address1(userDetail().PickupAddress().Address().Address1());
                                    entity().Pickup().Address().Address2(userDetail().PickupAddress().Address().Address2());
                                    entity().Pickup().Address().Address3(userDetail().PickupAddress().Address().Address3());
                                    entity().Pickup().Address().Address4(userDetail().PickupAddress().Address().Address4());
                                    entity().Pickup().Address().Postcode(userDetail().PickupAddress().Address().Postcode());
                                    entity().Pickup().Address().City(userDetail().PickupAddress().Address().City());
                                    entity().Pickup().Address().State(userDetail().PickupAddress().Address().State());
                                    entity().Pickup().Address().Country(userDetail().PickupAddress().Address().Country());
                                    entity().Pickup().ContactInformation().Email(userDetail().PickupAddress().ContactInformation().Email());
                                    entity().Pickup().ContactInformation().AlternativeContactNumber(userDetail().PickupAddress().ContactInformation().AlternativeContactNumber());
                                    entity().Pickup().ContactInformation().ContactNumber(userDetail().PickupAddress().ContactInformation().ContactNumber());
                                }
                                if (dialogResult === "No") {
                                    //fall trough
                                }
                            });
                        }
                    }
                });
            }, function (e) {
                if (e.status == 404) {
                    app.showMessage("Sorry, but we cannot find any ConsigmentRequest with Id : " + id, "OST", ["Close"]).done(function () {
                        router.navigate("consignment-request-cart/" + id);
                    });
                }
            }).then(function () {
                var setToMY = false;
                if (entity().Pickup().Address().Country() === undefined) {
                    setToMY = true;
                }
                context.get("/api/countries/available-country?size=300").done(function (cList) {
                    availableCountries(cList._results);
                    if (setToMY) {
                        entity().Pickup().Address().Country("MY");
                    }
                });
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
              "<div class='select2-result-repository__avatar'><img src='/assets/admin/pages/img/avatars/user_default.png' /></div>" +
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
            if (!$("#consignment-request-pickup-form").valid()) {
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
            $("#consignment-request-pickup-form").validate({
                rules: {
                },
                messages: {
                }
            });

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
                            + ". Please choose another Pickup Location.", "OST", ["Close"]).done(function () {
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
                        return app.showMessage("Pickup details has been successfully saved. Return to Shipping Cart and start adding Parcel. ", "OST", ["Close"]).done(function () {
                            crCart.activate();
                        });
                    } else {
                        return Task.fromResult(false);
                    }
                })
                .then(function (result) {
                    if (result) {
                        if (config.profile.Designation == "Contract customer") {
                            router.navigate("consignment-request-cart-est/" + id());
                        } else {
                            router.navigate("consignment-request-cart/" + id());
                        }
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