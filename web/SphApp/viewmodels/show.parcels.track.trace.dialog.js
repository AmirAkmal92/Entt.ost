define(["plugins/dialog", "services/datacontext"],
    function (dialog, context) {
        var item = ko.observableArray([]),
            conNotes = ko.observable(),
            activate = function () {
                trackConNotes();
            },
            attached = function (view) {

            },
            deactivate = function () {
                item.removeAll()
            },
            trackConNotes = function () {
                var tmpConNotes = conNotes().trim().split(";");                
                queryString = "";
                for (var i = 0; i < tmpConNotes.length; i++) {
                    if (i == 0) {
                        queryString = queryString.concat("?conNotes=" + tmpConNotes[i].trim());
                    } else {
                        queryString = queryString.concat("&conNotes=" + tmpConNotes[i].trim());
                    }
                }                
                $.getJSON("/api/track-traces/conNotes/" + queryString).done(item);
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
            conNotes: conNotes,
            trackConNotes: trackConNotes,
            okClick: okClick,
            cancelClick: cancelClick
        };
        return vm;
    });