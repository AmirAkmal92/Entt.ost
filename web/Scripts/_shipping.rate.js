$(function () {
    var ost = {};
    ost.ShippingRateModel = function () {
        var busy = ko.observable(false),
            fromAddress = ko.observable(),
            fromPostcode = ko.observable(),
            toAddress = ko.observable(),
            toPostcode = ko.observable(),
            weight = ko.observable(),
            width = ko.observable(),
            height = ko.observable(),
            length = ko.observable(),
            valueAddedServices = ko.observableArray(),
            estimatedTotal = ko.observable(),
            products = ko.observableArray(),
            getRatesAsync = function () {
                busy(true);
                return $.getJSON("ost/snb-services/products/?from=" + ko.unwrap(fromPostcode) + "&to=" + ko.unwrap(toPostcode) + "&country=MY&weight=" +
                        ko.unwrap(weight) + "&height=" + ko.unwrap(height) + "&length=" + ko.unwrap(length) + "&width=" + ko.unwrap(width))
                    .then(products)
                    .done(function () {
                        busy(false);
                    });
            };

        return {
            fromAddress: fromAddress,
            fromPostcode: fromPostcode,
            toAddress: toAddress,
            toPostcode: toPostcode,
            weight: weight,
            width: width,
            height: height,
            length: length,
            valueAddedServices: valueAddedServices,
            estimatedTotal: estimatedTotal,
            getRatesAsync: getRatesAsync,
            products: products,
            busy: busy
        };
    },
        formatRepo = function (address) {
            if (!address) return "";
            if (address.loading) return address.text;
            //var markup = "<div class='select2-result-repository portlet-light-bordered'>" +
            //    "<div class='select2-result-repository__avatar'><img src='/assets/layouts/layout/img/avatar3_small.jpg' /></div>" +
            //    "<div class='select2-result-repository__meta'>" +
            //    "<div class='select2-result-repository__title'><i class='fa fa-map-pin'></i> " + address.Location + "</div>";

            //markup += "<div class='select2-result-repository__description'><i class='fa fa-building-o'></i> " + address.City + "</div>";


            //markup += "<div class='select2-result-repository__statistics'>" +
            //    "<div class='select2-result-repository__forks'><i class='fa fa-globe'></i> " + address.State + " </div>" +
            //    "<div class='select2-result-repository__stargazers'><i class='fa fa-star'></i> " + address.Postcode + " </div>" +
            //    "</div>" +
            //    "</div></div>";

            var markup = "<div class='select2-result-repository__stargazers'><i class='fa fa-map-pin'></i> " + address.Postcode + " </div><div class='select2-result-repository__description'><i class='fa fa-building-o'></i> " + address.City + "</div>";

            return markup;
        },
        model = new ost.ShippingRateModel();


    $("#to-address, #from-address").select2({
        ajax: {
            url: "/api/address-lookups/",
            dataType: 'json',
            delay: 250,
            data: function (params) {
                return {
                    q: params.term.replace(/\//g, '\\/'), // search term
                    page: params.page
                };
            },
            processResults: function (data, params) {
                params.page = params.page || 1;
                var results = _(data._results).map(function (v) {
                    v.id = v.Id;
                    return v;
                });
                return {
                    results: results,
                    pagination: {
                        more: (params.page * 30) < data._count
                    }
                };
            },
            cache: false
        },
        escapeMarkup: function (markup) {
            return markup;
        },
        minimumInputLength: 3,
        templateResult: formatRepo,
        templateSelection: function (o) {
            //if (o.Location && o.Postcode) {
            //    return o.Location + ", " + o.Postcode + " " + o.City + ", " + o.State;
            //}
            //return o.text;
            return " (" + o.Postcode + ") - <i>" + o.City + ", " + o.State + "</i>";
        }
    })
        .on("select2:select", function (e) {
            var address = e.params.data;
            if (!address) {
                return;
            }
            if ($(this).attr("id") === "from-address") {
                model.fromPostcode(address.Postcode);

            } else {
                model.toPostcode(address.Postcode);
            }



        });

    ko.applyBindings(model, document.getElementById("shipping-rate-form"))

});