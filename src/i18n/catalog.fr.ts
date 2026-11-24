import type { Translation } from 'gtfs-zone-web-common/i18n/index';
import type { en } from './catalog.en';

/** viz.rt.gtfs.zone's UI strings, in French. */
export const fr: Translation<typeof en> = {
  'app.title':
    'viz.rt.gtfs.zone - Visualiseur GTFS Realtime rapide, gratuit et open source',
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
  'nav.load': 'Charger',

  'shortcut.openLoad': 'Ouvrir la fenêtre de chargement de flux',
  'search.vehicles': 'Véhicules',

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
  'load.restored':
    '{label} ouvert depuis la copie enregistrée dans ce navigateur',
  'load.reloadedUnchanged':
    "L'horaire de {label} n'a pas changé ; restauré depuis la copie enregistrée",
  'load.storedGone': "Ce flux enregistré n'est plus dans ce navigateur.",

  'crumb.feed': 'Flux',
  'crumb.noFeed': 'Aucun flux',
  'crumb.more': '{name} +{count} autres',

  'status.share': 'Partager',
  'status.copyLink': 'Copier le lien de partage',
  'status.shareNote':
    "Le lien contient les URL des deux flux et l'élément sélectionné.",
  'status.shareFile':
    "Cette session a chargé un flux horaire depuis un fichier envoyé, qu'un lien ne peut pas reproduire.",
  'status.pickFeed': 'Choisir un flux',
  'status.copied': 'Lien copié',
  'status.copyFailed': 'Impossible de copier dans le presse-papiers',
  'status.noRealtime':
    "Aucun flux temps réel n'est chargé ; la carte affiche seulement l'horaire.",
  'status.simulating':
    "Aucun flux temps réel n'est chargé. La carte affiche les véhicules théoriques là où l'horaire les place maintenant, recalculés toutes les {seconds} s.",
  'status.simulatingCapped':
    '{running} courses circulent maintenant ; seules les {shown} premières sont affichées.',

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
  'help.welcome.start': 'Commencer !',

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

  'home.scheduleLoaded': 'Chargé',
  'home.scheduleLoading': 'Chargement…',
  'home.scheduleError': 'Échec du chargement : {message}',
  'home.noSchedule': 'Aucun horaire chargé',
  'home.simulated': "Simulé à partir de l'horaire",
};
