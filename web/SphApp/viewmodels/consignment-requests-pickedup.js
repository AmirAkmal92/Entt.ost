define(["services/datacontext", "services/logger", "plugins/router", "services/chart", objectbuilders.config, "services/_ko.list", "partial/consignment-requests-pickedup"],

function(context, logger, router, chart, config, koList, partial) {

    var isBusy = ko.observable(false),
        query = "/api/consigment-requests/pickedup",
        partial = partial || {},
        list = ko.observableArray([]),
        map = function(v) {
            if (typeof partial.map === "function") {
                return partial.map(v);
            }
            return v;
        },
        activate = function() {
            if (typeof partial.activate === "function") {
                return partial.activate(list);
            }
            return true;
        },
        attached = function(view) {
            if (typeof partial.attached === "function") {
                partial.attached(view);
            }
        };

    var vm = {
        query: query,
        config: config,
        isBusy: isBusy,
        map: map,
        activate: activate,
        attached: attached,
        partial: partial,
        list: list
    };

    return vm;

});