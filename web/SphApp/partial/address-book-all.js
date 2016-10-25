// PLEASE WAIT WHILE YOUR SCRIPT IS LOADING
define([], function(){
    var activate = function(list){
            
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
                dialog.item(address);
                app2.showDialog(dialog)
                    .done(function (result) {
                        if (!result) return;
                        if (result === "OK") {
                            
                        
                        }
                });
            });
        };

    return {
        activate : activate,
        attached : attached,
        addAddress : addAddress
    };

});