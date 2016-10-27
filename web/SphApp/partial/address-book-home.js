// PLEASE WAIT WHILE YOUR SCRIPT IS LOADING
define([objectbuilders.datacontext, objectbuilders.app,"plugins/router",  "services/logger", "viewmodels/_address-book-groups", "services/app"], 
 function(context, app, router, logger,contactGroups, app2){
    var groupName = ko.observable(),
        selectedAddresses = ko.observableArray(),
        removeAddresses = function(){
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
        renameGroup = function(){
            var newGroupName = "-";
            return app2.prompt("Rename your group", ko.unwrap(groupName))
                    .then(function (result) {
                        if (result) {
                            newGroupName = result;
                            return context.put("{}", "/address-books/groups/" + ko.unwrap(groupName) + "/" + result); 
                        }
                        return Task.fromResult({});
                    }).then(function(result){
                        if(result.message){
                            logger.info(result.message);                                
                            return contactGroups.activate();
                        }
                        return Task.fromResult({});
                    }).then(function(){
                        return router.navigate("address-book-home/" +  newGroupName);
                    });
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
        renameGroupCommand = {
            command : renameGroup,
            caption : "Rename group",
            icon : "fa fa-pencil icon-default",
            enable : ko.computed(function(){
                return ko.unwrap(groupName) !== "-";
            })
        },
        exportToCsvCommand = {
            command : exportToCsv,
            caption : "Export to csv",
            icon : "fa fa-file-o icon-default"
        },
        commands = ko.observableArray([ addCommand, removeCommand, importCommand, exportToCsvCommand, renameGroupCommand]),
        rootList = null,
        activate = function(list, grpName){
            rootList = list;
            groupName(grpName);
            var tcs = new $.Deferred();
            setTimeout(function(){
                tcs.resolve(true);
            }, 500);

            contactGroups.activate();// pretty good channce when user comes here, he updated something
            return tcs.promise();
        },
        attached  = function(view){
            rootList.subscribe(function(){

            $("a.contact-item").draggable({
                helper: "clone",
                start: function(e, ui){
                    $(ui.helper).css({"background-color": "gray", "padding" : "5px", "color": "black"});
                    }
                });

            }, "arrayChange", null);

            var makeGroupDroppable = function(){

                $("li.address-book-group").droppable({
                        accept: "a.contact-item",
                        hoverClass: "drop-contact",
                        drop: function( event, ui ) {
                            
                            var group = ko.dataFor(this).group,
                                id = ui.draggable.data("id");
                            return context.post("{}", "/address-books/groups/" + ko.unwrap(group) + "/" + id)
                                .then(function(result){
                                    logger.info(result.message);
                                    return contactGroups.activate();
                                }).then(function(){
                                    makeGroupDroppable();
                                });

                        }
                });

            };
            setTimeout(makeGroupDroppable, 1500);
            contactGroups.groups.subscribe(function(){setTimeout(makeGroupDroppable, 500);}, "arrayChange", null);
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

        groupName.subscribe(function(gp){
            if(!gp || gp === "-"){
                commands.remove(renameGroupCommand);
                return;
            }

            if(commands().indexOf(renameGroupCommand) > -1){
                return;
            }
            commands.push(renameGroupCommand);
        });

    return {
        selectedAddresses : selectedAddresses,
        removeAddresses : removeAddresses,
        commands : commands,
        activate : activate,
        attached : attached,
        addAddress : addAddress
    };

});