/*globals jQuery, window*/
/**
 * @author Dan Bettles <dan@powder-blue.com>
 * @copyright Powder Blue Ltd 2015
 * @license MIT
 */

(function () {
    'use strict';

    /**
     * @param {jQuery} $el
     * @returns {Stickit}
     * @throws {String} If the table component is not a `thead`.
     */
    function Stickit($el) {
        this.setEl($el);

        if (this.getEl().closest('table').size()) {
            if (!this.getEl().is('thead')) {
                throw 'The table component is not a `thead`.';
            }

            this.setParentEl(this.getEl().closest('table'));
        } else {
            this.setParentEl(jQuery('body'));
        }
    }

    Stickit.prototype = {

        /**
         * @private
         * @param {jQuery} $el
         * @returns {undefined}
         */
        setEl: function ($el) {
            this.$el = $el;
        },

        /**
         * @returns {jQuery}
         */
        getEl: function () {
            return this.$el;
        },

        /**
         * @private
         * @param {jQuery} $el
         * @returns {undefined}
         */
        setParentEl: function ($el) {
            this.$parent = $el;
        },

        /**
         * @private
         * @returns {jQuery}
         */
        getParentEl: function () {
            return this.$parent;
        },

        /**
         * Creates a clone of the source element.
         * 
         * @private
         * @returns {jQuery}
         */
        createCloneEl: function () {
            var $clone;

            if (this.getParentEl().is('table')) {
                $clone = this.getParentEl().clone()
                    .find('tbody')
                        .remove()
                    .end()
                    .insertAfter(this.getParentEl());
            } else {
                $clone = this.getEl().clone()
                    .insertAfter(this.getEl());
            }

            $clone
                .hide()
                .addClass('stickit-clone')
                .css({
                    position: 'fixed',
                    top: 0,
                    marginTop: 0,
                    zIndex: 808
                });

            return $clone;
        },

        /**
         * @returns {undefined}
         */
        setUp: function () {
            var stickit = this,
                $clone;

            $clone = this.createCloneEl();

            window.setInterval(function () {
                var windowScrollTop,
                    refOffset,
                    refBottom;

                windowScrollTop = jQuery(window).scrollTop();
                refOffset = stickit.getEl().offset();
                refBottom = (refOffset.top + stickit.getParentEl().height()) - $clone.height();

                //Show the sticky, cloned element if the user is scrolling within the reference element.
                if (windowScrollTop >= refOffset.top && windowScrollTop < refBottom) {
                    $clone
                        .css({
                            left: String(refOffset.left) + 'px',
                            top: 0,
                            width: stickit.getEl().css('width')
                        })
                        .show();

                    stickit.getEl().css('visibility', 'hidden');
                } else {
                    $clone.hide();
                    stickit.getEl().css('visibility', 'visible');
                }
            }, 10);
        }
    };

    jQuery.fn.extend({

        stickit: function () {
            return this.each(function () {
                (new Stickit(jQuery(this))).setUp();
            });
        }
    });
}());