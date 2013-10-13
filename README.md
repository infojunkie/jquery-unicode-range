This jQuery plugin emulates the CSS3 descriptor unicode-range http://www.w3.org/TR/css3-fonts/#unicode-range-desc. It detects DOM elements that have associated *@font-face* rules that include *unicode-range* descriptors, and only applies the rule to those  characters that match the given Unicode range.

To use:
```html
<script src="http://codeorigin.jquery.com/jquery-1.10.2.min.js"></script>
<script src="jquery.unicode-range.js"></script>
<style type="text/css">
  @font-face {
    font-family: 'SSP';
    src: url('f/SourceSansPro-Bold.ttf');
    unicode-range: U+41-4D, U+6E, U+6F, U+7?;
  }
  p {font: 2.5em SSP, serif;}
</style>
<script>
  $(document).ready(function(){
    $('p').unicodeRange();
  });
</script>
```

To see it in action: http://jsfiddle.net/qayLF/1/
