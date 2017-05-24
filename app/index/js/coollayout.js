/**
 * Created by 150T on 2017/2/19.
 */
$(document).ready(function() {
    var animation = false,
        animDur = 1000,
        $row = $('.box__row'),
        $cell = $('.box__row-cell'),
        $content = $('.box__content'),
        $closeBtn = $('.box__close');


    var animFalse = function() {
        animation = false;
    }

    var active = function() {
        if (animation) return;
        var cellData = $(this).data('cell');
        var $content = $('.box__content[data-content=' + cellData + ']');
        animation = true;

        $cell.addClass('cell-fade');
        $(this).addClass('active');
        $content.addClass('show-content');
        $closeBtn.addClass('box-close-active');

        setTimeout(animFalse, animDur);
    }

    var close = function() {
        animation = true;

        $cell.removeClass('active cell-fade');
        $content.removeClass('show-content');
        $(this).removeClass('box-close-active');

        setTimeout(animFalse, animDur);
    }

    $row.on('click', '.box__row-cell', active);
    $closeBtn.on('click', close);
    $cell.on({
        mouseenter: function() {
            $cell.addClass('hover-cell');
            $(this).removeClass('hover-cell');
        },
        mouseleave: function() {
            $cell.removeClass('hover-cell');
        }
    });
});
(function($){
    $.fn.backgroundMove=function(options){
        var defaults={
                movementStrength:'50'
            },
            options=$.extend(defaults,options);

        var $this = $(this);

        var movementStrength = options.movementStrength;
        var height = movementStrength / $(window).height();
        var width = movementStrength / $(window).width();
        $this.mousemove(function(e){
            var pageX = e.pageX - ($(window).width() / 2);
            var pageY = e.pageY - ($(window).height() / 2);
            var newvalueX = width * pageX * -1 - 25;
            var newvalueY = height * pageY * -1 - 50;
            $this.css("background-position", newvalueX+"px     "+newvalueY+"px");
        });

    }
})(jQuery);
