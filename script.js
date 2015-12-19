(function () {

  var elementId = 'editor';

  var renderEditor = function () {

    var settings = {
      validElements: [
          ['a', 'href|target:_blank'],
          ['strong/b'],
          ['em/i'],
          ['br'],
          ['p'],
          ['div'],
          ['ul'],
          ['ol'],
          ['li']
      ],
      replacements: [
          ['h1', 'strong'],
          ['h2', 'strong'],
          ['h3', 'strong'],
          ['h4', 'strong'],
          ['h5', 'strong']
      ]
    };

    var validElements = function (settings) {
      return _.map(settings.validElements, function (element) {
        if (element.length == 1)
          return element;
        if (element.length == 2)
          return element[0] + '[' + element[1] + ']';
        throw new Error('Element length not supported.');
      }).join(',');
    };

    var allowedTags = function (settings) {
      var result = [];
      _.each(settings.validElements, function (element) {
        _.each(element[0].split('/'), function (tag) {
          result.push('<' + tag + '>');
        });
      });
      return result.join('');
    };

    var stripTags = function (str, allowed_tags, replacements) {
      var key = '';
      var allowed = false;
      var matches = [];
      var allowed_array = [];
      var allowed_tag = '';
      var i = 0;
      var k = '';
      var html = '';
      var replacer = function (search, replace, str) {
        return str.split(search).join(replace);
      };
      // Build allowes tags associative array
      if (allowed_tags) {
        allowed_array = allowed_tags.match(/([a-zA-Z0-9]+)/gi);
      }

      str += '';

      // Match tags
      matches = str.match(/(<\/?[\S][^>]*>)/gi);
      // Go through all HTML tags
      for (key in matches) {
        if (isNaN(key)) {
          // IE7 Hack
          continue;
        }

        // Save HTML tag
        html = matches[key].toString();
        // Is tag not in allowed list? Remove from str!
        allowed = false;

        // Go through all allowed tags
        for (k in allowed_array) {
          allowed_tag = allowed_array[k];
          i = -1;

          if (i != 0)
            i = html.toLowerCase().indexOf('<' + allowed_tag + '>');
          if (i != 0)
            i = html.toLowerCase().indexOf('<' + allowed_tag + ' ');
          if (i != 0)
            i = html.toLowerCase().indexOf('</' + allowed_tag);

          // Determine
          if (i == 0) {
            allowed = true;
            break;
          }
        }
        if (allowed) {
          // TinyMCE strips out all attributes that aren't listed in valid_elements, except for data- attributes.
          // The best way to strip out data- attributes is during paste, as this is the only time that it can be introduced and we already have HTML markup separated in 'matches' array.
          // If we try to strip out data-* from tinyMCE.activeEditor.getContent() later, we could end up stripping out data- inside of the user's text instead of just from HTML attributes.
          str = replacer(html, html.replace(/(data-.+?=".*?")|(data-.+?='.*?')|(data-[a-zA-Z0-9-]+)/g, ''), str);
        } else {
          // if tag is not allowed, we don't need to strip out data- attributes because the whole tag is replaced and all attributes stripped out
          for (tags in replacements) {
            if (html.toLowerCase().indexOf('<' + replacements[tags][0] + '>') == 0 || html.toLowerCase().indexOf('<' + replacements[tags][0] + ' ') == 0) {
              str = replacer(html, '<' + replacements[tags][1] + '>', str);
              break;
            }
            if (html.toLowerCase().indexOf('</' + replacements[tags][0]) == 0) {
              str = replacer(html, '</' + replacements[tags][1] + '>', str);
              break;
            }
          }
          str = replacer(html, '', str);
        }
      }
      return str;
    };

    tinyMCE.dom.Event.domLoaded = true; // dom ready event has already fired, so let tiny mce know
    tinyMCE.init({
      mode: 'exact',
      elements: elementId,
      theme: 'advanced',

      width: '100%',
      height: '400px',

      plugins: 'paste',

      paste_text_sticky: true,
      setup: function (ed) {
        ed.onInit.add(function (ed) {
          ed.pasteAsPlainText = false;
        });

        ed.onChange.add(function (ed, l) {
          $('#' + elementId).change();
          console.log('change');
        });
      },

      paste_preprocess: function (pl, o) {
        o.content = stripTags(o.content, allowedTags(settings), settings.replacements);
      },

      valid_elements: validElements(settings),

      content_css: 'tinymce.css',
      theme_advanced_buttons1: 'bold,italic,separator,bullist,numlist,separator,link,unlink',
      theme_advanced_buttons2: '',
      theme_advanced_buttons3: '',
      theme_advanced_toolbar_location: 'top',
      theme_advanced_toolbar_align: 'left',
      theme_advanced_statusbar_location: 'none',
      theme_advanced_resizing: true,

      init_instance_callback: function (inst) {
        tinymce.dom.Event.add(inst.getWin(), 'focus', function () {
          console.log('focus');
        });
      }
    });
  };

  var removeEditor = function () {
    tinyMCE.get(elementId).remove();
    $('#' + elementId).empty();
  };

  var getHtml = function () {
    // there's a bug in TinyMCE. Try saving with empty editor with bold turned on. Then type then save.  It will show bolded in editor, but getContent() won't return bold.
    $('#text').val(
      removeComment(
        emptyIfNoText(
          tinyMCE.get(elementId).getContent()
        )
      )
    );
  };

  var emptyIfNoText = function (html) {

    // http://alastairc.ac/2010/03/removing-emtpy-html-tags-from-tinymce/
    var text = '';
    var tmp = document.createElement('div');

    tmp.innerHTML = html;
    if (!tmp.innerHTML)
      return '';


    text = tmp.textContent || tmp.innerText || '';
    text = text.replace(/\n/gi, '');
    text = text.replace(/\s/g, '');
    text = text.replace(/\t/g, '');

    if (text == '')
      return '';
    else
      return html;
  };

  var removeComment = function (html) {

    // there's a bug in TinyMCE where pasting from Word retains comments some times
    return html.replace(/<\!--[\s\S]*?-->/g, '');
  };

  var setHtml = function () {
    tinyMCE.get(elementId).setContent(
      $('#text').val()
    );
  };

  $('[data-action]').click(function () {

    switch ($(this).data('action')) {
      case 'render-editor':
        renderEditor();
        break;
      case 'remove-editor':
        removeEditor();
        break;
      case 'get-html':
        getHtml();
        break;
      case 'set-html':
        setHtml();
        break;
      default:
        break;
    }
  });

}());


