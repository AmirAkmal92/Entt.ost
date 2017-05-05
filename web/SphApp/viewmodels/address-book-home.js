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
                            context.post("{}", "address-books/" + storeId).done(function (result) {
                                console.log(result);
                                app.showMessage("Contacts successfuly imported from file.", "OST", ["Close"]).done(function () {
                                    //contactGroups.activate();
                                    //$.ajax({
                                    //    url: "/api/address-books/",
                                    //    method: "GET",
                                    //    cache: false
                                    //}).then(function (lo) {
                                    //    list(lo._results);
                                    //});
                                    window.location.reload(true);
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
                            //var uri = "";
                            //for (var opt in dialog.options()) {
                            //    if (ko.isObservable(dialog.options()[opt])) {
                            //        uri += opt + "=" + ko.unwrap(dialog.options()[opt]) + "&"
                            //    }
                            //}
                            window.open("/address-books/csv");
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