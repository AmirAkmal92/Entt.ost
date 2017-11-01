define(["services/datacontext", "services/logger", "plugins/router", objectbuilders.system, objectbuilders.app],
    function (context, logger, router, system, app) {
        var item,
            activate = function (id) {
                return true;
            },
            attached = function (view) {
            },
            compositionComplete = function () {
                $('#developers-log-panel-collapse').click();
            };
        return {
            activate: activate,
            attached: attached,
            compositionComplete: compositionComplete
        };
    });