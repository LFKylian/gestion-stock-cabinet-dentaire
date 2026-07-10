// ────────────────────────────────────────────────────────────
//  CONSTANTES — noms des feuilles et index des colonnes
// ────────────────────────────────────────────────────────────

const SHEETS = {
  PRODUITS:    "Produits",
  LOTS:        "Lots",
  MOUVEMENTS:  "Mouvements",
  LOG:         "Log",
};

// Colonnes Produits (index 1-based)
const COL_PROD = {
  ID:           1,   // A
  NOM:          2,   // B
  CAT_REG:      3,   // C
  CAT_USAGE:    4,   // D
  UNITE:        5,   // E
  SEUIL:        6,   // F
  FOURNISSEUR:  7,   // G
  EMPLACEMENT:  8,   // H
  NOTES:        9,   // I
  ACTIF:        10,  // J
  STOCK_TOTAL:  11,  // K  ← calculé
  ALERTE:       12,  // L  ← calculé
};

// Colonnes Lots (index 1-based)
const COL_LOT = {
  REF:          1,   // A
  ID_PRODUIT:   2,   // B
  NOM_PRODUIT:  3,   // C
  NUM_LOT_FOUR: 4,   // D
  QTE_RECUE:    5,   // E
  QTE_RESTANTE: 6,   // F
  DATE_RECEP:   7,   // G
  DATE_PEREM:   8,   // H
  FOURNISSEUR:  9,   // I
  STATUT:       10,  // J
  EMPLACEMENT:  11,  // K
  ALERTE_PEREM: 12,  // L  ← calculé
  JOURS_PEREM:  13,  // M  ← calculé
  NOTES:        14,  // N
};

// Colonnes Mouvements (index 1-based)
const COL_MVT = {
  ID:           1,   // A
  REF_LOT:      2,   // B
  NOM_PRODUIT:  3,   // C
  TYPE:         4,   // D
  QUANTITE:     5,   // E
  DATE:         6,   // F
  PAR:          7,   // G
  COMMENTAIRE:  8,   // H
  QTE_APRES:    9,   // I
};

// Colonnes Log (index 1-based)
const COL_LOG = {
  TIMESTAMP:    1,   // A
  UTILISATEUR:  2,   // B
  ACTION:       3,   // C
  ENTITE:       4,   // D
  ID_ENTITE:    5,   // E
  ANCIENNE_VAL: 6,   // F
  NOUVELLE_VAL: 7,   // G
  SESSION:      8,   // H
};