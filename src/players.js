var Players = (function () {
    function _getPlayers() {
        var startRow = SpreadsheetApp.getActiveSpreadsheet().getRange('Summary!Players').getRow();
        return Sheet.getRangeValues('Summary!Players',
            function (row, index) {
                return {
                    _rowNum: startRow + index,
                    name: row[0],
                    characterName: row[1],
                    totalXp: row[2]
                };
            });
    }

    return {
    };
})();