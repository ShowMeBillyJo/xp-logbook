//(function () {
  function createNewSessionSheets() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var templateSheet = ss.getSheetByName('Session Template');

    var sessions = getSessions();
    sessions.forEach(function (session) {
      var s = ss.getSheetByName(session.name);
      if (s != null) return;

      var newS = ss.insertSheet(session.name, 2, {template: templateSheet});

      //var evtRow = 7;
      //newS.getRange('B4').setValue('IG Date(s) (Imperial): ' + session.igDate);
      //events.forEach(function (event) {
      //  if (event[0] == session.name && event[1] != 'Subtotal') {
      //    newS.getRange('B' + evtRow).setValue(event[1]);
      //    newS.getRange('G' + evtRow).setValue(event[2]);
      //    evtRow++;
      //  }
      //});
    });
  }

//  return {
//  };
//})();