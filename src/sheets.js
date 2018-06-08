var Sheet = (function () {
    function _getSheetName() {
        return SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName();
    }

    function getRangeValues(reference, mapCallback) {
        return _getValues(SpreadsheetApp.getActiveSpreadsheet().getRange(reference).getValues(), mapCallback);
    }

    function getRangeDisplayValues(reference, mapCallback) {
        return _getValues(SpreadsheetApp.getActiveSpreadsheet().getRange(reference).getDisplayValues(), mapCallback);
    }

    function _getValues(rawValues, mapCallback) {
        var values = rawValues.filter(function (row) { return row[0] != ''; });
        if (mapCallback == null || typeof mapCallback != 'function') return values;

        var mapped = values.map(mapCallback);
        mapped.getByName = function (name) { return this.filter(function (obj) { return obj.name == name; })[0]; };
        mapped.getNames = function () { return this.map(function (obj) { return obj.name; }); }
        return mapped;
    }

    return {
        getRangeValues: getRangeValues,
        getRangeDisplayValues: getRangeDisplayValues
    };
})();