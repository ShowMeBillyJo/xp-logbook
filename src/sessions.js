var Sessions = (function () {
    function _getSessions() {
        var s = Sheet.getSheet('Summary');
        var startRow = Sheet.getRange(s, 'Sessions').getRow();
        return Sheet.getRangeDisplayValues(s, 'Sessions',
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

    function _getSessionsWithXpSummaries() {
        var sessions = _getSessions();
        if (sessions.length == 0) return [];

        for (var i = 0; i < sessions.length; i++) {
            var session = sessions[i];
            session.xpSummary = _getSessionXpSummary(session.name);
        }
        return sessions;
    }

    function _getSessionXpLogStartRow(sessionName) {
        var values = Sheet.getRangeValues(Sheet.getSheet(sessionName), 'B1:G');
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

        var logs = Sheet
            .getRangeValues(Sheet.getSheet(sessionName), 'B' + startRow + ':G')
            .map(function (value, index) {
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
        var sessions = _getSessionsWithXpSummaries();
        if (sessions.length == 0) return;

        var sessionIndex = -1;
        for (var i = 0; i < sessions.length; i++) {
            var xpSummary = sessions[i].xpSummary;
            if (!!xpSummary && xpSummary.length > 0 && !xpSummary[0].xpToDate) {
                sessionIndex = i;
                break;
            }
        }
        if (sessionIndex != -1) _calculateXpToDateStartingAtSession(sessions, sessionIndex);
    }

    function recalculateAllXpToDate() {
        var sessions = _getSessionsWithXpSummaries();
        if (sessions.length == 0) return;

        _calculateXpToDateStartingAtSession(sessions, 0);
    }

    function _calculateXpToDateStartingAtSession(sessions, sessionIndex) {
        var players = _getPlayersForXpCalculations(sessions, sessionIndex);
        for (var i = sessionIndex; i < sessions.length; i++) {
            _calculateXpToDateForSession(sessions[i], players);
        }

        var s = Sheet.getSheet('Summary');
        for (var j = 0; j < players.length; j++) {
            var player = players[j];
            Sheet.getRange(s, 'D' + player._rowNum).setValue(player.totalXp);
        }
    }

    function _getPlayersForXpCalculations(sessions, sessionIndex) {
        var startingXpSummary = null;
        if (sessionIndex > 0) startingXpSummary = _getStartingXpSummaryForCalculations(sessions, sessionIndex);
        return Players.getPlayers().map(function (player) {
            var xpToDate = 0;
            if (!!startingXpSummary) {
                var playerXp = startingXpSummary.getPlayer(player.name);
                if (!!playerXp) xpToDate = playerXp.xpToDate;
            }
            return {
                _rowNum: player._rowNum,
                name: player.name,
                totalXp: xpToDate
            };
        });
    }

    function _getStartingXpSummaryForCalculations(sessions, sessionIndex) {
        var startingXpSummary = null;
        for (var i = sessionIndex - 1; i >= 0; i--) {
            var prevSession = sessions[i];
            var xpSummary = prevSession.xpSummary;
            if (!!xpSummary) {
                startingXpSummary = xpSummary;
                break;
            }
        }
        return startingXpSummary;
    }

    function _calculateXpToDateForSession(session, players) {
        var s = Sheet.getSheet(session.name);
        if (s == null) return;

        var xpSummary = session.xpSummary;
        if (!xpSummary || xpSummary.length == 0) return;

        var xpStartRow = _getSessionXpLogStartRow(session.name);
        Sheet.getRange(s, 'G' + xpStartRow + ':G').clearContent();

        for (var j = 0; j < players.length; j++) {
            var player = players[j];
            var playerXp = xpSummary.getPlayer(player.name);
            if (!playerXp) continue;
            player.totalXp += playerXp.sessionXp;
            Sheet.getRange(s, 'G' + playerXp._rowNum).setValue(player.totalXp);
        }
    }

    function createNewSessionSheets() {
        var templateSheet = Sheet.getSheet('Session Template');
        var sessions = _getSessions();
        sessions.forEach(function (session) {
            var s = Sheet.getSheet(session.name);
            if (s != null) return;

            var newS = Sheet.ss.insertSheet(session.name, 1, { template: templateSheet });
            var sessionMeta = _formatSessionMeta(session);
            Sheet.getRange(newS, 'B3').setValue(sessionMeta);
        });
    }

    function _formatSessionMeta(session) {
        var sessionMetaFormat = Db.getDb().getValue('Format', 'SessionMeta');
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