var Sheet = (function () {
    var _ss = SpreadsheetApp.getActiveSpreadsheet();
    var _s = _ss.getActiveSheet();

    function getSheet(sheetName) {
        return _ss.getSheetByName(sheetName);
    }

    function getRange(sheet, a1Reference) {
        if (!sheet) return null;
        return sheet.getRange(a1Reference);
    }

    function getRangeValues(sheet, a1Reference, mapCallback) {
        var range = getRange(sheet, a1Reference);
        if (!range) return [];
        return _filterAndMapValues(range.getValues(), mapCallback);
    }

    function getRangeDisplayValues(sheet, a1Reference, mapCallback) {
        var range = getRange(sheet, a1Reference);
        if (!range) return [];
        return _filterAndMapValues(range.getDisplayValues(), mapCallback);
    }

    function _filterAndMapValues(rawValues, mapCallback) {
        if (!rawValues) return [];
        var values = rawValues.filter(function (row) { return row[0] != ''; });
        if (!mapCallback || typeof mapCallback != 'function') return values;

        var mapped = values.map(mapCallback);
        mapped.getByName = function (name) { return this.filter(function (obj) { return obj.name == name; })[0]; };
        mapped.getNames = function () { return this.map(function (obj) { return obj.name; }); }
        return mapped;
    }

    return {
        ss: _ss,
        s: _s,
        getSheet: getSheet,
        getRange: getRange,
        getRangeValues: getRangeValues,
        getRangeDisplayValues: getRangeDisplayValues
    };
})();