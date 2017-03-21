define(['services/datacontext', 'services/logger', 'plugins/router', objectbuilders.app],
    function (context, logger, router, app) {

        var isBusy = ko.observable(false),
            groupName = ko.observable(""),
            contactsCount = ko.observable(".."),
            groups = ko.observableArray(),
            activate = function () {
                //context.get("/api/address-books/?page=1&size=0")
                $.ajax({
                    url: "/api/address-books/?page=1&size=0",
                    method: "GET",
                    cache: false
                }).done(function (result) {
                    contactsCount(result._count);
                });
                //return context.get("/address-books/group-options?count=true").done(groups);
                return $.ajax({
                    url: "/address-books/group-options?count=true",
                    method: "GET",
                    cache: false
                }).done(groups);
            },
            attached = function (view) {

            },
            addGroup = function () {
                if (groupName() == "") {
                    return app.showMessage("Group name cannot be empty.", "Ost", ["OK"]);
                }
                groups.push({ group: ko.observable(groupName()), count: ko.observable(0) });
                groupName("");
            };

        var vm = {
            groups: groups,
            addGroup: addGroup,
            groupName: groupName,
            contactsCount: contactsCount,
            isBusy: isBusy,
            activate: activate,
            attached: attached
        };

        return vm;

    });
