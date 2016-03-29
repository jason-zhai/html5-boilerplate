$('.ui.checkbox')
  .checkbox()
;
var widgetValidation = {
    on: 'blur',
    inline: true,
    fields: {
       ccmUrl: {
        identifier: 'ccm-url',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter your CCM URL'
          }
        ]
      },
      username: {
        identifier: 'username',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter your username'
          }
        ]
      },
      apiKey1: {
        identifier: 'api-key-1',
        rules: [
          {
            type   : 'exactLength[4]',
            prompt : 'Field should contain 4 characters'
          }
        ]
      },
      apiKey2: {
        identifier: 'api-key-2',
        rules: [
          {
            type   : 'exactLength[4]',
            prompt : 'Field should contain 4 characters'
          }
        ]
      },
      apiKey3: {
        identifier: 'api-key-3',
        rules: [
          {
            type   : 'exactLength[4]',
            prompt : 'Field should contain 4 characters'
          }
        ]
      },
      apiKey4: {
        identifier: 'api-key-4',
        rules: [
          {
            type   : 'exactLength[4]',
            prompt : 'Field should contain 4 characters'
          }
        ]
      },
      region: {
        identifier: 'cloudRegion',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please select a region'
          }
        ]
      },
      instanceTypeSmall: {
        identifier: 'instanceTypeSmall',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please select an instance'
          }
        ]
      },
      instanceTypeMedium: {
        identifier: 'instanceTypeMedium',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please select an instance'
          }
        ]
      },
      instanceTypeLarge: {
        identifier: 'instanceTypeLarge',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please select an instance'
          }
        ]
      },
      instanceTypeXLarge: {
        identifier: 'instanceTypeXLarge',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please select an instance'
          }
        ]
      }
    }
};
$('.ui.form')
  .form(widgetValidation)
;

(function() {
    var defaultMapping = $('#tab1').clone();
    var tabInitNumber = $('#mapping [data-toggle="tab"]').length;
    var tabOneLeft = function() {
        if($('#mapping [data-toggle="tab"]').length === 1) {
            $('.menu > .item > i.remove').hide();
        } else {
            $('.menu > .item > i.remove').show();
        }
    };
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
    var updateTabTitle = function(el) {
        var selector = $(el).closest('.ui.segment').attr('id');
        var title = $(el).find('option:selected').text();
        $('[href="#' + selector + '"] > span').html(title);
    };

    $('.cloudFamily').change(function() { // this only select 1 id. since id is supposed to be unique
        updateTabTitle(this);
    });
    $('select.dropdown').dropdown();
    tabOneLeft();

    $('[data-toggle="add"]').click(function() {
        tabInitNumber += 1;
        var tabOthers = $(this).siblings();
        var tabNew = $(this).prev().clone();
        var tabContent = defaultMapping.clone();
        var tabTitleSelect = tabContent.find('.cloudFamily');

        tabNew.addClass('active');
        tabNew.removeClass('error');
        tabNew.attr('href', '#tab' + tabInitNumber);
        tabNew.find('i.remove').click(tabRemove);

        tabOthers.removeClass('active');
        tabNew.insertBefore($(this));
        $("[id^='tab']").removeClass('active');

        tabContent.attr('id', 'tab' + tabInitNumber);
        tabContent.find('select.dropdown').dropdown();
        updateTabTitle(tabTitleSelect);
        tabTitleSelect.change(function() {
            updateTabTitle(this);
        });
        $('.ui.text.container').append(tabContent);

        $('.ui.form').form(widgetValidation);
        tabOneLeft();
    });

    $('#mapping [data-toggle="tab"] > i.remove').click(tabRemove);

    $('.ui.message .close').click(function() {
        $(this)
          .closest('.message')
          .transition('scale')
        ;
    });
    $('button[type="submit"]').click(function() {
        var validationResult = $('.ui.form').form('validate form');
        for(var i=0; i < validationResult.length; i++) {
            if(validationResult[i]) {
                if(i === (validationResult.length - 1)) {
                    console.log('all forms ok. sending data.');
                    $('[href*="#tab"]').removeClass('error');
                }
            } else {
                console.log('something is missing');
                $('[href*="#tab"]').removeClass('error');
                $('.field.error').closest('[id*="tab"]').each(function() {
                    console.log($(this).attr('id'));
                    var selector = $(this).attr('id');
                    $('[href="#' + selector + '"]').addClass('error');
                });
                break;
            }
        }
    });
}());