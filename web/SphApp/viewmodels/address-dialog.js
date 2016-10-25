define(["plugins/dialog", objectbuilders.datacontext, objectbuilders.system],

function(dialog, context, system) {

    var item = ko.observable(new bespoke.Ost_addressBook.domain.AddressBook(system.guid())),
        errors = ko.observableArray(),
        activate = function() {
            // activation, you can also return a promise
            return true;
        },

        okClick = function() {
            dialog.close(this, "OK");
        },

        cancelClick = function() {
            dialog.close(this, "Cancel");
        },

        attached = function(view) {
            // DOM manipulation
        };

    var vm = {
        okClick: okClick,
        cancelClick: cancelClick,
        activate: activate,
        attached: attached,
        item: item,
        errors: errors
    };

    return vm;
});