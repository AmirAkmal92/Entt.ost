// PLEASE WAIT WHILE YOUR SCRIPT IS LOADING
define([objectbuilders.datacontext, objectbuilders.app, "plugins/router", "services/logger", "viewmodels/_address-book-groups", "services/app", "plugins/dialog"],
function (context, app, router, logger, contactGroups, app2, dialog) {
    var groupName = ko.observable(),
        selectedAddresses = ko.observableArray([]),
        //checkAll = ko.observable(false),
        removeAddresses = function () {
            var tcs = $.Deferred();
            app.showMessage(`Are you sure you want to remove ${selectedAddresses().length} address(es), this action cannot be undone`, "OST", ["Yes", "No"])
                .done(function (dialogResult) {
                    if (dialogResult === "Yes") {
                        var tasks = selectedAddresses()
                            .map(v => context.sendDelete(`/api/address-books/${ko.unwrap(v.Id)}`));
                        $.when(tasks)
                            .done(function (result) {
                                logger.info("Selected addresses has been successfully removed");
                                selectedAddresses().forEach(v => rootList.remove(v));
                                selectedAddresses.removeAll();
                                contactGroups.activate();
                                tcs.resolve(true);
                            });
                    } else {
                        tcs.resolve(false);
                    }
                });
            return tcs.promise();
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
                                app.showMessage("Contacts successfuly imported from file.", "Ost", ["OK"]).done(function () {
                                    contactGroups.activate();
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
        renameGroup = function () {
            var newGroupName = "-";
            var isCancel = true;
            app2.prompt.delimiter = false;
            return app2.prompt("Rename Group", ko.unwrap(groupName))
                .then(function (result) {
                    if (result) {
                        newGroupName = result;
                        isCancel = false;
                        return context.put("{}", "/address-books/groups/" + ko.unwrap(groupName) + "/" + result);
                    }
                    return Task.fromResult({});
                }).then(function (result) {
                    if (result.message) {
                        logger.info(result.message);
                        return contactGroups.activate();
                    }
                    return Task.fromResult({});
                }).then(function () {
                    if (!isCancel) {
                        return router.navigate("address-book-home/" + newGroupName);
                    }
                });
        },
        rootList = null,
        activate = function (list, grpName) {
             rootList = list;
             groupName(grpName);
             var tcs = new $.Deferred();
             setTimeout(function () {
                 tcs.resolve(true);
             }, 500);

             contactGroups.activate();// pretty good channce when user comes here, he updated something
             return tcs.promise();
        },
        attached = function (view) {
             rootList.subscribe(function () {
                 $("a.contact-item").draggable({
                     helper: "clone",
                     start: function (e, ui) {
                         $(ui.helper).css({ "background-color": "gray", "padding": "5px", "color": "black" });
                     }
                 });
             }, "arrayChange", null);

             var makeGroupDroppable = function () {
                 $("li.address-book-group").droppable({
                     accept: "a.contact-item",
                     hoverClass: "drop-contact",
                     drop: function (event, ui) {

                         var group = ko.dataFor(this).group,
                             id = ui.draggable.data("id");
                         return context.post("{}", "/address-books/groups/" + ko.unwrap(group) + "/" + id)
                             .then(function (result) {
                                 logger.info(result.message);
                                 return contactGroups.activate();
                             }).then(function () {
                                 var contact = _(ko.unwrap(rootList)).find(function (v) {
                                     return ko.unwrap(v.Id) === id;
                                 });
                                 if (contact) {
                                     contact.Groups.push(ko.unwrap(group));
                                 }
                                 makeGroupDroppable();
                             });
                     }
                 });
             };
             setTimeout(makeGroupDroppable, 1500);
             contactGroups.groups.subscribe(function () { setTimeout(makeGroupDroppable, 500); }, "arrayChange", null);
        },
        addContact = function () {
             return router.navigate("address-book-details/0");
        },
        //toggleCheckAll = function () {
        //    $("input[name^='check-contact-']").click();
        //    checkAll(!checkAll());
        //},
        map = function (v) {
             v.Groups = ko.observableArray(v.Groups);
             return v;
        };

    return {
        selectedAddresses: selectedAddresses,
        removeAddresses: removeAddresses,
        addContact: addContact,
        //checkAll: checkAll,
        //toggleCheckAll: toggleCheckAll,
        renameGroup: renameGroup,
        importContacts: importContacts,
        exportToCsv: exportToCsv,
        map: map,
        groupName: groupName,
        commands: ko.observableArray([]),
        activate: activate,
        attached: attached,
    };
});
