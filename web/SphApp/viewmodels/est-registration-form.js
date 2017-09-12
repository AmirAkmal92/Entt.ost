define([objectbuilders.datacontext, objectbuilders.logger, objectbuilders.router,
objectbuilders.system, objectbuilders.validation, objectbuilders.eximp,
objectbuilders.dialog, objectbuilders.watcher, objectbuilders.config,
objectbuilders.app, 'partial/est-registration-form'],

    function (context, logger, router, system, validation, eximp, dialog, watcher, config, app, partial) {

        var entity = ko.observable(new bespoke.Ost_estRegistration.domain.EstRegistration(system.guid())),
            errors = ko.observableArray(),
            form = ko.observable(new bespoke.sph.domain.EntityForm()),
            companyOptions = [
                { text: 'Berhad', value: 'Berhad' },
                { text: 'Sendirian Berhad', value: 'SendirianBerhad' },
                { text: 'Enterprise (Perseorangan)', value: 'EnterprisePerseorangan' },
                { text: 'Enterprise (Perkongsian)', value: 'EnterprisePerkongsian' },
                { text: 'Kerajaan / Badan Berkanun', value: 'KerajaanBadanBerkanun' }
            ],
            industryOptions = [
                { "Name": " Insuran", "Code": "C06" },
                { "Name": "Communication and Media", "Code": "B14" },
                { "Name": "Construction", "Code": "B08" },
                { "Name": "Consulting", "Code": "B10" },
                { "Name": "DRB Group", "Code": "B16" },
                { "Name": "Financial", "Code": "B04" },
                { "Name": "Government", "Code": "B05" },
                { "Name": "Hartanah", "Code": "C11" },
                { "Name": "Health", "Code": "B09" },
                { "Name": "Insurance", "Code": "B06" },
                { "Name": "Kesihatan/Perubatan", "Code": "C09" },
                { "Name": "Kewangan", "Code": "C04" },
                { "Name": "Komunikasi Media", "Code": "C14" },
                { "Name": "Lain-lain Industri", "Code": "C15" },
                { "Name": "Manufacturing", "Code": "B13" },
                { "Name": "Others", "Code": "B15" },
                { "Name": "Pembinaan", "Code": "C08" },
                { "Name": "Pemborong/pengedar", "Code": "C03" },
                { "Name": "Pembuatan", "Code": "C01" },
                { "Name": "Pengangkutan", "Code": "C12" },
                { "Name": "Perkhidmatan", "Code": "C07" },
                { "Name": "Perkilangan", "Code": "C13" },
                { "Name": "Perundingan", "Code": "C10" },
                { "Name": "Poslaju Agent", "Code": "C16" },
                { "Name": "Production", "Code": "B01" },
                { "Name": "Real Estate", "Code": "B11" },
                { "Name": "Retail", "Code": "B02" },
                { "Name": "Runcit", "Code": "C02" },
                { "Name": "Sektor Kerajaan", "Code": "C05" },
                { "Name": "Services", "Code": "B07" },
                { "Name": "Transportation", "Code": "B12" },
                { "Name": "Wholesale", "Code": "B03" }
            ],
            isUsingMailAddress = ko.observable(false),
            watching = ko.observable(false),
            id = ko.observable(),
            sid = ko.observable(),
            partial = partial || {},
            i18n = null,
            headers = {},

            activate = function (entityId, sId) {
                id(entityId);
                sid(sId);
                var tcs = new $.Deferred();
                context.loadOneAsync("EntityForm", "Route eq 'est-registration-details'")
                    .then(function (f) {
                        form(f);
                        return watcher.getIsWatchingAsync("EstRegistration", entityId);
                    })
                    .then(function (w) {
                        watching(w);
                        return $.getJSON("i18n/" + config.lang + "/est-registration-details");
                    })
                    .then(function (n) {
                        i18n = n[0];
                        if (!entityId || entityId === "0") {
                            return Task.fromResult({
                                WebId: system.guid()
                            });
                        }
                        return context.get("/api/est-registrations/" + entityId);
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
                        entity(new bespoke.Ost_estRegistration.domain.EstRegistration(b[0] || b));
                    }, function (e) {
                        if (e.status == 404) {
                            app.showMessage("Sorry, but we cannot find any EstRegistration with location : " + "/api/est-registrations/" + entityId, "Pos Laju EziSend", ["OK"]);
                        }
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

            defaultCommand = function () {

                if (!validation.valid()) {
                    return Task.fromResult(false);
                }
                entity().PersonalDetail().PickupAddress().Postcode(entity().PersonalDetail().MailingAddress().Postcode()); //TODO: snbapi error pickup postcode is compulsory
                var data = ko.mapping.toJSON(entity),
                    tcs = new $.Deferred();

                context.put(data, "/api/est-registrations/" + ko.unwrap(entity().Id) + "", headers)
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

            toggleIsUsingMailingAddress = function () {
                isUsingMailAddress(!isUsingMailAddress());
                if (isUsingMailAddress()) {
                    copyMailingAddress(entity);
                } else {
                    resetBillingAddress(entity);
                }
            },

            copyMailingAddress = function (entity) {
                entity().PersonalDetail().BillingAddress().Address1(entity().PersonalDetail().MailingAddress().Address1());
                entity().PersonalDetail().BillingAddress().Address2(entity().PersonalDetail().MailingAddress().Address2());
                entity().PersonalDetail().BillingAddress().Address3(entity().PersonalDetail().MailingAddress().Address3());
                entity().PersonalDetail().BillingAddress().Address4(entity().PersonalDetail().MailingAddress().Address4());
                entity().PersonalDetail().BillingAddress().Postcode(entity().PersonalDetail().MailingAddress().Postcode());
                entity().PersonalDetail().BillingAddress().City(entity().PersonalDetail().MailingAddress().City());
                entity().PersonalDetail().BillingAddress().State(entity().PersonalDetail().MailingAddress().State());
            },

            resetBillingAddress = function (entity) {
                entity().PersonalDetail().BillingAddress().Address1(null);
                entity().PersonalDetail().BillingAddress().Address2(null);
                entity().PersonalDetail().BillingAddress().Address3(null);
                entity().PersonalDetail().BillingAddress().Address4(null);
                entity().PersonalDetail().BillingAddress().Postcode(null);
                entity().PersonalDetail().BillingAddress().City(null);
                entity().PersonalDetail().BillingAddress().State(null);
            },

            attached = function (view) {
                // validation
                validation.init($('#est-registration-details-form'), form());

                if (typeof partial.attached === "function") {
                    partial.attached(view);
                }

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

            saveCommand = function () {
                return defaultCommand()
                    .then(function (result) {
                        if (result.success) {
                            context.put("{}", "/consignment-request/save-setting-est/" + sid()).fail(function (response) {
                                console.log("Cannot find setting configuration with Id : " + sid());
                            }).always(function () {
                                return app.showMessage("Your application for Ezisend Contract Customer will be review and process. You will be notify immediately once your application was successful.", "Pos Laju EziSend", ["OK"]).done(function () {
                                    window.location.href = "/ost-account/logout";
                                });
                            });
                        }
                        else {
                            return Task.fromResult(false);
                        }
                    });
            };
        var vm = {
            partial: partial,
            activate: activate,
            config: config,
            attached: attached,
            isUsingMailAddress: isUsingMailAddress,
            toggleIsUsingMailingAddress: toggleIsUsingMailingAddress,
            compositionComplete: compositionComplete,
            entity: entity,
            errors: errors,
            companyOptions: companyOptions,
            industryOptions: industryOptions,
            saveCommand: saveCommand
        };

        return vm;
    });