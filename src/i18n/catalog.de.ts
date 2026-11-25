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
  'nav.load': 'Laden',

  'shortcut.openLoad': 'Dialog zum Laden eines Feeds öffnen',
  'search.vehicles': 'Fahrzeuge',

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
  'load.restored':
    '{label} aus der in diesem Browser gespeicherten Kopie geöffnet',
  'load.reloadedUnchanged':
    'Der Fahrplan von {label} ist unverändert; aus der gespeicherten Kopie wiederhergestellt',
  'load.storedGone':
    'Dieser gespeicherte Feed ist nicht mehr in diesem Browser.',
  'load.uploadMissing':
    'Der hochgeladene Fahrplan in diesem Link ist nicht in diesem Browser gespeichert. Laden Sie ihn erneut hoch.',

  'crumb.feed': 'Feed',
  'crumb.noFeed': 'Kein Feed',
  'crumb.more': '{name} +{count} weitere',

  'status.share': 'Teilen',
  'status.copyLink': 'Link zum Teilen kopieren',
  'status.shareNote':
    'Der Link enthält die URLs beider Feeds und das ausgewählte Element.',
  'status.shareFile':
    'In dieser Sitzung wurde ein Fahrplanfeed aus einer hochgeladenen Datei geladen, die ein Link nicht reproduzieren kann.',
  'status.pickFeed': 'Feed auswählen',
  'status.copied': 'Link kopiert',
  'status.copyFailed': 'Kopieren in die Zwischenablage nicht möglich',
  'status.noRealtime':
    'Kein Echtzeit-Feed geladen; die Karte zeigt nur den Fahrplan.',
  'status.simulating':
    'Kein Echtzeit-Feed geladen. Die Karte zeigt Fahrzeuge dort, wo der Fahrplan sie jetzt verortet, alle {seconds} s neu berechnet.',
  'status.simulatingCapped':
    'Gerade sind {running} Fahrten unterwegs; nur die ersten {shown} werden gezeichnet.',

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

  'home.scheduleLoaded': 'Geladen',
  'home.scheduleLoading': 'Wird geladen…',
  'home.scheduleError': 'Laden fehlgeschlagen: {message}',
  'home.noSchedule': 'Kein Fahrplan geladen',
  'home.simulated': 'Aus dem Fahrplan simuliert',
};
