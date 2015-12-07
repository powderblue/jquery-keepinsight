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
     * @param {Object} config
     * @returns {Sticky}
     */
    function Sticky($source, $parent, $clone, config) {
        this.setSourceEl($source);
        this.setParentEl($parent);
        this.setCloneEl($clone);

        this.setConfig(jQuery.extend({
            edge: Sticky.EDGE_TOP
        }, config));
    }

    Sticky.EDGE_TOP = 'top';

    Sticky.EDGE_BOTTOM = 'bottom';

    /**
     * Creates a new `Sticky` from the specified source element.
     *
     * @param {jQuery} $source
     * @param {Object} config
     * @returns {Sticky}
     */
    Sticky.create = function ($source, config) {
        var $container,
            $clone,
            sticky;

        if (config.$container instanceof jQuery) {
            $container = config.$container;
        } else {
            $container = $source.closest('table, body');

            if ($container.is('table') && !$source.is('thead')) {
                throw 'The table component is not a `thead`.';
            }

            //Tables must be handled differently to prevent us making a mess of the page.
            if ($container.is('table')) {
                $clone = $container.clone()
                    .find('tbody')
                        .remove()
                    .end()
                    .insertAfter($container);
            }
        }

        if (!$clone) {
            //How we usually create our clones.
            $clone = $source.clone().insertAfter($source);
        }

        sticky = new Sticky($source, $container, $clone, config);
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
         * @private
         * @param {Object} config
         * @return undefined
         */
        setConfig: function (config) {
            this.config = config;
        },

        /**
         * @returns {Object}
         */
        getConfig: function () {
            return this.config;
        },

        /**
         * Shows the clone at the specified *y* pixel-position.
         *
         * @param {String} originName  Either `top` or `bottom`.
         * @param {Number} offset
         * @returns {undefined}
         */
        showClone: function (originName, offset) {
            var css;

            css = {
                left: this.getSourceEl().css('left'),
                width: this.getSourceEl().css('width')
            };

            css[originName] = String(offset) + 'px';

            this.getCloneEl()
                .css(css)
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
                //cells in the source because there won't be any table content sizing them.
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
         * @returns {undefined}
         */
        startMonitoring: function () {
            if (this.isMonitoring()) {
                return;
            }

            var sticker = this,
                sticking = false,  //Not currently sticking elements.
                lastScrollTop,  //The scroll-top the last time we attempted to stick elements.
                intervalId;

            this.setMonitoring(true);

            jQuery(window).on('resize.keepInSight', function () {
                sticker.eachItem(function (ignore, item) {
                    item.refresh();
                });
            });

            intervalId = window.setInterval(function () {
                var scrollTop,
                    topNextCloneOffset = 0,
                    scrollBottom,
                    bottomNextCloneOffset = 0;

                //Help reduce the chances of weirdness caused by processing overlapping.
                if (sticking) {
                    return;
                }

                scrollTop = jQuery(window).scrollTop();

                //If the page is in the same position as before then we needn't do any heavy lifting.
                if (scrollTop === lastScrollTop) {
                    return;
                }

                lastScrollTop = scrollTop;

                sticking = true;

                scrollBottom = scrollTop + jQuery(window).height();

                sticker.eachItem(function (ignore, item) {
                    var currCloneHeight,
                        minItemScrollTop,
                        maxItemScrollTop,
                        itemConfig,
                        itemOffset,
                        minItemScrollBottom,
                        maxItemScrollBottom;

                    itemConfig = item.getConfig();
                    itemOffset = item.getSourceEl().offset();
                    currCloneHeight = item.getCloneHeight();

                    if (itemConfig.edge === Sticky.EDGE_TOP) {
                        //The clone will appear sooner if `topNextCloneOffset` is non-zero (i.e. if at least one clone
                        //is already locked in place).  More specifically, it will appear just as the top of the source
                        //element touches the bottom of the last visible clone.
                        minItemScrollTop = itemOffset.top - topNextCloneOffset;

                        //Subtract the height of the clone so the clone disappears at the end of its parent.
                        maxItemScrollTop = minItemScrollTop + (item.getParentHeight() - currCloneHeight);

                        if (scrollTop >= minItemScrollTop && scrollTop < maxItemScrollTop) {
                            item.showClone('top', topNextCloneOffset);
                            topNextCloneOffset += currCloneHeight;
                        } else {
                            item.hideClone();
                        }
                    } else if (itemConfig.edge === Sticky.EDGE_BOTTOM) {
                        minItemScrollBottom = item.getParentEl().offset().top + currCloneHeight;
                        maxItemScrollBottom = itemOffset.top + currCloneHeight;

                        if (scrollBottom >= minItemScrollBottom && scrollBottom <= maxItemScrollBottom) {
                            item.showClone('bottom', bottomNextCloneOffset);
                            bottomNextCloneOffset += currCloneHeight;
                            scrollBottom -= bottomNextCloneOffset;
                        } else {
                            item.hideClone();
                        }
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

        /**
         * Executes actions that apply to the sticker or to all stickies.
         *
         * @param {String} action
         * @return {variant}
         */
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

        /**
         * Makes the selected elements stay in sight.
         *
         * @param {Object} [config]
         * @returns {jQuery}
         */
        keepInSight: function (config) {
            return this.each(function () {
                var sticky;

                sticky = Sticky.create(jQuery(this), config || {});
                sticker.addItem(sticky);

                //Make sure the `Sticker` is monitoring.
                sticker.startMonitoring();
            });
        }
    });
}());