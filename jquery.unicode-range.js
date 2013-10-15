/**
 * unicodeRange
 * A jQuery plugin to emulate the unicode-range CSS3 descriptor
 * http://www.w3.org/TR/css3-fonts/#unicode-range-desc
 */

;(function($){
  $.fn.extend({
    unicodeRange: function(options) {
      this.defaultOptions = {
        userAgent: /firefox/,
        debug: false
      };

      var settings = $.extend({}, this.defaultOptions, options);

      // TODO Detect native browser support for unicode-range.
      // https://github.com/Modernizr/Modernizr/issues/1058
      // For now, let the caller explicitly set the user agent to check.
      if (!navigator.userAgent.toLowerCase().match(settings.userAgent)) {
        debug('unicodeRange: user agent ' + settings.userAgent + ' not detected - aborting.');
        return;
      }

      function debug(log) {
        if (settings.debug) {
          console.log(log);
        }
      }

      // TODO Ensure idempotency.

      // TODO Register new tag x-unicode-range.

      // Loop over style sheets, getting @font-face declarations
      // and checking for unicode-range descriptor.
      var unicodeRanges = [];
      $.each(document.styleSheets, function() {
        $.each(this.cssRules, function() {
          if (this instanceof CSSFontFaceRule) {
            var rule = this;
            // req CSSOM
            var css = CSSOM.parse(rule.cssText);
            var style = css.cssRules[0].style;
            var fontFamily = style['font-family'].replace(/"/g, '');

            // Full unicode-range regex is:
            // u\+[0-9a-f?]{1,6}(-[0-9a-f]{1,6})?
            // http://www.w3.org/TR/CSS21/syndata.html#tokenization
            function unicodeRangeToRegexp(ur) {
              var regex = '';
              $.each(ur.split(','), function() {
                var range = $.trim(this).
                  replace('U+', '\\u').
                  replace('-', '-\\u');
                regex += range;
              });
              return '([' + regex + ']+)';
            }

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
        var fontFamilies = $target.css('font-family').split(',');
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

        // Unapply @font-face rules from target.
        $target.css('font-family', fontFamiliesUnapplied);

        // Create spans and apply @font-face to them.
        $.each(applicableRules, function() {
          var rule = this;
          var regex = new RegExp(rule.regex, 'mg');
          var spans = $target.html().replace(regex, function(match, text, offset, string) {
            return '<x-unicode-range style="font-family: '+ rule.fontFamily + ';">' + text + '</x-unicode-range>';
          });
          $target.html(spans);
        });
      });
    }
  });
})(jQuery);
