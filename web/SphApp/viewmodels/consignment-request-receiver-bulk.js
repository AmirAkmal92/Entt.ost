define([objectbuilders.datacontext, objectbuilders.logger, objectbuilders.router,
objectbuilders.system, objectbuilders.validation, objectbuilders.eximp,
objectbuilders.dialog, objectbuilders.watcher, objectbuilders.config,
objectbuilders.app],

function (context, logger, router, system, validation, eximp, dialog, watcher, config, app) {

    var receivers = ko.observable(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid())),
        entity = ko.observable(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid())),
        list = ko.observableArray(),
        errors = ko.observableArray(),
        form = ko.observable(new bespoke.sph.domain.EntityForm()),
        watching = ko.observable(false),
        id = ko.observable(),
        i18n = null,
        headers = {},
        activate = function () {

        },
        attached = function (view) {

        },
        addReceiversCommand = function() {
            var data = ko.mapping.toJSON(receivers),
                tcs = new $.Deferred();

            context.put(data, "/api/consigment-requests/" + ko.unwrap(entity().Id) + "/actions/add-receivers", headers)
                .fail(function(response) {
                var result = response.responseJSON;
                errors.removeAll();
                if (response.status === 428) {
                    // out of date conflict
                    logger.error(result.message);
                }
                if (response.status === 422 && _(result.rules).isArray()) {
                    _(result.rules).each(function(v) {
                        errors(v.ValidationErrors);
                    });
                }
                logger.error("There are errors in your entity, !!!");
                tcs.resolve(false);
            })
                .then(function(result) {
                logger.info(result.message);
                entity().Id(result.id);
                errors.removeAll();
                tcs.resolve(result);
            });
            return tcs.promise();
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
        }
        saveCommand = function() {
        return addReceiversCommand()
            .then(function(result) {
            if (result.success) {
                return app.showMessage("Now you can go", ["OK"]);
            } else {
                return Task.fromResult(false);
            }
        })
            .then(function(result) {
            if (result) {
                router.navigate('consignment-request-product-bulk/' + entity().Id());
            }
        });
    };
    var vm = {
        activate: activate,
        attached: attached,
        list: list,
        addNew: addNew,
        saveCommand: saveCommand,
        config: config,
        compositionComplete: compositionComplete,
        receivers: receivers
    };

    return vm;
});