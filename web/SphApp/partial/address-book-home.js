define([objectbuilders.datacontext, objectbuilders.app, "plugins/router", "services/logger", "viewmodels/_address-book-groups", "services/app", "plugins/dialog"],
function (context, app, router, logger, contactGroups, app2, dialog) {
    var groupName = ko.observable(),
        selectedAddresses = ko.observableArray([]),
        checkAll = ko.observable(false),
        removeAddresses = function () {
            var tcs = $.Deferred();
            app.showMessage(`Are you sure you want to remove ${selectedAddresses().length} contact(s)? This action cannot be undone.`, "OST", ["Yes", "No"])
                .done(function (dialogResult) {
                    if (dialogResult === "Yes") {
                        var tasks = selectedAddresses()
                            .map(v => context.sendDelete(`/api/address-books/${ko.unwrap(v.Id)}`));
                        $.when(tasks)
                            .done(function (result) {
                                logger.info("Selected addresses has been successfully removed");
                                selectedAddresses().forEach(v => rootList.remove(v));
                                selectedAddresses.removeAll();
                                //contactGroups.activate();
                                tcs.resolve(true);
                                window.location.reload(true);
                            });
                    } else {
                        tcs.resolve(false);
                    }
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
        toggleCheckAll = function () {
            $("input[name^='check-contact-']").each(function () {
                if (!checkAll()) {
                    if (!$(this).is(":checked")) {
                        $(this).click();
                    }
                } else {
                    if ($(this).is(":checked")) {
                        $(this).click();
                    }
                }
            });
            checkAll(!checkAll());
        },
        map = function (v) {
             v.Groups = ko.observableArray(v.Groups);
             return v;
        };

    return {
        selectedAddresses: selectedAddresses,
        removeAddresses: removeAddresses,
        addContact: addContact,
        checkAll: checkAll,
        toggleCheckAll: toggleCheckAll,
        renameGroup: renameGroup,
        map: map,
        groupName: groupName,
        commands: ko.observableArray([]),
        activate: activate,
        attached: attached,
    };
});
