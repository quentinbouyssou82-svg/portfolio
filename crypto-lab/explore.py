"""
Semaine 1 — Explorer la mean reversion sur BTC

Objectif : répondre à 3 questions (voir en bas du fichier).
Complète les sections TODO une par une, lance, observe, note.
"""

import yfinance as yf
import pandas as pd
import matplotlib.pyplot as plt

# ── 1. Télécharger les données ──────────────────────────────────────────────
# period="2y" = 2 ans | interval="1d" = une bougie par jour
df = yf.download("BTC-USD", period="2y", interval="1d")

# yfinance peut renvoyer des colonnes multi-niveaux — on simplifie si besoin
if isinstance(df.columns, pd.MultiIndex):
    df.columns = df.columns.get_level_values(0)

print("Aperçu des données :")
print(df.head())
print(f"\nNombre de jours : {len(df)}")

# ── 2. Z-score sur 20 jours ───────────────────────────────────────────────────
window = 20

# TODO : crée la colonne 'sma' = moyenne mobile de Close sur 20 jours
# Indice : df["Close"].rolling(window).mean()

# TODO : crée la colonne 'std' = écart-type mobile de Close sur 20 jours
# Indice : df["Close"].rolling(window).std()

# TODO : crée la colonne 'z' = (Close - sma) / std
# Indice : df["z"] = (df["Close"] - df["sma"]) / df["std"]

# ── 3. Graphiques ─────────────────────────────────────────────────────────────
fig, axes = plt.subplots(2, 1, figsize=(12, 8), sharex=True)

# TODO : axes[0].plot(...) — prix Close dans le temps
# TODO : axes[1].plot(...) — z-score dans le temps
# TODO : axes[1].axhline(-2, color="red", linestyle="--", label="z = -2")
# TODO : axes[0].set_title("BTC-USD — Prix")
# TODO : axes[1].set_title("Z-score (fenêtre 20 jours)")
# TODO : axes[1].legend()

plt.tight_layout()

# ── 4. Test de l'hypothèse mean reversion ────────────────────────────────────
# Question : quand z < -2, le prix remonte-il dans les 3 jours suivants ?

# TODO : calcule les returns journaliers → colonne 'return'
# Indice : df["return"] = df["Close"].pct_change()

# TODO : calcule le return cumulé sur les 3 jours SUIVANTS (pas le jour même !)
# Indice : shift(-3) ramène le prix de J+3 à la ligne J
#          return_3d = (Close.shift(-3) - Close) / Close
#          ou : df["return"].rolling(3).sum().shift(-3)  (approximation)

# TODO : filtre les jours où z < -2 (attention aux NaN au début à cause du rolling)
# mask = ...

# TODO : affiche ces 3 chiffres :
#   - nombre d'occurrences (z < -2)
#   - % de fois où le return à +3j est positif
#   - return moyen à +3j

print("\n── Résultats hypothèse mean reversion ──")
# print(...)

plt.show()

# ── Les 3 questions à noter dans notes.md ────────────────────────────────────
# 1. Combien de fois z < -2 sur 2 ans ?
# 2. Après ces moments, return +3j positif dans quel % des cas ?
# 3. Return moyen à +3j ?
