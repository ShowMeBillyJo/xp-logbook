var Players = (function () {
    function getPlayers() {
        var s = Sheet.getSheet('Summary');
        var startRow = Sheet.getRange(s, 'Players').getRow();
        return Sheet.getRangeValues(s, 'Players',
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
        getPlayers: getPlayers
    };
})();