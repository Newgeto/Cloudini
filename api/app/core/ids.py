"""Génération d'identifiants publics façon « snowflake » (comme Discord).

Un snowflake est un grand entier (rendu en chaîne) construit à partir de
l'horodatage, d'un peu d'aléa et d'un compteur, ce qui le rend unique, trié
dans le temps et opaque (pas de séquence 1, 2, 3… exposée).
"""

import random
import time

# Époque de référence (2025-01-01) : on compte les millisecondes depuis cette date.
_EPOCH_MS = 1_735_689_600_000

_sequence = 0


def generate_snowflake() -> str:
    """Renvoie un identifiant public unique sous forme de chaîne numérique."""
    global _sequence
    elapsed = int(time.time() * 1000) - _EPOCH_MS
    _sequence = (_sequence + 1) & 0xFFF  # 12 bits de compteur
    value = (elapsed << 22) | (random.getrandbits(10) << 12) | _sequence
    return str(value)
