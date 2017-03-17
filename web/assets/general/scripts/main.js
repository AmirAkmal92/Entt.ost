(function ($) {
    $.fn.outside = function (ename, cb) {
        return this.each(function () {
            var $this = $(this),
			self = this;
            $(document.body).bind(ename, function tempo(e) {
                if (e.target !== self && !$.contains(self, e.target)) {
                    cb.apply(self, [e]);
                    if (!self.parentNode) $(document.body).unbind(ename, tempo);
                }
            });
        });
    };
}(jQuery));

//Controlling cube on input focus and if input has value
$(document).ready(function () {
    $('input#panjang').focus(function () {
        $('#length').attr('class', 'style0 orange-input');
    });
    $('input#panjang').focusout(function () {
        if ($('input#panjang').val()) {
            //do nothing 
        } else {
            $('#length').attr('class', 'style0');
        }
    });
    $('input#lebar').focus(function () {
        $('#height').attr('class', 'style0 orange-input');
    });
    $('input#lebar').focusout(function () {
        if ($('input#lebar').val()) {
            //do nothing 
        } else {
            $('#height').attr('class', 'style0');
        }
    });
    $('input#tinggi').focus(function () {
        $('#width').attr('class', 'style0 orange-input');
    });
    $('input#tinggi').focusout(function () {
        if ($('input#tinggi').val()) {
            //do nothing 
        } else {
            $('#width').attr('class', 'style0');
        }
    });
});

function roundNumber(num, dec) {
    var result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
    return result;
}

function isValidNumericInput(evt) {
    var charCode = evt ? (evt.which != undefined ? evt.which : evt.keyCode) : event.keyCode;

    // FF does not like event.keyCode; only allow digits + backspace (8) + . (46) + tab (0)
    if ((charCode >= 48 && charCode <= 57) || charCode == 8 || charCode == 46 || charCode == 0) {
        return true;
    }
    return false;
}
function calculateVolumetric1() {
    var length = 0;
    var width = 0;
    var height = 0;


    if ($('#panjang1').val() != "") {
        length = parseFloat($('#panjang1').val());
    }
    if ($('#lebar1').val() != "") {
        width = parseFloat($('#lebar1').val());
    }
    if ($('#tinggi1').val() != "") {
        height = parseFloat($('#tinggi1').val());
    }
    var dimWeight = (length * width * height) / 6000;
    //$('#volumetricVal').val(roundNumber(dimWeight,2));
    //document.getElementById('mySpan').innerHTML = roundNumber(dimWeight,2)
    var paragraph = document.getElementById("volumetricVal1");
    paragraph.innerHTML = roundNumber(dimWeight, 2);
}
function calculateVolumetric() {
    var length = 0;
    var width = 0;
    var height = 0;

    if ($('#panjang').val() != "") {
        length = parseFloat($('#panjang').val());
    }
    if ($('#lebar').val() != "") {
        width = parseFloat($('#lebar').val());
    }
    if ($('#tinggi').val() != "") {
        height = parseFloat($('#tinggi').val());
    }
    var dimWeight = (length * width * height) / 6000;
    //$('#volumetricVal').val(roundNumber(dimWeight,2));
    //document.getElementById('mySpan').innerHTML = roundNumber(dimWeight,2)
    var paragraph = document.getElementById("volumetricVal");
    paragraph.innerHTML = roundNumber(dimWeight, 2);
}