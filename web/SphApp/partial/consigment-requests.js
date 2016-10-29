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
        map = function(v){
            return v;
        };

    return {
        activate : activate,
        attached : attached,
        map : map
    };

});