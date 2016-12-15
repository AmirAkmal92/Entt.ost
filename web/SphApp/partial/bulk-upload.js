// PLEASE WAIT WHILE YOUR SCRIPT IS LOADING
define([objectbuilders.datacontext, objectbuilders.app, "plugins/router", "services/logger", "viewmodels/_address-book-groups", "services/app"],
 function (context, app, router, logger, contactGroups, app2) {
     var groupName = ko.observable(),
         selectedAddresses = ko.observableArray(),
         importContacts = function () {
             var tcs = new $.Deferred();
             require(['viewmodels/import.bulk.dialog', 'durandal/app'], function (dialog, app2) {

                 app2.showDialog(dialog)
                     .done(function (result) {
                         tcs.resolve(result);
                         if (!result) return;
                         if (result === "OK") {
                             var storeId = ko.unwrap(dialog.item().storeId);
                             context.post("{}", "address-books/" + storeId).done(function (result) {
                                 console.log(result);
                             });
                         }
                     });
             });

             return tcs.promise();
         },
         importCommand = {
             command: importContacts,
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

             rootList.subscribe(function () {

                 $("a.contact-item").draggable({
                     helper: "clone",
                     start: function (e, ui) {
                         $(ui.helper).css({ "background-color": "gray", "padding": "5px", "color": "black" });
                     }
                 });

             }, "arrayChange", null);
         },
         addAddress = function () {
             var address = new bespoke.Ost_addressBook.domain.AddressBook();
             require(['viewmodels/address-dialog', 'durandal/app'], function (dialog, app2) {
                 dialog.entity(address);
                 app2.showDialog(dialog)
                     .done(function (result) {
                         if (!result) return;
                         if (result === "OK") {


                         }
                     });
             });
         };
     map = function (v) {
         v.Groups = ko.observableArray(v.Groups);
         return v;
     };

     return {
         map: map,
         importContacts: importContacts,
         activate: activate,
         attached: attached
     };

 });