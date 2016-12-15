define(['services/datacontext', 'services/logger', 'plugins/router'],
    function (context, logger, router) {

        var isBusy = ko.observable(false),
            groupName = ko.observable("Add Group"),
            contactsCount = ko.observable(".."),
            groupCount = ko.observable(".."),
            groups = ko.observableArray(),
            activate = function () {
                context.get("/api/address-books/?page=1&size=0").done(function(result){
                    contactsCount(result._count);
                });
                return context.get("/address-books/group-options?count=true").done(groups);
            },
            attached = function (view) {
                context.get("/address-books/group-options?count=true").done(function (result) {
                    groupCount(result._count);
                });

            },
            addGroup = function(){
                groups.push({ group: ko.observable(groupName()), count : ko.observable(0) });
                groupName("Add Group");
            };

        var vm = {
            groups: groups,
            addGroup : addGroup,
            groupName : groupName,
            contactsCount: contactsCount,
            groupCount: groupCount,
            isBusy: isBusy,
            activate: activate,
            attached: attached
        };

        return vm;

    });
