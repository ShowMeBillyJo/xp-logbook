//(function () {
  function getSessions() {
    return getRangeValues('Summary!Sessions',
      function (row) {
        return {
          name: row[0],
          title: row[1],
          num: row[2],
          date: row[3],
          igDate: row[4]
        };
      });
  }

  function getSessionXpLogs(sessionName) {
    var values = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sessionName).getRange("B1:G").getValues();
    var accumulate = false;
    var logs = [];
    for (var i = 2; i < values.length; i++) {
      if (accumulate) {
        var value = values[i];
        if (value[0] == '') break;
        logs.push({
          playerName: value[0],
          source: value[1],
          earned: value[3],
          sessionXp: value[4],
          xpToDate: value[5]
        });
      }
      else if (values[i - 2][0] == 'XP Logs' && values[i - 1][0] == 'Player')
        accumulate = true;
    }
    logs.filterByPlayer = function (playerName) { return this.filter(function (log) { return log.playerName == playerName; }); };
    return logs;
  }

  function getSessionXpSummary(sessionName) {
    var logs = getSessionXpLogs(sessionName);
    var summary = logs
      .filter(function (log) { return log.source == "Totals"; })
      .map(function (log) {
        return {
          playerName: log.playerName,
          sessionXp: log.sessionXp,
          xpToDate: log.xpToDate
        };
    });
    summary.getPlayer = function (playerName) { return this.filter(function (log) { return log.playerName == playerName; })[0]; };
    return summary;
  }

  function formatSessionMeta(sessionName) {
    var db = getDb();
    var dateFormat = db.getValue('Format', 'Date');
    var sessionMetaFormat = db.getValue('Format', 'SessionMeta').replace('\\n', '\n');

    var session = getSessions().getByName(sessionName);
    var sessionMeta = sessionMetaFormat
      .replace('{{ID}}', session.num)
      .replace('{{DATE}}', Utilities.formatDate(session.date, 'GMT', dateFormat))
      .replace('{{VOLCH}}', sessionName)
      .replace('{{TITLE}}', session.title);
    return sessionMeta;
  }

//  return {
//  };
//})();