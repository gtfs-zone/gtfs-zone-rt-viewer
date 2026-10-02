import type { Translation } from 'gtfs-zone-web-common/i18n/index';
import type { en } from './catalog.en';

/** viz.rt.gtfs.zone's UI strings, in French. */
export const fr: Translation<typeof en> = {
  'app.title': 'viz.rt.gtfs.zone - Visualiseur GTFS Realtime',
  'app.alertTitle': 'Alerte de service {label} | viz.rt.gtfs.zone',
  'app.noWebgl':
    'La carte nécessite WebGL, que ce navigateur a désactivé ou ne prend pas en charge.',

  'shell.refreshRate': 'Fréquence de rafraîchissement du temps réel',
  'shell.noFeed': 'Aucun flux chargé',
  'shell.browse': 'Parcourir',
  'shell.alerts': 'Alertes',
  'shell.alertsAria': 'Alertes de service',
  'shell.help': 'Aide',
  'shell.seconds': '{n} s',

  'nav.reload': 'Recharger le flux',
  'nav.edit': 'Modifier les horaires dans edit.gtfs.zone',
  'nav.alerts': 'Alertes de service',
  'nav.theme': 'Changer de thème',
  'nav.guide': 'Guide',
  'nav.load': 'Charger',

  'shortcut.openLoad': 'Ouvrir la fenêtre de chargement de flux',
  'shortcut.focusSearch': 'Aller à la recherche sur la carte',
  'shortcut.clearSearch': 'Effacer la recherche',
  'shortcut.showGuide': 'Afficher le guide',

  'load.loaded': '{label} chargé',
  'load.reloaded': '{label} rechargé',
  'load.cancelled': 'Chargement annulé',
  'load.cancelledNotice': 'Chargement annulé.',
  'load.failed': 'Échec du chargement de {label} : {reason}',
  'load.failedNotice': 'Impossible de charger {label} : {reason}',
  'load.reloadFailed': 'Échec du rechargement de {label} : {reason}',
  'load.incomplete': 'La sélection est incomplète',
  'load.linkedFeed': 'Flux du lien',
  'load.partialLink': "Ce lien ne désigne qu'une partie d'un flux : {missing}.",
  'load.decodeFailed': 'Échec du décodage : {message}',

  'crumb.feed': 'Flux',
  'crumb.noFeed': 'Aucun flux',
  'crumb.more': '{name} +{count} autres',
  'crumb.vehicle': 'Véhicule',
  'crumb.alert': 'Alerte de service',

  'alerts.title': 'Alertes de service',
  'alerts.close': 'Fermer',
  'alerts.none': 'Aucune alerte de service.',
  'alerts.activeOf': '{active} active(s) sur {total} dans le flux.',
  'alerts.fallback': 'Alerte {id}',
  'alerts.active': 'active',
  'alerts.notActive': 'inactive',

  'time.secondsAgo': 'il y a {s} s',
  'time.minutesAgo': 'il y a {m} min {s} s',
  'time.hoursAgo': 'il y a {h} h {m} min',
  'time.now': 'maintenant',
  'time.seconds': '{s} s',

  'status.notSet': 'non défini',
  'status.viaProxy': 'via cors.kcfam.us',
  'status.localUrl':
    'URL locale : proxy CORS non appliqué (il ne peut pas atteindre cette machine)',
  'status.counts': 'Effectifs',
  'status.stops': 'Arrêts',
  'status.routes': 'Lignes',
  'status.trips': 'Courses',
  'status.shapes': 'Tracés',
  'status.agencies': 'Agences',
  'status.services': 'Services',
  'status.stopTimes': 'Horaires de passage',
  'status.vehicles': 'Véhicules',
  'status.tripUpdates': 'Mises à jour de courses',
  'status.alerts': 'Alertes',
  'status.never': 'jamais',
  'status.notReported': 'non indiqué',
  'status.error': 'erreur',
  'status.lastFetched': 'Dernière récupération',
  'status.feedTimestamp': 'Horodatage du flux',
  'status.dataAge': '(âge des données)',
  'status.entities': 'Entités',
  'status.nextRefresh': 'Prochain rafraîchissement',
  'status.errorAt': 'à {time}',
  'status.idTrip': 'dérivée de vehicle.id + trip_id + start_date',
  'status.idEntity': 'dérivée de vehicle.id + trip + entity.id',
  'status.idIndex':
    "aucune identité utilisable : dérivée de l'index de l'entité",
  'status.empty': '(vide)',
  'status.dupVehicles_one': '{count} véhicule',
  'status.dupVehicles_other': '{count} véhicules',
  'status.idNotUnique': "vehicle.id n'est pas unique par véhicule",
  'status.idNotUniqueText':
    "GTFS-RT précise que {field} « should be unique per vehicle, and is used for tracking the vehicle as it proceeds through the system ». Ce flux le réutilise : une clé d'instance ({strategy}) a donc été dérivée pour désigner les véhicules.",
  'status.endpoints': 'Points de terminaison temps réel',
  'status.uploaded':
    'Chargé depuis le fichier envoyé {name} : impossible à reproduire par un lien.',
  'status.scheduled': 'Flux horaire',
  'status.gapsOptional':
    "GTFS-RT rend ce champ facultatif : {missing} véhicules sur {total} ne l'indiquent pas.",
  'status.gapsStopId':
    "{count} ont désigné l'arrêt par {field} à la place, ce que la spécification autorise tout autant ; leur position en découle.",
  'status.gapsDerived':
    "{count} n'ont désigné aucun arrêt : le plus proche {field} encore à venir de la même course a été utilisé ; ils sont marqués « dérivé » partout où ils apparaissent.",
  'status.gapsUnplaced':
    "{count} n'ont pu être placés par aucun de ces moyens et restent dans la liste des non placés du bandeau de ligne.",
  'status.gaps': 'Lacunes des données du flux',
  'status.gapsNeutral': 'Comment ce flux indique la position',
  'status.gapsRow': 'Véhicules sans {field}',
  'status.relVehicles_one': '{count} véhicule indiquant la course {label}',
  'status.relVehicles_other': '{count} véhicules indiquant la course {label}',
  'status.relUpdates_one':
    '{count} mise à jour de course indiquant la course {label}',
  'status.relUpdates_other':
    '{count} mises à jour de course indiquant la course {label}',
  'status.relStopTimes_one': '{count} horaire de passage indiquant {label}',
  'status.relStopTimes_other': '{count} horaires de passage indiquant {label}',
  'status.relTitle': 'Courses hors horaires',
  'status.relNote':
    "Ce sont des déclarations du flux sur des courses précises, pas des lacunes dans ce qu'il a transmis. CANCELED et SKIPPED signifient que les horaires affichés ne peuvent être pris par personne.",
  'status.mapIssues': 'Problèmes de données cartographiques',
  'status.stopsNoId': 'Arrêts écartés (sans stop_id)',
  'status.stopsNoIdNote': 'Ne peuvent être ni dessinés ni liés.',
  'status.stopsNoCoords': 'Arrêts écartés (sans coordonnées)',
  'status.stopsNoCoordsNote': 'stop_lat / stop_lon absents ou illisibles.',
  'status.vehiclesUnmatched': 'Véhicules sans ligne correspondante',
  'status.vehiclesUnmatchedNote':
    "Dessinés dans la couleur neutre au lieu d'une couleur de ligne.",
  'status.vehiclesCollapsed': 'Véhicules fusionnés en un seul objet de carte',
  'status.vehiclesCollapsedNote':
    'Devrait être 0 ; une valeur non nulle signifie que la dérivation de la clé des véhicules est défaillante.',
  'status.stationIssues': 'Problèmes de hiérarchie des stations',
  'status.danglingParent': 'parent_station désigne un arrêt manquant',
  'status.danglingParentNote': "Le parent indiqué n'est pas dans stops.txt.",
  'status.wrongParent': 'parent_station désigne un type incorrect',
  'status.wrongParentNote':
    "Un quai, un accès ou un nœud doit désigner une station ; une zone d'embarquement, un quai.",
  'status.cycle': 'Arrêts pris dans un cycle de parent_station',
  'status.cycleNote': 'Le parcours est interrompu pour éviter un blocage.',
  'status.padded': "Colonnes entourées d'espaces",
  'status.paddedNote':
    "{rows} lignes avaient des espaces au début ou à la fin. La référence GTFS l'interdit ; ils ont été supprimés. Sans cela, aucun {column} temps réel ne correspondrait à ce flux.",
  'status.metadata': 'Métadonnées du flux',
  'status.share': 'Partager',
  'status.copyLink': 'Copier le lien de partage',
  'status.shareNote':
    "Le lien contient les URL des deux flux et l'élément sélectionné.",
  'status.shareFile':
    "Cette session a chargé un flux horaire depuis un fichier envoyé, qu'un lien ne peut pas reproduire.",
  'status.emptyNote':
    "Une session nécessite un flux GTFS horaire pour les lignes et les arrêts, et au moins un point de terminaison temps réel pour ce qui s'y passe en ce moment.",
  'status.pickFeed': 'Choisir un flux',
  'status.copied': 'Lien copié',
  'status.copyFailed': 'Impossible de copier dans le presse-papiers',

  'vehicle.notReported': 'non indiqué',
  'vehicle.seqFromStopId':
    'stop_id {stop} est le stop_sequence {sequence} de cette course',
  'vehicle.seqDerived': '{sequence} dérivé des mises à jour de courses',
  'vehicle.route': 'Ligne',
  'vehicle.notInSchedule': 'course absente des horaires',
  'vehicle.noRouteId': 'aucun route_id indiqué',
  'vehicle.trip': 'Course',
  'vehicle.noTripId': 'Aucun trip_id indiqué.',
  'vehicle.at': 'à',
  'vehicle.headsign': 'Destination',
  'vehicle.currently': 'Actuellement {status}',
  'vehicle.progress': 'Progression',
  'vehicle.progressValue': '{n} arrêts sur {total}',
  'vehicle.tripStart': 'Début de la course',
  'vehicle.predictions': 'Prévisions',
  'vehicle.noPredictions':
    'Aucune mise à jour de course du flux ne correspond à cette course.',
  'vehicle.seq': 'Séq.',
  'vehicle.stop': 'Arrêt',
  'vehicle.missing':
    "Le véhicule {id} n'est pas dans le flux temps réel actuel.",
  'vehicle.sharedId':
    'Le {field} {id} du flux désigne {count} véhicules de ce flux. GTFS-RT précise que {descriptor} « should be unique per vehicle » ; ce flux le réutilise.',
  'vehicle.sharedIdTrip': 'Cette instance se distingue par la course {trip}.',
  'vehicle.sharedIdTripDate':
    'Cette instance se distingue par la course {trip} du {date}.',
  'vehicle.gone':
    "N'est plus dans le flux depuis {time}. Tout ce qui suit provient du dernier relevé qui le contenait.",
  'vehicle.live': 'En direct',
  'vehicle.position': 'Position',
  'vehicle.bearing': 'Cap',
  'vehicle.speed': 'Vitesse',
  'vehicle.speedValue': '{speed} m/s',
  'vehicle.status': 'Statut',
  'vehicle.occupancy': 'Affluence',
  'vehicle.timestamp': 'Horodatage',
  'vehicle.emptyId': 'vide dans le flux',
  'vehicle.entityId': "Identifiant d'entité du flux",
  'vehicle.alerts': 'Alertes',
  'vehicle.raw': 'VehiclePosition (décodé)',

  'help.welcome.label': 'Bienvenue',
  'help.welcome.title': 'Bienvenue sur viz.rt.gtfs.zone',
  'help.welcome.lede':
    "viz.rt.gtfs.zone affiche un flux GTFS Realtime sur une carte en direct. Chaque flux est récupéré et décodé dans votre navigateur. Rien de ce que vous chargez n'est envoyé nulle part.",
  'help.welcome.load': 'Charger un flux',
  'help.welcome.loadText':
    'Indiquez un flux GTFS horaire et ses flux temps réel.',
  'help.welcome.watch': 'Suivre les véhicules',
  'help.welcome.watchText':
    'Les positions se mettent à jour sur la carte toutes les quelques secondes.',
  'help.welcome.predict': 'Vérifier les prévisions',
  'help.welcome.predictText':
    "Les prévisions d'arrivée et le retard de chaque course.",
  'help.welcome.disrupt': 'Repérer les perturbations',
  'help.welcome.disruptText':
    "Les alertes de service en cours s'affichent à côté des lignes.",

  'help.about.blurb':
    'viz.rt.gtfs.zone affiche un flux GTFS Realtime sur une carte en direct.',
  'help.about.blurb2':
    "GTFS Realtime est ce qu'un réseau publie à côté de ses horaires pour dire où sont ses véhicules en ce moment, quel est le retard de chaque course et ce qui est perturbé. Indiquez un flux GTFS horaire et ses flux temps réel, et la carte dessine le reste :",
  'help.about.routes': 'Les lignes et les arrêts des horaires',
  'help.about.vehicles':
    'Les véhicules qui les parcourent, mis à jour toutes les quelques secondes',
  'help.about.predictions': "Les prévisions d'arrivée à chaque arrêt",
  'help.about.alerts': 'Les alertes de service en cours',
  'help.about.footer':
    "Chaque flux est récupéré et décodé dans votre navigateur. Rien de ce que vous chargez n'est envoyé nulle part.",
  'help.about.subject': 'Retour sur viz.rt.gtfs.zone',
  'help.about.sibling':
    'créer et modifier un flux GTFS horaire dans le navigateur',

  'help.mapKey.label': 'Légende',
  'help.mapKey.title': 'Légende',
  'help.mapKey.unlocated': "Hérite de l'emplacement de sa station",
  'help.mapKey.routes': 'Lignes et véhicules',
  'help.mapKey.route': 'Ligne (couleur du flux, ou couleur attribuée)',
  'help.mapKey.direction': 'Sens de circulation, sur la ligne sélectionnée',
  'help.mapKey.vehicle': 'Véhicule',
  'help.mapKey.heading': 'Véhicule, avec un cap connu',
  'help.mapKey.unmatched': "Véhicule dont la ligne n'a pas pu être identifiée",
};
