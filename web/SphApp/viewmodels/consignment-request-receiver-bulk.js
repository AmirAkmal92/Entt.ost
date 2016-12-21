define([objectbuilders.datacontext, objectbuilders.logger, objectbuilders.router,
objectbuilders.system, objectbuilders.validation, objectbuilders.eximp,
objectbuilders.dialog, objectbuilders.watcher, objectbuilders.config,
objectbuilders.app],

function (context, logger, router, system, validation, eximp, dialog, watcher, config, app) {

    var entity = ko.observable(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid())),
        list = ko.observableArray(),
        partial = partial || {},
        errors = ko.observableArray(),
        form = ko.observable(new bespoke.sph.domain.EntityForm()),
        watching = ko.observable(false),
        id = ko.observable(),
        i18n = null,
        addNew = function () {
            require(['viewmodels/bulk.receiver.dialog', 'durandal/app'], function (dialog, app2) {
                //dialog.bulk({
                //    "role": ko.observable(),
                //    "groupName": ko.observable(),
                //    "route": ko.observable(),
                //    "moduleId": ko.observable(),
                //    "title": ko.observable(),
                //    "nav": ko.observable(),
                //    "icon": ko.observable(),
                //    "caption": ko.observable(),
                //    "settings": ko.observable(),
                //    "showWhenLoggedIn": ko.observable(),
                //    "isAdminPage": ko.observable(),
                //    "startPageRoute": ko.observable()
                //});
                app2.showDialog(dialog)
                    .done(function (result) {
                        if (result === "OK") {
                            context.post(ko.toJSON(dialog.bulk), "i18n/" + config.lang + "/consignment-request-receiver-bulk")
                            .done(function () {
                                list.push(dialog.bulk());
                            });
                        }
                    });

            });
            return Task.fromResult(0);
        },
        attached = function (view) {
            // validation
            validation.init($('#consignment-request-receiver-bulk-form'), form());

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
        };
    var vm = {
        list: list,
        partial: partial,
        addNew: addNew,
        config: config,
        attached: attached,
        compositionComplete: compositionComplete,
        entity: entity,
    };

    return vm;
});