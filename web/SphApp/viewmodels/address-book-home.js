define(["services/datacontext", "services/logger", "plugins/router", "services/chart", objectbuilders.config, "services/_ko.list", "partial/address-book-home"],

function(context, logger, router, chart, config, koList, partial) {

    var isBusy = ko.observable(false),
        query = ko.observable("/api/address-books/"),
        commands = ko.observableArray([]),
        partial = partial || {},
        list = ko.observableArray([]),
        map = function(v) {
            if (typeof partial.map === "function") {
                return partial.map(v);
            }
            return v;
        },
        activate = function(group) {

            query("/api/address-books/?q=Groups:\"" + group + "\"");
            if(group === "-"){
                query("/api/address-books/");
            }
            if (typeof partial.activate === "function") {
                
                return partial.activate(list, group);
            }

            return true;
        },
        attached = function(view) {
            if (typeof partial.attached === "function") {
                partial.attached(view);
            }

        };

        if(_(ko.unwrap(partial.commands)).isArray()){
            _(ko.unwrap(partial.commands)).each(function(v){
                commands.push(v);
            });
        }

    var vm = {
        query: query,
        config: config,
        isBusy: isBusy,
        map: map,
        activate: activate,
        attached: attached,
        list: list,
        partial: partial,
        commands: commands
    };

    return vm;

});