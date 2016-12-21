

    define([objectbuilders.datacontext],
        function (context) {
            var isBusy = ko.observable(false),
            userName = ko.observable("osman"),
            userProfile = ko.observable(new bespoke.sph.domain.UserProfile()),
            startModule = ko.observable("customer-home"),
            startModuleOptions = ko.observableArray(["create-consignment","customer-home","my consignment request"]),
            languageOptions = ko.observableArray(),
            activate = function () {
                var query = String.format("UserName eq '{0}'", userName()),
                    tcs = new $.Deferred(),
                    loadTask = context.loadOneAsync("UserProfile", query),
                    languageOptionsTask = $.getJSON("/i18n/options");
                $.when(loadTask, languageOptionsTask).done(function (b, langs) {
                    if (b)
                        userProfile(b);
                    else
                        userProfile(new bespoke.sph.domain.UserProfile());
                    var lang = langs[0],
                        options = [];
                    for (var code in lang) {
                        if (lang.hasOwnProperty(code)) {
                            options.push({ code: code, display: lang[code] });
                        }
                    }
                    languageOptions(options);
                    tcs.resolve(true);
                });

                return tcs.promise();
            },
            saveAsync = function () {
                var json = ko.toJSON(userProfile);
                return context.post(json, "/App/UserProfile/UpdateUser");
            };

            var vm = {
                activate: activate,
                userProfile: userProfile,
                startModule: startModule,
                startModuleOptions: startModuleOptions,
                languageOptions: languageOptions,
                toolbar: {
                    saveCommand: saveAsync
                },
                isBusy: isBusy,
                title: "User profile Details"
            };

            return vm;
        });
