// ============================================================
//  constants.gs — Source unique de vérité pour noms de feuilles
//  et noms de colonnes. Jamais de chaîne littérale ailleurs.
// ============================================================

const SHEETS = {
  PRODUITS:   "Produits",
  LOTS:       "Lots",
  MOUVEMENTS: "Mouvements",
  LOG:        "Log",
};

// Noms de colonnes (correspondent exactement aux en-têtes du Sheets)
const COL = {
  PROD: {
    ID:          "ID Produit",
    NOM:         "Nom du produit",
    CAT_REG:     "Catégorie réglementaire",
    CAT_USAGE:   "Catégorie d'usage",
    UNITE:       "Unité de conditionnement",
    SEUIL:       "Seuil alerte (stock bas)",
    FOURNISSEUR: "Fournisseur habituel",
    EMPLACEMENT: "Emplacement",
    NOTES:       "Notes",
    ACTIF:       "Actif",
    STOCK_TOTAL: "Stock total",
    ALERTE:      "Alerte stock",
  },
  LOT: {
    REF:          "Référence lot",
    ID_PRODUIT:   "ID Produit lié",
    NOM_PRODUIT:  "Nom produit",
    NUM_LOT_FOUR: "N° lot fournisseur",
    QTE_RECUE:    "Quantité reçue",
    QTE_RESTANTE: "Quantité restante",
    DATE_RECEP:   "Date de réception",
    DATE_PEREM:   "Date de péremption",
    FOURNISSEUR:  "Fournisseur",
    STATUT:       "Statut",
    EMPLACEMENT:  "Emplacement précis",
    ALERTE_PEREM: "Alerte péremption",
    JOURS_PEREM:  "Jours avant péremption",
    NOTES:        "Notes",
  },
  MVT: {
    ID:          "ID Mouvement",
    REF_LOT:     "Référence lot",
    NOM_PRODUIT: "Nom produit",
    TYPE:        "Type",
    QUANTITE:    "Quantité",
    DATE:        "Date",
    PAR:         "Effectué par",
    COMMENTAIRE: "Commentaire",
    QTE_APRES:   "Qté restante après",
  },
  LOG: {
    TIMESTAMP:    "Timestamp",
    UTILISATEUR:  "Utilisateur",
    ACTION:       "Action",
    ENTITE:       "Entité concernée",
    ID_ENTITE:    "ID Entité",
    ANCIENNE_VAL: "Ancienne valeur",
    NOUVELLE_VAL: "Nouvelle valeur",
    SESSION:      "Session / Info",
  },
};

const STATUT_LOT = {
  EN_STOCK:  "En stock",
  STOCK_BAS: "Stock bas",
  EPUISE:    "Épuisé",
  PERIME:    "Périmé",
  RETIRE:    "Retiré / Rappelé",
};

const SEUILS_PEREM = { URGENT: 30, PROCHE: 60 };

const TYPE_MVT = {
  ENTREE:     "Entrée (réception)",
  SORTIE:     "Sortie (utilisation)",
  AJUSTEMENT: "Ajustement inventaire",
  RETRAIT:    "Retrait / Périmé",
};

const ID_PREFIX = { PROD: "PROD", LOT: "LOT", MVT: "MVT" };