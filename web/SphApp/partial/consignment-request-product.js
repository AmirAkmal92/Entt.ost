define([objectbuilders.datacontext], function(context){
    var products = ko.observableArray(),
        categories = ko.observableArray(),
        rootEntity = null,
        activate = function(entity){
            rootEntity = entity;
            return context.get("/snb-services/item-categories")
                    .then(categories);


        },
        attached  = function(view){
        
        },
        selectProduct = function(prd){
            rootEntity.Product().Code(prd.Code);
        },
        recalculatePrice = function(serviceModel){

            return function(){
                console.log(ko.toJS(serviceModel));
                
                var model = ko.toJS(serviceModel), 
                    r = ko.toJS(rootEntity),
                    request = {
                        request : {
                            ItemCategory :"",
                            Weight : r.Product.Weight,
                            Width : r.Product.Volume.Width,
                            Length  : r.Product.Volume.Length,
                            Height  : r.Product.Volume.Height,
                            SenderPostcode : r.Sender.Address.Postcode,
                            SenderCountry  : r.Sender.Address.Country,
                            ReceiverPostcode : r.Receivers[0].Address.Postcode,
                            ReceiverCountry  : r.Receivers[0].Address.Country
                    },
                    product : {
                        Code : model.Code,
                        Description : model.Description
                    },
                    valueAddedServices : _(model.ValueAddedServices).filter(function(v){ return v.IsSelected; })

                };

                return context.post(ko.toJSON(request), "/snb-services/calculate-published-rate")
                    .done(function(result){
                        console.log(result);
                        serviceModel.TotalCost(result.Total);
                    });

            };
        };

    return {
        activate : activate,
        attached : attached,
        products : products,
        categories : categories,
        selectProduct : selectProduct,
        recalculatePrice : recalculatePrice
    };

});