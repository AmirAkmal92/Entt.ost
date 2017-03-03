define(["services/datacontext", "services/logger", "plugins/router", objectbuilders.config, objectbuilders.app, objectbuilders.system],

function (context, logger, router, config, app, system) {
    var isBusy = ko.observable(false),
        errors = ko.observableArray(),
        entity = ko.observable(),
        availableCountries = ko.observableArray(),
        activate = function () {
            //context.get("/api/address-books/user-profile")
            return $.ajax({
                url: "/api/address-books/user-profile",
                method: "GET",
                cache: false
            }).done(function (uList) {
                console.log(uList);
                if (uList._count == 0) {
                    var guid = system.guid();
                    entity(new bespoke.Ost_addressBook.domain.AddressBook(guid));
                    entity().Id(guid);
                    entity().ReferenceNo(config.profile.Email);
                    entity().UserId(config.userName);
                    entity().ContactPerson(config.userName);
                    entity().ProfilePictureUrl("/assets/images/user_default.png");
                    entity().ContactInformation().Email(config.profile.Email);
                    entity().Address().Country("MY");
                    var data = ko.mapping.toJSON(entity);
                    context.post(data, "/api/address-books/").done(function (result) {
                        entity().Id(result.id);
                    });
                } else {
                    entity(new bespoke.Ost_addressBook.domain.AddressBook(uList._results[0]));
                }
            }).always(function () {
                var setToMY = false;
                if (ko.unwrap(entity().Address.Country) === undefined) {
                    setToMY = true;
                }
                context.get("/api/countries/available-country?size=300").done(function (cList) {
                    availableCountries(cList._results);
                    if (setToMY) {
                        entity().Address().Country("MY");
                    }
                });
            });
        },
        saveProfile = function () {
            if (!$("#customer-home-form").valid()) {
                return Task.fromResult(false);
            }

            var data = ko.mapping.toJSON(entity);
            context.put(data, "/api/address-books/" + ko.unwrap(entity().Id) + "").fail(function (response) {
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
                    return app.showMessage("User Profile has been successfully saved.", "OST", ["OK"]).done(function () {
                        //router.activeItem().activate();
                        router.navigate("address-book-home/-");
                    });
                }
            });
        },
        attached = function (view) {
            $("#customer-home-form").validate({
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
        saveProfile: saveProfile,
        availableCountries: availableCountries,
        activate: activate,
        attached: attached,
    };
    return vm;
});