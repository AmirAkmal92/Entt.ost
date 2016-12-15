define(["services/datacontext", "services/logger", "plugins/router", objectbuilders.system, objectbuilders.validation, objectbuilders.eximp,
objectbuilders.dialog, objectbuilders.watcher, "services/chart", objectbuilders.config, objectbuilders.app, "services/_ko.list", "partial/bulk-upload"],

function (context, logger, router, system, validation, eximp, dialog, watcher, chart, config, app, koList, partial) {

    var entity = ko.observable(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid())),
        isBusy = ko.observable(false),
        query = ko.observable("/api/bulk-upload/"),
        commands = ko.observableArray([]),
        partial = partial || {},
        list = ko.observableArray([]),
        map = function (v) {
            if (typeof partial.map === "function") {
                return partial.map(v);
            }
            return v;
        },
        activate = function () {
            if (typeof partial.activate === "function") {
                return partial.activate(list);
            }
            return true;
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
        attached: attached,
        list: list,
        partial: partial,
        entity: entity,
        toolbar: {
            commands: commands
        }
    };

    return vm;

});