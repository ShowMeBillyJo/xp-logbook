var Db = (function () {
    function getDb() {
        var values = Sheet.getRangeValues('Reference!ScriptDb');
        var rows = values.map(function (row) {
            return {
                scope: row[0],
                key: row[1],
                value: row[2]
            };
        });
        rows.getValue = function (scope, key) { return this.filter(function (row) { return row.scope == scope && row.key == key; })[0].value; };
        rows.filterByScope = function (scope) {
            var rows = this.filter(function (row) { return row.scope == scope; });
            rows.getValue = function (key) { return this.filter(function (row) { return row.key == key; })[0].value; };
            return rows;
        };
        return rows;
    }

    return {
        getDb: getDb
    };
})();