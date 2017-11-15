define([objectbuilders.datacontext, objectbuilders.logger, objectbuilders.router,
objectbuilders.config, objectbuilders.app, objectbuilders.system, "services/_ko.list", "viewmodels/_consignment-request-cart"],

    function (context, logger, router, config, app, system, koList, crCart) {
        var isBusy = ko.observable(false),
            errors = ko.observableArray(),
            entity = ko.observable(),
            availableCountries = ko.observableArray(),
            availableCountriesCount = 0,
            crShippingCart = ko.observable(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid())),
            consignmentRequestsHistory = ko.observableArray(),
            query = "/api/consigment-requests/paid",
            list = ko.observableArray([]),
            partial = partial || {},
            map = function (v) {
                if (typeof partial.map === "function") {
                    return partial.map(v);
                }
                return v;
            },
            activate = function () {
                if (typeof partial.activate === "function") {
                    return partial.activate(list);
                }
                //context.get("/api/user-details/user-profile")
                return $.ajax({
                    url: "/api/user-details/user-profile",
                    method: "GET",
                    cache: false
                }).done(function (userDetailList) {
                    console.log(userDetailList);
                    if (userDetailList._count == 0) {
                        var guid = system.guid();
                        entity(new bespoke.Ost_userDetail.domain.UserDetail(guid));
                        entity().Id(guid);
                        entity().UserId(config.userName);
                        entity().Profile().ContactPerson(config.userName);
                        entity().ProfilePictureUrl("/assets/admin/pages/img/avatars/user_default.png");
                        entity().Profile().ContactInformation().Email(config.profile.Email);
                        entity().Profile().Address().Country("MY");
                        entity().PickupAddress().Address().Country("MY");
                        var data = ko.mapping.toJSON(entity);
                        context.post(data, "/api/user-details/").done(function (result) {
                            entity().Id(result.id);
                        });
                    } else {
                        entity(new bespoke.Ost_userDetail.domain.UserDetail(userDetailList._results[0]));
                    }
                }).always(function () {
                    context.get("/api/countries/available-country?size=300").done(function (cList) {
                        availableCountriesCount = cList._count;
                        availableCountries(cList._results);
                    });
                    var urlApi = "/api/consigment-requests/paid/";
                    if (config.profile.Designation == "Contract customer") {
                        urlApi = "/api/consigment-requests/pickedup/";
                    }
                    return $.ajax({
                        url: urlApi,
                        method: "GET",
                        cache: false
                    }).done(function (crList) {
                        console.log(crList._results);
                        consignmentRequestsHistory(crList._results);
                    });
                });
            },
            launchUserDetailProfileDialog = function () {
                $("#user-detail-profile-dialog").modal("show");
            },
            launchUserDetailBillingAddressDialog = function () {
                $("#user-detail-billing-address-dialog").modal("show");
            },
            launchUserDetailPickupAddressDialog = function () {
                $("#user-detail-pickup-address-dialog").modal("show");
            },
            saveUserDetailProfile = function () {
                if (!$("#user-detail-profile-form").valid()) {
                    return Task.fromResult(false);
                }
                $("#user-detail-profile-dialog").modal('hide');
                saveUserDetail();
            },
            saveUserDetailBillingAddress = function () {
                if (!$("#user-detail-billing-address-form").valid()) {
                    return Task.fromResult(false);
                }
                $("#user-detail-billing-address-dialog").modal('hide');
                saveUserDetail();
            },
            saveUserDetailPickupAddress = function () {
                if (entity().PickupAddress().Address().Country() != "MY") {
                    return app.showMessage("Pickup must be done only in Malaysia.", "OST", ["Close"]).done(function () {
                        entity().PickupAddress().Address().Country("MY");
                    });
                }
                if (!$("#user-detail-pickup-address-form").valid()) {
                    return Task.fromResult(false);
                }
                $("#user-detail-pickup-address-dialog").modal('hide');
                saveUserDetail();
            },
            closeUserDetailProfile = function () {
                $("#user-detail-profile-dialog").modal('hide');
            },
            closeUserDetailBillingAddress = function () {
                $("#user-detail-billing-address-dialog").modal('hide');
            },
            closeUserDetailPickupAddress = function () {
                $("#user-detail-pickup-address-dialog").modal('hide');
            },
            copyUserDetailProfileBillingAddress = function () {
                copyUserDetail(entity().Profile, entity().BillingAddress);
            },
            copyUserDetailProfilePickupAddress = function () {
                copyUserDetail(entity().Profile, entity().PickupAddress);
            },
            copyUserDetail = function (from, to) {
                to().CompanyName(from().CompanyName());
                to().ContactPerson(from().ContactPerson());
                to().ContactInformation().Email(from().ContactInformation().Email());
                to().ContactInformation().ContactNumber(from().ContactInformation().ContactNumber());
                to().ContactInformation().AlternativeContactNumber(from().ContactInformation().AlternativeContactNumber());
                to().Address().Address1(from().Address().Address1());
                to().Address().Address2(from().Address().Address2());
                to().Address().Address3(from().Address().Address3());
                to().Address().Address4(from().Address().Address4());
                to().Address().City(from().Address().City());
                to().Address().State(from().Address().State());
                to().Address().Country(from().Address().Country());
                to().Address().Postcode(from().Address().Postcode());
            },
            saveUserDetail = function () {
                var data = ko.mapping.toJSON(entity);
                context.put(data, "/api/user-details/" + ko.unwrap(entity().Id) + "").fail(function (response) {
                    var result = response.responseJSON;
                    errors.removeAll();
                    if (response.status === 428) {
                        logger.error(result.message);
                    }
                    if (response.status === 422 && _(result.rules).isArray()) {
                        _(result.rules).each(function (v) {
                            errors(v.ValidationErrors);
                        });
                    }
                    logger.error("There are errors in your entity, !!!");
                }).then(function (result) {
                    if (result.success) {
                        return app.showMessage("User Contact details have been successfully saved.", "OST", ["Close"]).done(function () {
                            if (entity().Profile().Address().Address3() == "") {
                                entity().Profile().Address().Address3(null);
                            }
                            if (entity().Profile().Address().Address4() == "") {
                                entity().Profile().Address().Address4(null);
                            }
                            if (entity().Profile().ContactInformation().AlternativeContactNumber() == "") {
                                entity().Profile().ContactInformation().AlternativeContactNumber(null);
                            }

                            if (entity().BillingAddress().Address().Address3() == "") {
                                entity().BillingAddress().Address().Address3(null);
                            }
                            if (entity().BillingAddress().Address().Address4() == "") {
                                entity().BillingAddress().Address().Address4(null);
                            }
                            if (entity().BillingAddress().ContactInformation().AlternativeContactNumber() == "") {
                                entity().BillingAddress().ContactInformation().AlternativeContactNumber(null);
                            }

                            if (entity().PickupAddress().Address().Address3() == "") {
                                entity().PickupAddress().Address().Address3(null);
                            }
                            if (entity().PickupAddress().Address().Address4() == "") {
                                entity().PickupAddress().Address().Address4(null);
                            }
                            if (entity().PickupAddress().ContactInformation().AlternativeContactNumber() == "") {
                                entity().PickupAddress().ContactInformation().AlternativeContactNumber(null);
                            }
                        });
                    }
                });
            },
            attached = function (view) {
                if (typeof partial.attached === "function") {
                    partial.attached(view);
                }
                $("#user-detail-profile-form").validate({
                    rules: {
                    },
                    messages: {
                    }
                });
                $("#user-detail-billing-address-form").validate({
                    rules: {
                    },
                    messages: {
                    }
                });
                $("#user-detail-pickup-address-form").validate({
                    rules: {
                    },
                    messages: {
                    }
                });
            },
            optionsAfterRenderCountryCount = 0,
            optionsAfterRenderCountry = function () {
                optionsAfterRenderCountryCount++;
                if (optionsAfterRenderCountryCount >= availableCountriesCount) {
                    if (ko.unwrap(entity().Profile().Address().Country) === undefined) {
                        entity().Profile().Address().Country("MY");
                    }
                    if (ko.unwrap(entity().BillingAddress().Address().Country) === undefined) {
                        entity().BillingAddress().Address().Country("MY");
                    }
                    if (ko.unwrap(entity().PickupAddress().Address().Country) === undefined) {
                        entity().PickupAddress().Address().Country("MY");
                    }
                }
            },
            compositionComplete = function () {
                crShippingCart(crCart.consignmentRequest());
            };

        var vm = {
            errors: errors,
            entity: entity,
            config: config,
            isBusy: isBusy,
            map: map,
            query: query,
            list: list,
            partial: partial,
            launchUserDetailProfileDialog: launchUserDetailProfileDialog,
            launchUserDetailBillingAddressDialog: launchUserDetailBillingAddressDialog,
            launchUserDetailPickupAddressDialog: launchUserDetailPickupAddressDialog,
            saveUserDetailProfile: saveUserDetailProfile,
            saveUserDetailBillingAddress: saveUserDetailBillingAddress,
            saveUserDetailPickupAddress: saveUserDetailPickupAddress,
            closeUserDetailProfile: closeUserDetailProfile,
            closeUserDetailBillingAddress: closeUserDetailBillingAddress,
            closeUserDetailPickupAddress: closeUserDetailPickupAddress,
            copyUserDetailProfileBillingAddress: copyUserDetailProfileBillingAddress,
            copyUserDetailProfilePickupAddress: copyUserDetailProfilePickupAddress,
            availableCountries: availableCountries,
            optionsAfterRenderCountry: optionsAfterRenderCountry,
            crShippingCart: crShippingCart,
            consignmentRequestsHistory: consignmentRequestsHistory,
            activate: activate,
            attached: attached,
            compositionComplete: compositionComplete,
        };
        return vm;
    });