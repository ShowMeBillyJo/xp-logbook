//(function () {
  function getDb() {
    var values = getRangeValues('Reference!ScriptDb');
    var kvps = values.map(function (row) {
      return {
        scope: row[0],
        key: row[1],
        value: row[2]
      };
    });
    kvps.getValue = function (scope, key) { return this.filter(function (kvp) { return kvp.scope == scope && kvp.key == key; })[0].value; };
    kvps.filterByScope = function (scope) {
      var byScope = this.filter(function (kvp) { return kvp.scope == scope; });
      byScope.getValue = function (key) { return this.filter(function (kvp) { return kvp.key == key; })[0].value; };
      return byScope;
    };
    return kvps;
  }

//  return {
//  };
//})();