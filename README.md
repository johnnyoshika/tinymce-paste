### TinyMCE Sample Implementation

#### Usage
* Load `index.html`
* Click the following buttons:
  * `Render Editor`
    * Renders the Tiny MCE editor.
  * `Remove Edior`
    * Removes the Tiny MCE editor.
  * `Get HTML`
    * Retrieves the HTML generted by Tiny MCE and puts it into the textarea.
  * `Set HTML`
    * Takes the HTML in the textarea and puts it into the Tiny MCE editor.
* `focus` and `change` events will log to the console.

#### Noteworthy Customizations

https://github.com/johnnyoshika/tinymce-paste/blob/master/tiny_mce_3.5.6/themes/advanced/link.htm#L31
Link pop-up:
* Hide many options to simplify pop-up.
* We force `target` to be `_blank` instead of giving the user the option.

https://github.com/johnnyoshika/tinymce-paste/blob/master/tiny_mce_3.5.6/tiny_mce_src.js#L9813
* Bug fixes.  It seems that this only applies to IE9, so it's probably not relevant for Dashboard.