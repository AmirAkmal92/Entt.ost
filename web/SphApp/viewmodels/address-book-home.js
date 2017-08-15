define(["services/datacontext", "services/logger", "plugins/router", "services/chart", objectbuilders.config, objectbuilders.app,
    "services/_ko.list", "partial/address-book-home", "viewmodels/_address-book-groups", "services/app", "plugins/dialog"],
function (context, logger, router, chart, config, app, koList, partial, contactGroups, app2, dialog) {

    var isBusy = ko.observable(false),
        query = ko.observable("/api/address-books/"),
        commands = ko.observableArray([]),
        partial = partial || {},
        list = ko.observableArray([]),
        map = function (v) {
            if (typeof partial.map === "function") {
                return partial.map(v);
            }
            return v;
        },
        activate = function (group) {

            query("/api/address-books/?q=Groups:\"" + group + "\"");
            if (group === "-") {
                query("/api/address-books/");
            }
            if (typeof partial.activate === "function") {

                return partial.activate(list, group);
            }
            contactGroups.activate();

            return true;
        },
        importContacts = function () {
            var tcs = new $.Deferred();
            require(['viewmodels/import.contacts.dialog', 'durandal/app'], function (dialog, app2) {
                app2.showDialog(dialog)
                    .done(function (result) {
                        tcs.resolve(result);
                        if (!result) return;
                        if (result === "OK") {
                            var storeId = ko.unwrap(dialog.item().storeId);
                            context.post("{}", "address-books/import-contacts/" + storeId).done(function (result) {
                                console.log(result);
                                var dialogMessage = "File successfully imported.";
                                dialogMessage += " " + result.status;
                                if (!result.success) {
                                    dialogMessage = "File unsuccessfully imported.";
                                    dialogMessage += " " + result.status;
                                }
                                app.showMessage(dialogMessage, "OST", ["Close"]).done(function () {
                                    if (result.success) {
                                        window.location.reload(true);
                                    }
                                });
                            });
                        }
                    });
            });
            return tcs.promise();
        },
        exportToCsv = function () {
            var tcs = new $.Deferred();
            require(['viewmodels/export.addresses.dialog', 'durandal/app'], function (dialog, app2) {
                app2.showDialog(dialog)
                    .done(function (result) {
                        tcs.resolve(result);
                        if (!result) return;
                        if (result === "OK") {
                            context.get("address-books/export-contacts").done(function (result) {
                                console.log(result);
                                if (result.success) {
                                    var fileName = "Addressbook";
                                    window.open("/print-excel/file-path/" + result.path + "/file-name/" + fileName);
                                }   
                            });
                        }
                    });
            });
            return tcs.promise();
        },
        attached = function (view) {
            if (typeof partial.attached === "function") {
                partial.attached(view);
            }

        };

    if (_(ko.unwrap(partial.commands)).isArray()) {
        _(ko.unwrap(partial.commands)).each(function (v) {
            commands.push(v);
        });
    }

    var vm = {
        query: query,
        config: config,
        isBusy: isBusy,
        map: map,
        activate: activate,
        importContacts: importContacts,
        exportToCsv: exportToCsv,
        attached: attached,
        list: list,
        partial: partial,
        toolbar: {
            commands: ko.observableArray([])
        },
    };

    return vm;

});