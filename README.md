# jquery-keepinsight

jquery-keepinsight stops the selected elements scrolling past the top of the page so they continue to stay in sight.  

The plugin can be used to keep your main header on screen at all times, and to keep table headers around while you scan through the associated data - the result is similar to 'freezing' rows in a spreadsheet.  Multiple elements can be kept in sight, so you can do all of the above in the same page, should you wish; multiple 'sticky' elements will stack-up as you scroll down the page.

## Examples

You can find working examples of the following in `tests/`.

The gibberish text appearing in the examples was generated using [RandomTextGenerator.com](http://randomtextgenerator.com/).

### Headers

Make your main `header` 'stick' to the top of the page when you scroll down:

```javascript
jQuery('header').keepInSight();
```

### Table Headers

Keep a table's header around when you scroll down through its body:

```javascript
jQuery('table thead').keepInSight();
```

Yes, the plugin requires that your table markup includes `thead` and `tbody` elements.

### Multiple Elements

'Stick' your main `header` *and* `thead` elements when you scroll down:

```javascript
jQuery('header, table thead').keepInSight();
```

## CSS

The plugin adds the class `keepinsight-clone` to the elements that stay in sight - these are clones of the targetted elements.

`thead` elements are not cloned as-is: the clone of a `thead` is a copy of the table it resides in minus its `tbody`. The plugin does this to ensure the formatting of the `thead` is preserved.

## Installation

Install using Bower, thus:

```sh
bower install jquery-keepinsight
```