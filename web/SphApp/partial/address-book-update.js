

define([objectbuilders.datacontext], function (context) {
    var addressBook = null,
        groupOptions = ko.observableArray(),
        activate = function (entity) {
            addressBook = entity;

            return context.get("/address-books/group-options")
            .then(groupOptions);


        },
        attached = function (view) {
            setTimeout(function(){
                var groupsSelect = $(view).find("#groupsSelect");
                groupsSelect.select2({tags: true})
                .change(function () {
                    addressBook.Groups(groupsSelect.val());
                });
                setTimeout(function(){
                    groupsSelect.val(addressBook.Groups()).trigger("change");
                }, 200);
            },300);
        };

    return {
        groupOptions: groupOptions,
        activate: activate,
        attached: attached
    };

});