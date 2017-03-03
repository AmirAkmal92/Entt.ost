define(["plugins/dialog", "services/datacontext"],
    function (dialog, context) {
        var item = ko.observableArray([]),
            conNote = ko.observable(),
            activate = function () {
                trackConNote();
            },
            attached = function (view) {

            },
            deactivate = function () {
                item.removeAll()
            },
            trackConNote = function () {
                $.getJSON("/api/track-traces/" + ko.unwrap(conNote)).done(item);
            },
            okClick = function (data, ev) {
                dialog.close(this, "OK");
            },
            cancelClick = function () {
                dialog.close(this, "Cancel");
            };
        var vm = {
            activate: activate,
            attached: attached,
            deactivate: deactivate,
            item: item,
            conNote: conNote,
            trackConNote: trackConNote,
            okClick: okClick,
            cancelClick: cancelClick
        };
        return vm;
    });