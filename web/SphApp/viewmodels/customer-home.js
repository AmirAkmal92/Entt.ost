define(["services/datacontext", "services/logger", "plugins/router", objectbuilders.system, objectbuilders.app , "services/config"], 
    function(context, logger, router, system, app, config){
    var activate = function(){
            
            return true;


        },
        attached  = function(view){
        
        };

    return {
        config :config,
        activate : activate,
        attached : attached
    };

});