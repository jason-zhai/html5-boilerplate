$('.ui.checkbox')
  .checkbox()
;
$('.ui.form')
  .form({
    on: 'blur',
    inline: true,
    fields: {
       ccmUrl: {
        identifier: 'ccm-url',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter your name'
          }
        ]
      },
      name: {
        identifier: 'username',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter your name'
          }
        ]
      }
    }
  })
;

(function() {
    var defaultMapping = $('#tab1').clone();
    var tabInitNumber = $('#mapping [data-toggle="tab"]').length;
    var tabRemove = function(e) {
        var tabItem = $(this).parent();
        e.stopPropagation();
        e.preventDefault();
        $('.ui.basic.modal')
          .modal({
            closable  : true,
            onDeny    : function(){
              return true;
            },
            onApprove : function() {
              if(tabItem.hasClass('active')) {
              if((tabItem.index() + 1) === $('#mapping [data-toggle="tab"]').length) {
                        tabItem.prev().addClass('active');
                        $(tabItem.attr('href')).prev().addClass('active');
                    } else {

                        tabItem.next().addClass('active');
                        $(tabItem.attr('href')).next().addClass('active');
                    }
                }
                tabItem.remove();
                $(tabItem.attr('href')).remove();
                tabOneLeft();
            }
          })
          .modal('show')
        ;
    };
    var tabOneLeft = function() {
        if($('#mapping [data-toggle="tab"]').length === 1) {
            $('.menu > .item > i.remove').hide();
        } else {
            $('.menu > .item > i.remove').show();
        }
    };

    $('select.dropdown').dropdown();
    tabOneLeft();

    $('[data-toggle="add"]').click(function() {
        tabInitNumber += 1;
        var tabOthers = $(this).siblings();
        var tabNew = $(this).prev().clone();
        var tabMenu = $(this).closest('.ui.menu');
        var tabContent = defaultMapping.clone();

        tabNew.addClass('active');
        tabNew.attr('href', '#tab' + tabInitNumber);
        tabNew.find('i.remove').click(tabRemove);

        tabOthers.removeClass('active');
        tabNew.insertBefore($(this));
        $("[id^='tab']").removeClass('active');

        tabContent.attr('id', 'tab' + tabInitNumber);
        tabContent.find('select.dropdown').dropdown();
        $('.ui.text.container').append(tabContent);

        tabOneLeft();
    });

    $('#mapping [data-toggle="tab"] > i.remove').click(tabRemove);
}());