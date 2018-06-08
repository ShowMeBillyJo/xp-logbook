var Sessions = (function () {
    function _getSessions() {
        var startRow = SpreadsheetApp.getActiveSpreadsheet().getRange('Summary!Sessions').getRow();
        return Sheet.getRangeDisplayValues('Summary!Sessions',
            function (row, index) {
                return {
                    _rowNum: startRow + index,
                    name: row[0],
                    title: row[1],
                    num: row[2],
                    date: row[3]
                };
            });
    }

    function _getSessionXpLogStartRow(sessionName) {
        var values = SpreadsheetApp.getActiveSpreadsheet().getRange(sessionName + '!B1:G').getValues();
        var startRow = -1;
        for (var i = 2; i < values.length; i++) {
            if (values[i - 2][0] == 'XP Logs' && values[i - 1][0] == 'Player') {
                startRow = i + 1;
                break;
            }
        }
        return startRow;
    }

    function _getSessionXpLogs(sessionName) {
        var startRow = _getSessionXpLogStartRow(sessionName);
        if (startRow == -1) return [];

        var logs = Sheet.getRangeValues(sessionName + '!B' + startRow + ':G').map(function (value, index) {
            return {
                _rowNum: startRow + index,
                playerName: value[0],
                source: value[1],
                earned: value[3],
                sessionXp: value[4],
                xpToDate: value[5]
            };
        });
        logs.filterByPlayer = function (playerName) { return this.filter(function (log) { return log.playerName == playerName; }); };
        return logs;
    }

    function _getSessionXpSummary(sessionName) {
        var logs = _getSessionXpLogs(sessionName);
        var summary = logs
            .filter(function (log) { return log.source == 'Totals'; })
            .map(function (log) {
                return {
                    _rowNum: log._rowNum,
                    playerName: log.playerName,
                    sessionXp: log.sessionXp,
                    xpToDate: log.xpToDate
                };
            });
        summary.getPlayer = function (playerName) { return this.filter(function (log) { return log.playerName == playerName; })[0]; };
        return summary;
    }

    function calculateNewSessionXpToDate() {
        var sessions = _getSessions();
        if (sessions.length == 0) return;

        var sessionIndex = -1;
        for (var i = 0; i < sessions.length; i++) {
            var xpSummary = _getSessionXpSummary(sessions[i].name);
            if (xpSummary == null) {
                sessionIndex = i;
                break;
            }
        }
        if (sessionIndex != -1) _calculateXpToDateStartingAtSession(sessions, sessionIndex);
    }

    function recalculateAllXpToDate() {
        var sessions = _getSessions();
        if (sessions.length == 0) return;

        _calculateXpToDateStartingAtSession(sessions, 0);
    }

    function _calculateXpToDateStartingAtSession(sessions, sessionIndex) {
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var players = Players.getPlayers().map(function (player) {
            return {
                name: player.name,
                totalXp: 0
            };
        });

        for (var i = sessionIndex; i < sessions.length; i++) {
            var session = sessions[i];
            var s = ss.getSheetByName(session.name);
            if (s == null) continue;

            var xpSummary = _getSessionXpSummary(session.name);
            if (xpSummary == null) continue;

            var xpStartRow = _getSessionXpLogStartRow(session.name);
            s.getRange('G' + xpStartRow + ':G').clearContent();

            for (var j = 0; j < players.length; j++) {
                var player = players[j];
                var playerXp = xpSummary.getPlayer(player.name);
                if (playerXp == null) continue;
                player.totalXp += playerXp.sessionXp;
                s.getRange('G' + playerXp._rowNum).setValue(player.totalXp);
            }
        }

        var s = ss.getSheetByName('Summary');
        for (var j = 0; j < players.length; j++) {
            var player = players[j];
            s.getRange('D' + player._rowNum).setValue(player.totalXp);
        }
    }

    function createNewSessionSheets() {
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var templateSheet = ss.getSheetByName('Session Template');

        var sessions = _getSessions();
        sessions.forEach(function (session) {
            var s = ss.getSheetByName(session.name);
            if (s != null) return;

            ss.insertSheet(session.name, 2, { template: templateSheet });
            var sessionMeta = _formatSessionMeta(session);
            newS.getRange('B3').setValue(sessionMeta);
        });
    }

    function _formatSessionMeta(session) {
        var db = Db.getDb();
        var sessionMetaFormat = db.getValue('Format', 'SessionMeta');
        return sessionMetaFormat
            .replace('{{NAME}}', session.name)
            .replace('{{TITLE}}', session.title)
            .replace('{{NUM}}', session.num)
            .replace('{{DATE}}', session.date);
    }

    return {
        calculateNewSessionXpToDate: calculateNewSessionXpToDate,
        recalculateAllXpToDate: recalculateAllXpToDate,
        createNewSessionSheets: createNewSessionSheets
    };
})();