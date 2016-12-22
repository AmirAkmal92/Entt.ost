define([objectbuilders.datacontext, objectbuilders.logger, objectbuilders.router,
objectbuilders.system, objectbuilders.validation, objectbuilders.eximp,
objectbuilders.dialog, objectbuilders.watcher, objectbuilders.config,
objectbuilders.app],

function (context, logger, router, system, validation, eximp, dialog, watcher, config, app) {

    var receivers = ko.observable(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid())),
        list = ko.observableArray(),
        errors = ko.observableArray(),
        form = ko.observable(new bespoke.sph.domain.EntityForm()),
        watching = ko.observable(false),
        id = ko.observable(),
        i18n = null,
        activate = function () {

        },
        attached = function (view) {

        },
        addNew = function () {
            require(['viewmodels/bulk.receiver.dialog', 'durandal/app'], function (dialog, app2) {
                app2.showDialog(dialog)
                    .done(function (result) {
                        if (result === "OK") {
                            list.push(dialog.receiver());
                        }
                    });

            });
            return Task.fromResult(0);
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
        activate: activate,
        attached: attached,
        list: list,
        addNew: addNew,
        config: config,
        compositionComplete: compositionComplete,
        receivers: receivers
    };

    return vm;
});