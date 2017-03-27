define([objectbuilders.datacontext, objectbuilders.logger, objectbuilders.router,
    objectbuilders.config, objectbuilders.app, objectbuilders.system, "services/_ko.list"],

function (context, logger, router, config, app, system, koList) {
    var isBusy = ko.observable(false),
        errors = ko.observableArray(),
        entity = ko.observable(),
        availableCountries = ko.observableArray(),
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
                    var data = ko.mapping.toJSON(entity);
                    context.post(data, "/api/user-details/").done(function (result) {
                        entity().Id(result.id);
                    });
                } else {
                    entity(new bespoke.Ost_userDetail.domain.UserDetail(userDetailList._results[0]));
                }
            }).always(function () {
                var setToMY = false;
                if ((ko.unwrap(entity().Profile().Address().Country) === undefined)
                    || (ko.unwrap(entity().BillingAddress().Address().Country) === undefined)
                    || (ko.unwrap(entity().PickupAddress().Address().Country) === undefined)) {
                    setToMY = true;
                }
                context.get("/api/countries/available-country?size=300").done(function (cList) {
                    availableCountries(cList._results);
                    if (setToMY) {
                        entity().Profile().Address().Country("MY");
                        entity().BillingAddress().Address().Country("MY");
                        entity().PickupAddress().Address().Country("MY");
                    }
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
            if (!$("#user-detail-pickup-address-form").valid()) {
                return Task.fromResult(false);
            }
            $("#user-detail-pickup-address-dialog").modal('hide');
            saveUserDetail();
        },
        resetUserDetailProfile = function () {
            resetUserDetail(entity().Profile);
        },
        resetUserDetailBillingAddress = function () {
            resetUserDetail(entity().BillingAddress);
        },
        resetUserDetailPickupAddress = function () {
            resetUserDetail(entity().PickupAddress);
        },
        copyUserDetailProfileBillingAddress = function () {
            copyUserDetail(entity().Profile, entity().BillingAddress);
        },
        copyUserDetailProfilePickupAddress = function () {
            copyUserDetail(entity().Profile, entity().PickupAddress);
        },
        resetUserDetail = function (reset) {
            reset().CompanyName("");
            reset().ContactPerson("");
            reset().ContactInformation().Email("");
            reset().ContactInformation().ContactNumber("");
            reset().ContactInformation().AlternativeContactNumber("");
            reset().Address().Address1("");
            reset().Address().Address2("");
            reset().Address().Address3("");
            reset().Address().Address4("");
            reset().Address().City("");
            reset().Address().State("");
            reset().Address().Country("");
            reset().Address().Postcode("");
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
                    return app.showMessage("User Contacts has been successfully saved.", "OST", ["OK"]).done(function () {
                        //
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
        resetUserDetailProfile: resetUserDetailProfile,
        resetUserDetailBillingAddress: resetUserDetailBillingAddress,
        resetUserDetailPickupAddress: resetUserDetailPickupAddress,
        copyUserDetailProfileBillingAddress: copyUserDetailProfileBillingAddress,
        copyUserDetailProfilePickupAddress: copyUserDetailProfilePickupAddress,
        availableCountries: availableCountries,
        activate: activate,
        attached: attached,
    };
    return vm;
});