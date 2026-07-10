# gestion-stock-cabinet-dentaire

L'objectif est de suivre les stocks d'un cabinet dentaire.

Le tableur Excel est dÃ©jÃ  crÃ©Ã© avec 4 feuilles diffÃ©rentes (Produits, Lots, Mouvements et Logs).

Il y a une interface web permettant de modfier intuitivement la base de donnÃ©es (le tableur).

Diagramme de flux de l'utilisateur via l'UI web :

- Initialisation : chargement des donnÃ©es du tableur vers un cache local

- Affichage : les donnÃ©es du cache sont affichÃ©es et accessibles depuis l'interface utilisateur
    - Les listes pour le remplissage des formulaires
    - Alertes de prÃ©remption

- Avant chaque confirmation de rÃ©ception/prÃ©lÃ¨vement, le cache est actualisÃ©

- La confirmation induit une modification de la base de donnÃ©es

- Le cache est aussi mis Ã  jour

- Il y a un bouton sur l'UI permettant de mettre Ã  jour le cache local pour Ã©viter les conflits

- En cas de conflits, aucun changement n'est opÃ©rÃ©