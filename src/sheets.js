//(function () {
  function getSheetName() {
    return SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName();
  }

  function getRangeValues(reference, mapCallback) {
    var values = SpreadsheetApp.getActiveSpreadsheet().getRange(reference).getValues()
      .filter(function (row) { return row[0] != ''; });
    if (mapCallback == null || typeof mapCallback != 'function') return values;

    var mapped = values.map(mapCallback);
    mapped.getByName = function (name) { return this.filter(function (obj) { return obj.name == name; })[0]; };
    mapped.getNames = function () { return this.map(function (obj) { return obj.name; }); }
    return mapped;
  }

//  return {
//  };
//})();