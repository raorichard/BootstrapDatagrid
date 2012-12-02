/*
 * Fuel UX Data components - static data source
 * https://github.com/ExactTarget/fuelux-data
 *
 * Copyright (c) 2012 ExactTarget
 * Licensed under the MIT license.
 *
 *
 *
 */

itemToJS = function(collection, item) {
    var js = {};
    if (item && collection) {
        var attributes = collection.getAttributes(item);
        if (attributes && attributes.length > 0) {
            var i;
            for (i = 0; i < attributes.length; i++) {
                var values = collection.getValues(item, attributes[i]);
                if (values) {
                    if (values.length > 1) {
                        var j;
                        js[attributes
                            [i]] = [];
                        for (j = 0; j < values.length; j++) {
                            var value = values[j];
                            if (collection.isItem(value)) {
                                js[attributes
                                    [i]].push(itemToJS(collection, value));
                            } else {
                                js[attributes
                                    [i]].push(value);
                            }
                        }
                    } else { if (collection.isItem(values[0])) {
                        js[attributes
                            [i]] = itemToJS(collection, values[0]);
                    } else {
                        js[attributes
                            [i]] = values[0];
                    }
                    }
                }
            }
        }
    }
    return js;
};

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['underscore'], factory);
    } else {
        root.JSONDataSource = factory();
    }

}(this, function () {

    var JSONDataSource = function (options) {
        this._formatter = options.formatter;
        this._columns = options.columns;
        this._delay = options.delay || 0;
        this._data = options.data;
        this._is_dirty = false;
    };

    JSONDataSource.prototype = {

        is_dirty: function () {
            return this._is_dirty;
        },

        modified_data: function (obj) {
            // ...
        },

        columns: function () {
            return this._columns;
        },

        data: function (options, callback) {
            var self = this;

            setTimeout(function () {
                var data = $.extend(true, [], self._data);

                // SEARCHING
                if (options.search) {
                    data = _.filter(data, function (item) {
                        for (var prop in item) {
                            if (!item.hasOwnProperty(prop)) continue;
                            if (~item[prop].toString().toLowerCase().indexOf(options.search.toLowerCase())) return true;
                        }
                        return false;
                    });
                }

                var count = data.length;

                // SORTING
                if (options.sortProperty) {
                    data = _.sortBy(data, options.sortProperty);
                    if (options.sortDirection === 'desc') data.reverse();
                }

                // PAGING
                var startIndex = options.pageIndex * options.pageSize;
                var endIndex = startIndex + options.pageSize;
                var end = (endIndex > count) ? count : endIndex;
                var pages = Math.ceil(count / options.pageSize);
                var page = options.pageIndex + 1;
                var start = startIndex + 1;

                data = data.slice(startIndex, endIndex);

                if (self._formatter) self._formatter(data);

                callback({ data: data, start: start, end: end, count: count, pages: pages, page: page });

            }, this._delay)
        }
    };

    return JSONDataSource;
}));