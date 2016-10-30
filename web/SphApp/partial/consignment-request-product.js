define([objectbuilders.datacontext], function(context){
    var products = ko.observableArray(),
        categories = ko.observableArray(),
        rootEntity = null,
        activate = function(entity){
            rootEntity = entity;
            return context.get("snb-services/products")
                    .then(function(list){
                        products(list);
                        return context.get("snb-services/item-categories");
                    })
                    .then(categories);


        },
        attached  = function(view){
        
        },
        selectProduct = function(prd){
            rootEntity.Product().Code(prd.Code);
        };

    return {
        activate : activate,
        attached : attached,
        products : products,
        categories : categories,
        selectProduct : selectProduct
    };

});