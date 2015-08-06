$(document).ready(function() {
    $('[data-href]').each(function() {
        $(this).css('cursor','pointer').hover(
            function() {
                $(this).addClass('active');
            },
            function(){
                $(this).removeClass('active');
            }
        ).click( function() {
            document.location = $(this).attr('data-href');
        });
    });

    $("li.link").mouseover(function() {
        $(this).addClass("active");
    });
    $("li.link").mouseleave(function() {
        $(this).removeClass("active");
    });

    $('.combobox').combobox();

    $('.selectpicker').selectpicker();

    $(document).ajaxStart(function(event, request, settings) {
        $('#loading-indicator').show();
    });
    $(document).ajaxComplete(function(event, request, settings) {
        $('#loading-indicator').hide();
    });
});
