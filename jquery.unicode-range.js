/**
 * unicodeRange
 * A jQuery plugin to emulate the unicode-range CSS3 descriptor
 * http://www.w3.org/TR/css3-fonts/#unicode-range-desc
 */

;(function($){
  $.fn.extend({
    unicodeRange: function(options) {
      this.defaultOptions = {};

      var settings = $.extend({}, this.defaultOptions, options);

      // TODO detect native browser support for unicode-range.

      // Loop over style sheets, getting @font-face declarations
      // and checking for unicode-range descriptor.
      var unicodeRanges = [];
      $.each(document.styleSheets, function() {
        $.each(this.cssRules, function() {
          if (this instanceof CSSFontFaceRule) {
            var rule = this;
            // TODO Load CSSOM on-demand without relying on client page.
            var css = CSSOM.parse(rule.cssText);
            var style = css.cssRules[0].style;
            var fontFamily = trim(style['font-family'], '"');
            var unicodeRangeToRegexp = function(ur) {
              var regex = '';
              $.each(ur.split(','), function() {
                var range = trim(this).
                  replace('U+', '\\u').
                  replace('-', '-\\u');
                // TODO handle complete spec:
                // * U+XX less than 4 digits
                // * U+X?? wildcards
                regex += range;
              });
              return '([' + regex + ']+)';
            };
            $.each(style, function() {
              if (this == 'unicode-range') {
                unicodeRanges[fontFamily] = {
                  regex: unicodeRangeToRegexp(style['unicode-range']),
                  fontFamily: fontFamily
                };
              }
            });
          }
        });
      });

      // Loop on each target, applying unicode-range to it.
      return this.each(function() {
        var $target = $(this);

        // Detect font-family rules that match unicodeRanges above.
        var applicableRules = [];
        var fontFamilies = $(this).css('font-family').split(',');
        var fontFamiliesUnapplied = [];
        $.each(fontFamilies, function() {
          if (typeof unicodeRanges[this] !== 'undefined') {
            applicableRules.push(unicodeRanges[this]);
          }
          else {
            fontFamiliesUnapplied.push(this);
          }
        });

        // Don't handle elements that don't apply.
        if (applicableRules.length == 0) return;

        // Unapply @font-face rules from target
        $target.css('font-family', fontFamiliesUnapplied);

        // Create spans and apply @font-face to them.
        $.each(applicableRules, function() {
          var rule = this;
          var regex = new RegExp(rule.regex, 'mg');
          var spans = $target.html().replace(regex, function(match, text, offset, string) {
            return '<span style="font-family: '+ rule.fontFamily + ';">' + text + '</span>';
          });
          $target.html(spans);
        });
      });
    }
  });
})(jQuery);

// http://phpjs.org/functions/trim/
function trim (str, charlist) {
  // http://kevin.vanzonneveld.net
  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   improved by: mdsjack (http://www.mdsjack.bo.it)
  // +   improved by: Alexander Ermolaev (http://snippets.dzone.com/user/AlexanderErmolaev)
  // +      input by: Erkekjetter
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +      input by: DxGx
  // +   improved by: Steven Levithan (http://blog.stevenlevithan.com)
  // +    tweaked by: Jack
  // +   bugfixed by: Onno Marsman
  // *     example 1: trim('    Kevin van Zonneveld    ');
  // *     returns 1: 'Kevin van Zonneveld'
  // *     example 2: trim('Hello World', 'Hdle');
  // *     returns 2: 'o Wor'
  // *     example 3: trim(16, 1);
  // *     returns 3: 6
  var whitespace, l = 0,
    i = 0;
  str += '';

  if (!charlist) {
    // default list
    whitespace = " \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000";
  } else {
    // preg_quote custom list
    charlist += '';
    whitespace = charlist.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '$1');
  }

  l = str.length;
  for (i = 0; i < l; i++) {
    if (whitespace.indexOf(str.charAt(i)) === -1) {
      str = str.substring(i);
      break;
    }
  }

  l = str.length;
  for (i = l - 1; i >= 0; i--) {
    if (whitespace.indexOf(str.charAt(i)) === -1) {
      str = str.substring(0, i + 1);
      break;
    }
  }

  return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
}
