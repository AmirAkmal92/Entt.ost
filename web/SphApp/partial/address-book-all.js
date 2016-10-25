// PLEASE WAIT WHILE YOUR SCRIPT IS LOADING
define([objectbuilders.datacontext, objectbuilders.app,  "services/logger"], function(context, app, logger){
    var selectedAddresses = ko.observableArray(),
        rootList = null,
        activate = function(list){
            rootList = list;
            var tcs = new $.Deferred();
            setTimeout(function(){
                tcs.resolve(true);
            }, 500);

            return tcs.promise();


        },
        attached  = function(view){
        
        },
        addAddress = function(){
            var address = new bespoke.Ost_addressBook.domain.AddressBook();
            require(['viewmodels/address-dialog' , 'durandal/app'], function (dialog, app2) {
                dialog.entity(address);
                app2.showDialog(dialog)
                    .done(function (result) {
                        if (!result) return;
                        if (result === "OK") {
                            
                        
                        }
                });
            });
        },
        removeAddresses = function(){
            console.log(ko.toJS(rootList));
            var tcs = $.Deferred();
            app.showMessage(`Are you sure you want to remove ${selectedAddresses().length} address(es), this action cannot be undone`, "OST", ["Yes", "No"])
                .done(function(dialogResult) {
                    if (dialogResult === "Yes") {

                        var tasks = selectedAddresses()
                            .map(v => context.sendDelete(`/api/address-books/${ko.unwrap(v.Id)}`));
                        $.when(tasks)
                            .done(function(result) {
                                logger.info(`Selected addresses has been successfully removed`);
                                selectedAddresses().forEach(v => rootList.remove(v));
                                tcs.resolve(true);
                                
                            });
                    } else {
                        tcs.resolve(false);
                    }
                });

            return tcs.promise();

        };

    return {
        selectedAddresses : selectedAddresses,
        removeAddresses : removeAddresses,
        activate : activate,
        attached : attached,
        addAddress : addAddress
    };

});