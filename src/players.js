//(function () {
  function getPlayers() {
    return getRangeValues('Summary!Players',
      function (row) {
        return {
          name: row[0],
          characterName: row[1],
          totalXp: row[2]
        };
      });
  }

  function getPlayerXpToDate(playerName) {
    var xpToDate = 0;
    var sessions = getSessions();
    var currentSessionName = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName();
    var currentSessionIndex = sessions.getNames().indexOf(currentSessionName);

    if (currentSessionName == "Summary") {
      currentSessionIndex = sessions.length;
    }
    else {
      xpToDate = getSessionXpSummary(currentSessionName).getPlayer(playerName).sessionXp;
      if (currentSessionIndex == 0) return xpToDate;
    }

    for (var i = currentSessionIndex - 1; i >= 0; i--) {
      var s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sessions[i].name);
      if (s == null) continue;

      var xpSummary = getSessionXpSummary(sessions[i].name);
      if (xpSummary == null) continue;

      var player = xpSummary.getPlayer(playerName);
      if (player == null) continue;

      xpToDate += player.xpToDate;
      break;
    }
    return xpToDate > 0 ? xpToDate : "";
  }

//  return {
//  };
//})();