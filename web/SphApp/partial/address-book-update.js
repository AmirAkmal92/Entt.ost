

define([objectbuilders.datacontext], function (context) {
    var addressBook = null,
        groupOptions = ko.observableArray(),
        activate = function (entity) {
            addressBook = entity;

            return context.get("/address-books/group-options")
            .then(groupOptions);


        },
        attached = function (view) {
            var groupsSelect = $(view).find("#groupsSelect");
            groupsSelect.select2({tags: true})
             .val(addressBook.Groups())
             .change(function () {
                addressBook.Groups(groupsSelect.val());
              });
        };

    return {
        groupOptions: groupOptions,
        activate: activate,
        attached: attached
    };

});