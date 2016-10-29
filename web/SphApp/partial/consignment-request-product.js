define([objectbuilders.datacontext], function(context){
    var products = ko.observableArray(),
        categories = ko.observableArray(),
        activate = function(entity){
            
            return context.get("snb-services/products")
                    .then(function(list){
                        products(list);
                        return context.get("snb-services/item-categories");
                    })
                    .then(categories);


        },
        attached  = function(view){
        
        };

    return {
        activate : activate,
        attached : attached,
        products : products,
        categories : categories
    };

});