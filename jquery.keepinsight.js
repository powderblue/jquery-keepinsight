/*jslint this: true*/
/*globals jQuery, window*/
/**
 * @author Dan Bettles <danbettles@yahoo.co.uk>
 * @copyright Powder Blue Ltd 2015
 * @license MIT
 */

(function () {
    'use strict';

    /**
     * @param {jQuery} $source
     * @param {jQuery} $parent
     * @param {jQuery} $clone
     * @returns {Sticky}
     */
    function Sticky($source, $parent, $clone) {
        this.setSourceEl($source);
        this.setParentEl($parent);
        this.setCloneEl($clone);
    }

    /**
     * Creates a new `Sticky` from the specified source element.
     *
     * @param {jQuery} $source
     * @returns {Sticky}
     */
    Sticky.create = function ($source) {
        var $parent,
            $clone,
            sticky;

        $parent = $source.closest('table, body');

        if ($parent.is('table') && !$source.is('thead')) {
            throw 'The table component is not a `thead`.';
        }

        if ($parent.is('table')) {
            $clone = $parent.clone()
                .find('tbody')
                    .remove()
                .end()
                .insertAfter($parent);
        } else {
            $clone = $source.clone()
                .insertAfter($source);
        }

        sticky = new Sticky($source, $parent, $clone);
        sticky.setUp();

        return sticky;
    };

    Sticky.prototype = {

        /**
         * @private
         * @param {jQuery} $source
         * @returns {undefined}
         */
        setSourceEl: function ($source) {
            this.$source = $source;
        },

        /**
         * @returns {jQuery}
         */
        getSourceEl: function () {
            return this.$source;
        },

        /**
         * @private
         * @param {jQuery} $parent
         * @returns {undefined}
         */
        setParentEl: function ($parent) {
            this.$parent = $parent;
        },

        /**
         * @returns {jQuery}
         */
        getParentEl: function () {
            return this.$parent;
        },

        /**
         * @private
         * @param {jQuery} $clone
         * @returns {undefined}
         */
        setCloneEl: function ($clone) {
            this.$clone = $clone;
        },

        /**
         * @returns {jQuery}
         */
        getCloneEl: function () {
            return this.$clone;
        },

        /**
         * Shows the clone at the specified *y* pixel-position.
         *
         * @param {Number} top
         * @returns {undefined}
         */
        showClone: function (top) {
            this.getCloneEl()
                .css({
                    left: this.getSourceEl().css('left'),
                    top: String(top) + 'px',
                    width: this.getSourceEl().css('width')
                })
                .show();

            this.getSourceEl().css('visibility', 'hidden');
        },

        /**
         * @returns {undefined}
         */
        hideClone: function () {
            this.getCloneEl().hide();
            this.getSourceEl().css('visibility', 'visible');
        },

        /**
         * Refreshes the `Sticky`.
         *
         * @returns {undefined}
         */
        refresh: function () {
            var headerCellWidths = [];

            if (this.getCloneEl().is('table')) {
                //Get the width of each cell in the source element (a `thead`).
                this.getSourceEl().find('th').each(function () {
                    headerCellWidths.push(jQuery(this).width());
                });

                //Fix the width of each cell in the clone.  The cells in the clone won't naturally line-up with the
                //cells in the source because there won't be any content sizing them.
                this.getCloneEl().find('th').each(function (i) {
                    jQuery(this).width(headerCellWidths[i]);
                });
            }
        },

        /**
         * Builds the UI.
         *
         * @returns {undefined}
         */
        setUp: function () {
            this.hideClone();

            this.getCloneEl()
                .addClass('keepinsight-clone')
                .css({
                    position: 'fixed',
                    marginTop: 0,
                    zIndex: 808
                });

            this.refresh();
        },

        /**
         * @returns {undefined}
         */
        tearDown: function () {
            this.hideClone();
            this.getCloneEl().remove();
        },

        /**
         * Returns the height, in pixels, of the parent element.
         *
         * @returns {Number}
         */
        getParentHeight: function () {
            return this.getParentEl().outerHeight(false);
        },

        /**
         * Returns the height, in pixels, of the clone.
         *
         * @returns {Number}
         */
        getCloneHeight: function () {
            return this.getCloneEl().outerHeight(false);
        }
    };

    /**
     * A `Sticker` manages the sticking.
     *
     * @returns {Sticker}
     */
    function Sticker() {
        this.setItems([]);
        this.setMonitoring(false);
    }

    Sticker.prototype = {

        /**
         * @private
         * @param {Sticky[]} items
         * @returns {undefined}
         */
        setItems: function (items) {
            this.items = items;
        },

        /**
         * @private
         * @returns {Sticky[]}
         */
        getItems: function () {
            return this.items;
        },

        /**
         * @private
         * @param {Sticky} item
         * @returns {undefined}
         */
        addItem: function (item) {
            this.items.push(item);
        },

        /**
         * @private
         * @param {Function} callback
         * @returns {undefined}
         */
        eachItem: function (callback) {
            jQuery.each(this.getItems(), callback);
        },

        /**
         * @private
         * @returns {undefined}
         */
        destroyItems: function () {
            this.eachItem(function (ignore, item) {
                item.tearDown();
            });

            this.setItems([]);
        },

        /**
         * Convenience method that adds a new `Sticky`, created from the specified `jQuery`, to the array of items
         * managed by the `Sticker` and then makes the `Sticker` start monitoring, if necessary.
         *
         * @param {jQuery} $el
         * @returns {undefined}
         */
        addEl: function ($el) {
            this.addItem(Sticky.create($el));

            //Make sure the `Sticker` is monitoring.
            this.startMonitoring();
        },

        /**
         * @private
         * @param {Boolean} monitoring
         * @returns {undefined}
         */
        setMonitoring: function (monitoring) {
            this.monitoring = monitoring;
        },

        /**
         * @private
         * @returns {Boolean}
         */
        isMonitoring: function () {
            return this.monitoring;
        },

        /**
         * @private
         * @param {type} intervalId
         * @returns {undefined}
         */
        setIntervalId: function (intervalId) {
            this.intervalId = intervalId;
        },

        /**
         * @private
         * @return {type}
         */
        getIntervalId: function () {
            return this.intervalId;
        },

        /**
         * Makes the `Sticker` monitor the sticky items it knows about.
         *
         * @private
         * @returns {undefined}
         */
        startMonitoring: function () {
            if (this.isMonitoring()) {
                return;
            }

            var sticker = this,
                sticking = false,  //Not currently sticking elements.
                lastScrollTop,
                intervalId;  //The scroll-top the last time we attempted to stick elements.

            this.setMonitoring(true);

            jQuery(window).on('resize.keepInSight', function () {
                sticker.eachItem(function (ignore, item) {
                    item.refresh();
                });
            });

            intervalId = window.setInterval(function () {
                var scrollTop,
                    nextCloneTop = 0;

                //Help reduce the chances of weirdness caused by processing overlapping.
                if (sticking) {
                    return;
                }

                scrollTop = jQuery(window).scrollTop();

                //If the page is in the same position as before then we needn't do any heavy lifting.
                if (scrollTop === lastScrollTop) {
                    return;
                }

                sticking = true;
                lastScrollTop = scrollTop;

                sticker.eachItem(function (ignore, item) {
                    var currCloneHeight,
                        minItemScrollTop,
                        maxItemScrollTop;

                    currCloneHeight = item.getCloneHeight();

                    //The clone will appear sooner if `nextCloneTop` is non-zero (i.e. if at least one clone is already
                    //locked in place).  More specifically, it will appear just as the top of the source element touches
                    //the bottom of the last visible clone.
                    minItemScrollTop = item.getSourceEl().offset().top - nextCloneTop;

                    //Subtract the height of the clone so the clone disappears at the end of its parent.
                    maxItemScrollTop = minItemScrollTop + (item.getParentHeight() - currCloneHeight);

                    if (scrollTop >= minItemScrollTop && scrollTop < maxItemScrollTop) {
                        item.showClone(nextCloneTop);
                        nextCloneTop += currCloneHeight;
                    } else {
                        item.hideClone();
                    }
                });

                sticking = false;
            }, 10);

            this.setIntervalId(intervalId);
        },

        /**
         * @private
         * @returns {undefined}
         */
        stopMonitoring: function () {
            if (!this.isMonitoring()) {
                return;
            }

            jQuery(window).off('.keepInSight');

            window.clearInterval(this.getIntervalId());
            this.setIntervalId(undefined);

            this.setMonitoring(false);
        },

        /**
         * Turns off jquery-keepinsight on the current page.
         *
         * @returns {undefined}
         */
        destroyAction: function () {
            this.destroyItems();
            this.stopMonitoring();
        }
    };

    var sticker;

    sticker = new Sticker();

    jQuery.extend({

        keepInSight: function (action) {
            var methodName;

            methodName = action + 'Action';

            if (!(sticker[methodName] instanceof Function)) {
                throw 'The action ' + action + ' does not exist.';
            }

            return sticker[methodName]();
        }
    });

    jQuery.fn.extend({

        keepInSight: function () {
            return this.each(function () {
                sticker.addEl(jQuery(this));
            });
        }
    });
}());