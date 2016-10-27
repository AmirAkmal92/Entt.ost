// PLEASE WAIT WHILE YOUR SCRIPT IS LOADING
define([objectbuilders.datacontext, objectbuilders.app,"plugins/router",  "services/logger"], function(context, app, router, logger){
    var selectedAddresses = ko.observableArray(),
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

        },
        importContacts = function(){
            var tcs = new $.Deferred();
            require(['viewmodels/import.contacts.dialog' , 'durandal/app'], function (dialog, app2) {
              
                app2.showDialog(dialog)
                    .done(function (result) {
                        tcs.resolve(result);
                        if (!result) return;
                        if (result === "OK") {
                            var storeId = ko.unwrap(dialog.item().storeId);
                            context.post("{}", "address-books/" + storeId).done(function(result){
                                console.log(result);
                            });
                        }
                }); 
            });

            return tcs.promise();
        },
        exportToCsv = function(){
            var tcs = new $.Deferred();
            require(['viewmodels/export.addresses.dialog' , 'durandal/app'], function (dialog, app2) {
              
                app2.showDialog(dialog)
                    .done(function (result) {
                        tcs.resolve(result);
                        if (!result) return;
                        if (result === "OK") {
                            var uri = "";
                            for(var opt in dialog.options()){
                                if(ko.isObservable(dialog.options()[opt])){
                                    uri += opt + "="+ ko.unwrap(dialog.options()[opt]) + "&"
                                }
                            }
                            window.open("/address-books/csv?" + uri);

                        }
                });
            });

            return tcs.promise();
        },    
        addCommand = {
            command : function(){
                return router.navigate("address-book-create/0");
            },
            caption : "Add new address",
            icon : "fa fa-plus label label-info"
        },
        removeCommand = {
            command : removeAddresses,
            enable : ko.computed(function(){
                return selectedAddresses().length > 0;
            }),
            caption : "Remove address",
            icon : "fa fa-trash-o  label label-danger",
            class : "btn btn-danger"
        },
        importCommand = {
            command : importContacts,
            caption : "Import contacts",
            icon : "fa fa-upload icon-default"
        },
        exportToCsvCommand = {
            command : exportToCsv,
            caption : "Export to csv",
            icon : "fa fa-file-o icon-default"
        },
        reloadCommand = {
            command : exportToCsv,
            caption : "Refresh",
            icon : "fa fa-refresh icon-default"
        },
        commands = ko.observableArray([ addCommand, removeCommand, importCommand, exportToCsvCommand, reloadCommand]),
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
        };

    return {
        selectedAddresses : selectedAddresses,
        removeAddresses : removeAddresses,
        commands : commands,
        activate : activate,
        attached : attached,
        addAddress : addAddress
    };

});