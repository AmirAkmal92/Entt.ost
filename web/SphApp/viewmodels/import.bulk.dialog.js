define(["plugins/dialog"],
    function(dialog)
        {
            var item = ko.observable({
                storeId : ko.observable()
            }),
                okClick = function(data, ev) {
                if (bespoke.utils.form.checkValidity(ev.target))
                {
                    dialog.close(this, "OK");
                }
            },
            cancelClick = function() {
                dialog.close(this, "Cancel");
            };

            var vm = {
            item : item,
            okClick : okClick,
            cancelClick : cancelClick
        };


        return vm;

    });