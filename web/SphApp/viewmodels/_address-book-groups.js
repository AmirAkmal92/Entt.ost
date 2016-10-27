

define(['services/datacontext', 'services/logger', 'plugins/router'],
    function (context, logger, router) {

        var isBusy = ko.observable(false),
            contactsCount = ko.observable(".."),
            groups = ko.observableArray(),
            activate = function () {
                context.get("/api/address-books/?page=1&size=0").done(function(result){
                    contactsCount(result._count);
                });
                return context.get("/address-books/group-options?count=true").done(groups);
            },
            attached = function (view) {

            };

        var vm = {
            groups: groups,
            contactsCount :contactsCount,
            isBusy: isBusy,
            activate: activate,
            attached: attached
        };

        return vm;

    });
