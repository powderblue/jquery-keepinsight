# jquery-stickit

jquery-stickit makes elements sticky.

## Examples

You can find working examples of the following in `tests/`.

### Headers

Make your main `header` stick to the top of the page as you scroll down:

```javascript
jQuery('header').stickit();
```

### Table Headers

Keep a table's head in place while you scroll down through its body:

```javascript
jQuery('table thead').stickit();
```

Yes, the plugin requires that your table markup includes `thead` and `tbody` elements.