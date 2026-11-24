/** viz.rt.gtfs.zone's UI strings, in English: the source of the keys. */
export const en = {
  'app.title':
    'viz.rt.gtfs.zone - Fast, free, open source GTFS Realtime visualizer',
  'app.alertTitle': 'Service alert {label} | viz.rt.gtfs.zone',
  'app.noWebgl':
    'The map needs WebGL, which this browser has turned off or does not support.',

  'shell.refreshRate': 'Realtime refresh rate',
  'shell.noFeed': 'No feed loaded',
  'shell.browse': 'Browse',
  'shell.alerts': 'Alerts',
  'shell.alertsAria': 'Service alerts',
  'shell.help': 'Help',
  'shell.seconds': '{n}s',

  'nav.reload': 'Reload feed',
  'nav.edit': 'Edit schedule in edit.gtfs.zone',
  'nav.load': 'Load',

  'shortcut.openLoad': 'Open the load feed dialog',
  'search.vehicles': 'Vehicles',

  'load.loaded': 'Loaded {label}',
  'load.reloaded': 'Reloaded {label}',
  'load.cancelled': 'Load cancelled',
  'load.cancelledNotice': 'Load cancelled.',
  'load.failed': 'Failed to load {label}: {reason}',
  'load.failedNotice': 'Could not load {label}: {reason}',
  'load.reloadFailed': 'Failed to reload {label}: {reason}',
  'load.incomplete': 'Selection is incomplete',
  'load.linkedFeed': 'Linked feed',
  'load.partialLink': 'This link names only part of a feed: {missing}.',
  'load.restored': 'Opened {label} from the copy stored in this browser',
  'load.reloadedUnchanged':
    'The schedule of {label} is unchanged; restored it from the stored copy',
  'load.storedGone': 'That stored feed is no longer in this browser.',

  'crumb.feed': 'Feed',
  'crumb.noFeed': 'No feed',
  'crumb.more': '{name} +{count} more',

  'status.share': 'Share',
  'status.copyLink': 'Copy shareable link',
  'status.shareNote':
    'The link carries both feed URLs and whatever is focused.',
  'status.shareFile':
    'This session loaded a scheduled feed from an uploaded file, which a link cannot reproduce.',
  'status.pickFeed': 'Pick a feed',
  'status.copied': 'Link copied',
  'status.copyFailed': 'Could not copy to clipboard',
  'status.noRealtime':
    'No realtime feed is loaded; the map shows the schedule only.',
  'status.simulating':
    'No realtime feed is loaded. The map shows scheduled vehicles where the timetable puts them now, recomputed every {seconds}s.',
  'status.simulatingCapped':
    '{running} trips are running now; only the first {shown} are drawn.',

  'help.welcome.label': 'Welcome',
  'help.welcome.title': 'Welcome to viz.rt.gtfs.zone',
  'help.welcome.lede':
    'viz.rt.gtfs.zone shows a GTFS Realtime feed on a live map. Every feed is fetched and decoded in your browser. Nothing you load is uploaded anywhere.',
  'help.welcome.load': 'Load a feed',
  'help.welcome.loadText':
    'Point it at a scheduled GTFS feed plus its realtime feeds.',
  'help.welcome.watch': 'Watch vehicles move',
  'help.welcome.watchText': 'Positions update every few seconds on the map.',
  'help.welcome.predict': 'Check predictions',
  'help.welcome.predictText':
    'Arrival predictions and how late each trip is running.',
  'help.welcome.disrupt': 'Spot disruptions',
  'help.welcome.disruptText':
    'Active service alerts show up alongside the routes.',
  'help.welcome.start': 'Get started!',

  'help.about.blurb':
    'viz.rt.gtfs.zone shows a GTFS Realtime feed on a live map.',
  'help.about.blurb2':
    'GTFS Realtime is what an agency publishes alongside its schedule to say where its vehicles are right now, how late each trip is running, and what is disrupted. Point this at a scheduled GTFS feed plus its realtime feeds and the map draws the rest:',
  'help.about.routes': 'Routes and stops from the schedule',
  'help.about.vehicles':
    'Vehicles moving along them, updated every few seconds',
  'help.about.predictions': 'Arrival predictions at any stop',
  'help.about.alerts': 'Active service alerts',
  'help.about.footer':
    'Every feed is fetched and decoded in your browser. Nothing you load is uploaded anywhere.',
  'help.about.subject': 'viz.rt.gtfs.zone feedback',
  'help.about.sibling': 'build and edit a GTFS schedule feed in the browser',

  'help.mapKey.label': 'Map Key',
  'help.mapKey.title': 'Map Key',
  'help.mapKey.unlocated': "Inherits its station's location",
  'help.mapKey.routes': 'Routes &amp; Vehicles',
  'help.mapKey.route': "Route (the feed's color, or an assigned one)",
  'help.mapKey.direction': 'Direction of travel, on the selected route',
  'help.mapKey.vehicle': 'Vehicle',
  'help.mapKey.heading': 'Vehicle, with a known heading',
  'help.mapKey.unmatched': "Vehicle, route couldn't be matched",

  'home.scheduleLoaded': 'Loaded',
  'home.scheduleLoading': 'Loading…',
  'home.scheduleError': 'Failed to load: {message}',
  'home.noSchedule': 'No schedule loaded',
  'home.simulated': 'Simulated from the timetable',
} as const;
