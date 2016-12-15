// PLEASE WAIT WHILE YOUR SCRIPT IS LOADING
define([objectbuilders.datacontext, objectbuilders.app, "plugins/router", "services/logger", "services/app"],
 function (context, app, router, logger, app2) {
     var importOrders = function () {
             var tcs = new $.Deferred();
             require(['viewmodels/import.bulk.dialog', 'durandal/app'], function (dialog, app2) {

                 app2.showDialog(dialog)
                     .done(function (result) {
                         tcs.resolve(result);
                         if (!result) return;
                         if (result === "OK") {
                             var storeId = ko.unwrap(dialog.item().storeId);
                             context.post("{}", "consignment-requests/" + storeId).done(function (result) {
                                 console.log(result);
                             });
                         }
                     });
             });

             return tcs.promise();
         },
         importCommand = {
             command: importOrders,
             caption: "IMPORT ORDER",
             icon: "fa fa-upload icon-default"
         },
         commands = ko.observableArray([importCommand]),
         rootList = null,
         activate = function (list) {
             rootList = list;
             var tcs = new $.Deferred();
             setTimeout(function () {
                 tcs.resolve(true);
             }, 500);
             return tcs.promise();
         },
         attached = function (view) {

             $(view).on("click", "a#select-all", function() {
                 $(view).find("input.contact-checked").prop("checked", true);
             });
         },

     map = function (v) {
         v.Groups = ko.observableArray(v.Groups);
         return v;
     };

     return {
         map: map,
         importOrders: importOrders,
         activate: activate,
         attached: attached
     };

 });