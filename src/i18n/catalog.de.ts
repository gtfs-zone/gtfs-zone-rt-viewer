import type { Translation } from 'gtfs-zone-web-common/i18n/index';
import type { en } from './catalog.en';

/** viz.rt.gtfs.zone's UI strings, in German. */
export const de: Translation<typeof en> = {
  'app.title':
    'viz.rt.gtfs.zone - Schneller, kostenloser Open-Source-Viewer für GTFS Realtime',
  'app.alertTitle': 'Betriebsmeldung {label} | viz.rt.gtfs.zone',
  'app.noWebgl':
    'Die Karte benötigt WebGL, das in diesem Browser deaktiviert ist oder nicht unterstützt wird.',

  'shell.refreshRate': 'Aktualisierungsintervall der Echtzeitdaten',
  'shell.noFeed': 'Kein Feed geladen',
  'shell.browse': 'Durchsuchen',
  'shell.alerts': 'Meldungen',
  'shell.alertsAria': 'Betriebsmeldungen',
  'shell.help': 'Hilfe',
  'shell.seconds': '{n} s',

  'nav.reload': 'Feed neu laden',
  'nav.edit': 'Fahrplan in edit.gtfs.zone bearbeiten',
  'nav.alerts': 'Betriebsmeldungen',
  'nav.theme': 'Design wechseln',
  'nav.guide': 'Anleitung',
  'nav.load': 'Laden',

  'shortcut.openLoad': 'Dialog zum Laden eines Feeds öffnen',
  'shortcut.focusSearch': 'Zur Kartensuche springen',
  'shortcut.clearSearch': 'Suche leeren',
  'shortcut.showGuide': 'Anleitung anzeigen',

  'load.loaded': '{label} geladen',
  'load.reloaded': '{label} neu geladen',
  'load.cancelled': 'Laden abgebrochen',
  'load.cancelledNotice': 'Laden abgebrochen.',
  'load.failed': 'Laden von {label} fehlgeschlagen: {reason}',
  'load.failedNotice': '{label} konnte nicht geladen werden: {reason}',
  'load.reloadFailed': 'Neuladen von {label} fehlgeschlagen: {reason}',
  'load.incomplete': 'Die Auswahl ist unvollständig',
  'load.linkedFeed': 'Verlinkter Feed',
  'load.partialLink':
    'Dieser Link bezeichnet nur einen Teil eines Feeds: {missing}.',
  'load.decodeFailed': 'Dekodierung fehlgeschlagen: {message}',

  'crumb.feed': 'Feed',
  'crumb.noFeed': 'Kein Feed',
  'crumb.more': '{name} +{count} weitere',
  'crumb.vehicle': 'Fahrzeug',
  'crumb.alert': 'Betriebsmeldung',

  'alerts.title': 'Betriebsmeldungen',
  'alerts.close': 'Schließen',
  'alerts.none': 'Keine Betriebsmeldungen.',
  'alerts.activeOf': '{active} von {total} im Feed aktiv.',
  'alerts.fallback': 'Meldung {id}',
  'alerts.active': 'aktiv',
  'alerts.notActive': 'inaktiv',

  'time.secondsAgo': 'vor {s} s',
  'time.minutesAgo': 'vor {m} min {s} s',
  'time.hoursAgo': 'vor {h} h {m} min',
  'time.now': 'jetzt',
  'time.seconds': '{s} s',

  'status.notSet': 'nicht gesetzt',
  'status.viaProxy': 'über cors.kcfam.us',
  'status.localUrl':
    'Lokale URL: CORS-Proxy nicht verwendet (er kann diesen Rechner nicht erreichen)',
  'status.counts': 'Anzahlen',
  'status.stops': 'Haltestellen',
  'status.routes': 'Linien',
  'status.trips': 'Fahrten',
  'status.shapes': 'Linienverläufe',
  'status.agencies': 'Verkehrsunternehmen',
  'status.services': 'Verkehrstage',
  'status.stopTimes': 'Haltezeiten',
  'status.vehicles': 'Fahrzeuge',
  'status.tripUpdates': 'Fahrtaktualisierungen',
  'status.alerts': 'Meldungen',
  'status.never': 'nie',
  'status.notReported': 'nicht angegeben',
  'status.error': 'Fehler',
  'status.lastFetched': 'Zuletzt abgerufen',
  'status.feedTimestamp': 'Zeitstempel des Feeds',
  'status.dataAge': '(Alter der Daten)',
  'status.entities': 'Entitäten',
  'status.nextRefresh': 'Nächste Aktualisierung',
  'status.errorAt': 'um {time}',
  'status.idTrip': 'abgeleitet aus vehicle.id + trip_id + start_date',
  'status.idEntity': 'abgeleitet aus vehicle.id + trip + entity.id',
  'status.idIndex':
    'keine brauchbare Kennung: abgeleitet aus dem Index der Entität',
  'status.empty': '(leer)',
  'status.dupVehicles_one': '{count} Fahrzeug',
  'status.dupVehicles_other': '{count} Fahrzeuge',
  'status.idNotUnique': 'vehicle.id ist nicht je Fahrzeug eindeutig',
  'status.idNotUniqueText':
    'GTFS-RT legt fest, dass {field} „should be unique per vehicle, and is used for tracking the vehicle as it proceeds through the system“. Dieser Feed verwendet es mehrfach, daher wurde ein Instanzschlüssel ({strategy}) abgeleitet, um die Fahrzeuge zu unterscheiden.',
  'status.endpoints': 'Echtzeit-Endpunkte',
  'status.uploaded':
    'Aus der hochgeladenen Datei {name} geladen: nicht per Link reproduzierbar.',
  'status.scheduled': 'Fahrplanfeed',
  'status.gapsOptional':
    'GTFS-RT macht dieses Feld optional: {missing} von {total} Fahrzeugen geben es nicht an.',
  'status.gapsStopId':
    '{count} haben die Haltestelle stattdessen über {field} angegeben, was die Spezifikation ebenso erlaubt; ihre Position ergibt sich daraus.',
  'status.gapsDerived':
    '{count} haben keine Haltestelle angegeben: Verwendet wurde die nächste noch ausstehende {field} derselben Fahrt; sie sind überall, wo sie erscheinen, als „abgeleitet“ markiert.',
  'status.gapsUnplaced':
    '{count} konnten auf keine dieser Arten platziert werden und bleiben in der Liste der nicht platzierten Fahrzeuge im Linienbanner.',
  'status.gaps': 'Lücken in den Feed-Daten',
  'status.gapsNeutral': 'Wie dieser Feed die Position angibt',
  'status.gapsRow': 'Fahrzeuge ohne {field}',
  'status.relVehicles_one': '{count} Fahrzeug meldet die Fahrt als {label}',
  'status.relVehicles_other': '{count} Fahrzeuge melden die Fahrt als {label}',
  'status.relUpdates_one':
    '{count} Fahrtaktualisierung meldet die Fahrt als {label}',
  'status.relUpdates_other':
    '{count} Fahrtaktualisierungen melden die Fahrt als {label}',
  'status.relStopTimes_one': '{count} Haltezeit meldet {label}',
  'status.relStopTimes_other': '{count} Haltezeiten melden {label}',
  'status.relTitle': 'Fahrten außerhalb des Fahrplans',
  'status.relNote':
    'Dies sind Angaben des Feeds zu bestimmten Fahrten, keine Lücken in dem, was er übermittelt hat. CANCELED und SKIPPED bedeuten, dass die angezeigten Fahrplanzeiten von niemandem genutzt werden können.',
  'status.mapIssues': 'Probleme mit den Kartendaten',
  'status.stopsNoId': 'Verworfene Haltestellen (ohne stop_id)',
  'status.stopsNoIdNote': 'Können weder gezeichnet noch verknüpft werden.',
  'status.stopsNoCoords': 'Verworfene Haltestellen (ohne Koordinaten)',
  'status.stopsNoCoordsNote': 'stop_lat / stop_lon fehlen oder sind unlesbar.',
  'status.vehiclesUnmatched': 'Fahrzeuge ohne passende Linie',
  'status.vehiclesUnmatchedNote':
    'In der neutralen Farbe statt in einer Linienfarbe gezeichnet.',
  'status.vehiclesCollapsed':
    'Zu einem Kartenobjekt zusammengefasste Fahrzeuge',
  'status.vehiclesCollapsedNote':
    'Sollte 0 sein; ein Wert ungleich null bedeutet, dass die Ableitung des Fahrzeugschlüssels fehlerhaft ist.',
  'status.stationIssues': 'Probleme in der Stationshierarchie',
  'status.danglingParent':
    'parent_station verweist auf eine fehlende Haltestelle',
  'status.danglingParentNote':
    'Die angegebene übergeordnete Station ist nicht in stops.txt enthalten.',
  'status.wrongParent': 'parent_station verweist auf einen falschen Typ',
  'status.wrongParentNote':
    'Ein Bahnsteig, Zugang oder Knoten muss auf eine Station verweisen, ein Einstiegsbereich auf einen Bahnsteig.',
  'status.cycle': 'Haltestellen in einem parent_station-Zyklus',
  'status.cycleNote':
    'Die Verfolgung wird abgebrochen, um eine Endlosschleife zu vermeiden.',
  'status.padded': 'Von Leerzeichen umgebene Spalten',
  'status.paddedNote':
    '{rows} Zeilen hatten Leerzeichen am Anfang oder Ende. Die GTFS-Referenz verbietet das; sie wurden entfernt. Andernfalls würde keine Echtzeit-{column} zu diesem Feed passen.',
  'status.metadata': 'Metadaten des Feeds',
  'status.share': 'Teilen',
  'status.copyLink': 'Link zum Teilen kopieren',
  'status.shareNote':
    'Der Link enthält die URLs beider Feeds und das ausgewählte Element.',
  'status.shareFile':
    'In dieser Sitzung wurde ein Fahrplanfeed aus einer hochgeladenen Datei geladen, die ein Link nicht reproduzieren kann.',
  'status.emptyNote':
    'Eine Sitzung benötigt einen GTFS-Fahrplanfeed für Linien und Haltestellen und mindestens einen Echtzeit-Endpunkt für das, was dort gerade geschieht.',
  'status.pickFeed': 'Feed auswählen',
  'status.copied': 'Link kopiert',
  'status.copyFailed': 'Kopieren in die Zwischenablage nicht möglich',

  'vehicle.notReported': 'nicht angegeben',
  'vehicle.seqFromStopId':
    'stop_id {stop} ist die stop_sequence {sequence} dieser Fahrt',
  'vehicle.seqDerived': '{sequence} aus den Fahrtaktualisierungen abgeleitet',
  'vehicle.route': 'Linie',
  'vehicle.notInSchedule': 'Fahrt nicht im Fahrplan',
  'vehicle.noRouteId': 'keine route_id angegeben',
  'vehicle.trip': 'Fahrt',
  'vehicle.noTripId': 'Keine trip_id angegeben.',
  'vehicle.at': 'bei',
  'vehicle.headsign': 'Ziel',
  'vehicle.currently': 'Derzeit {status}',
  'vehicle.progress': 'Fortschritt',
  'vehicle.progressValue': '{n} von {total} Haltestellen',
  'vehicle.tripStart': 'Beginn der Fahrt',
  'vehicle.predictions': 'Prognosen',
  'vehicle.noPredictions':
    'Keine Fahrtaktualisierung im Feed passt zu dieser Fahrt.',
  'vehicle.seq': 'Nr.',
  'vehicle.stop': 'Haltestelle',
  'vehicle.missing': 'Fahrzeug {id} ist nicht im aktuellen Echtzeit-Feed.',
  'vehicle.sharedId':
    'Im Feed bezeichnet {field} {id} {count} Fahrzeuge. GTFS-RT legt fest, dass {descriptor} „should be unique per vehicle“; dieser Feed verwendet sie mehrfach.',
  'vehicle.sharedIdTrip':
    'Diese Instanz unterscheidet sich durch die Fahrt {trip}.',
  'vehicle.sharedIdTripDate':
    'Diese Instanz unterscheidet sich durch die Fahrt {trip} am {date}.',
  'vehicle.gone':
    'Seit {time} nicht mehr im Feed. Alle folgenden Angaben stammen aus dem letzten Abruf, der es enthielt.',
  'vehicle.live': 'Live',
  'vehicle.position': 'Position',
  'vehicle.bearing': 'Kurs',
  'vehicle.speed': 'Geschwindigkeit',
  'vehicle.speedValue': '{speed} m/s',
  'vehicle.status': 'Status',
  'vehicle.occupancy': 'Auslastung',
  'vehicle.timestamp': 'Zeitstempel',
  'vehicle.emptyId': 'leer im Feed',
  'vehicle.entityId': 'Entitäts-ID im Feed',
  'vehicle.alerts': 'Meldungen',
  'vehicle.raw': 'VehiclePosition (dekodiert)',

  'help.welcome.label': 'Willkommen',
  'help.welcome.title': 'Willkommen bei viz.rt.gtfs.zone',
  'help.welcome.lede':
    'viz.rt.gtfs.zone zeigt einen GTFS-Realtime-Feed auf einer Live-Karte an. Jeder Feed wird in Ihrem Browser abgerufen und dekodiert. Nichts, was Sie laden, wird irgendwohin gesendet.',
  'help.welcome.load': 'Feed laden',
  'help.welcome.loadText':
    'Geben Sie einen GTFS-Fahrplanfeed und seine Echtzeit-Feeds an.',
  'help.welcome.watch': 'Fahrzeuge verfolgen',
  'help.welcome.watchText':
    'Die Positionen werden auf der Karte alle paar Sekunden aktualisiert.',
  'help.welcome.predict': 'Prognosen prüfen',
  'help.welcome.predictText':
    'Die Ankunftsprognosen und die Verspätung jeder Fahrt.',
  'help.welcome.disrupt': 'Störungen erkennen',
  'help.welcome.disruptText':
    'Aktuelle Betriebsmeldungen werden neben den Linien angezeigt.',
  'help.welcome.start': 'Los geht’s!',

  'help.about.blurb':
    'viz.rt.gtfs.zone zeigt einen GTFS-Realtime-Feed auf einer Live-Karte an.',
  'help.about.blurb2':
    'GTFS Realtime veröffentlicht ein Verkehrsunternehmen neben seinem Fahrplan, um mitzuteilen, wo seine Fahrzeuge gerade sind, wie verspätet jede Fahrt ist und was gestört ist. Geben Sie einen GTFS-Fahrplanfeed und seine Echtzeit-Feeds an, und die Karte zeichnet den Rest:',
  'help.about.routes': 'Die Linien und Haltestellen aus dem Fahrplan',
  'help.about.vehicles':
    'Die Fahrzeuge, die sie befahren, alle paar Sekunden aktualisiert',
  'help.about.predictions': 'Die Ankunftsprognosen an jeder Haltestelle',
  'help.about.alerts': 'Die aktuellen Betriebsmeldungen',
  'help.about.footer':
    'Jeder Feed wird in Ihrem Browser abgerufen und dekodiert. Nichts, was Sie laden, wird irgendwohin gesendet.',
  'help.about.subject': 'Feedback zu viz.rt.gtfs.zone',
  'help.about.sibling':
    'GTFS-Fahrplanfeeds im Browser erstellen und bearbeiten',

  'help.mapKey.label': 'Legende',
  'help.mapKey.title': 'Legende',
  'help.mapKey.unlocated': 'Übernimmt den Standort seiner Station',
  'help.mapKey.routes': 'Linien und Fahrzeuge',
  'help.mapKey.route': 'Linie (Farbe aus dem Feed oder zugewiesene Farbe)',
  'help.mapKey.direction': 'Fahrtrichtung auf der ausgewählten Linie',
  'help.mapKey.vehicle': 'Fahrzeug',
  'help.mapKey.heading': 'Fahrzeug mit bekanntem Kurs',
  'help.mapKey.unmatched':
    'Fahrzeug, dessen Linie nicht ermittelt werden konnte',
};
