# DVF_Evolution
Application représentant l'évolution des prix de l'immobilier en France au niveau local.

Démonstration gracieuse faîte pour <a href="https://donneespubliques.org">DonneesPubliques.org</a><br>
Application disponible à l'adresse <a href="https://immobilier.donneespubliques.org">immobilier.donneespubliques.org</a>


# Pré-requis
Python >3.8

# Installation

Dans un environnement s'il y a lieu <br/>
`pip install pandas dash furl`
- <a href="https://pandas.pydata.org/">`pandas`</a> bibliothèque de manipulation de données
- <a href="https://dash.plotly.com/">`dash`</a> bibliothèque de dashboard
- <a href="https://github.com/gruns/furl">`furl`</a> bibliothèque parsing d'url

Récupérer ou générer le fichier d'évolution des prix fonciers, 
- soit par les scripts de génération [#Traitement de données]
- soit sur <a href="https://www.data.gouv.fr/fr/datasets/evolution-des-prix-de-du-foncier-en-france/">le repo data.gouv.fr</a>

Modifier en conséquence la constante PATH_DATA du fichier ./serveur/dvf_evol_dashboard.py


Pas d'autres installations à faire, le front étant une simple page html.

# Outils utilisés

## Librairies/API
En plus des librairies déjà citées et de leurs dépendances, plusieurs autres outils utilisés :
- <a href="https://picturepan2.github.io/spectre">`Spectre`</a>, framework CSS utilisé pour le front de l'application.
- <a href="https://github.com/etalab/DVF-app">`l'application DVF d'Etalab`</a> dont une bonne partie du code a été librement collectivisée
- <a href="https://www.mapbox.com/">MapBox</a>, pour représenter la carte et ses couches (layers pour les bilingues) comportant le style "bright" d'<a href="https://www.openstreetmap.org">OpenStreetMap</a>
- <a href="https://geo.api.gouv.fr/decoupage-administratif/communes">`l'API geo.api.gouv.fr`</a> permettant d'effectuer des recherches par nom de commune (et récupérer le numéro INSEE en passant)

## Données
- <a href="https://www.data.gouv.fr/fr/datasets/demandes-de-valeurs-foncieres-geolocalisees/">`DVF géolocalisées`</a>
- <a href="https://cadastre.data.gouv.fr/data/etalab-cadastre">`Données cadastrales`</a>

# Architecture

Le système créé peut se séparer en 3, le traitement de données, le serveur, et le client web.

## Traitement de données
`.\traitementDesDonnees` comporte un calepin de Zeus (Jupyter Notebook) dans lequel est décrit le traitement de données appliqué aux données format DVF pour obtenir une évolution trimestrielle par <a href="https://www.geoportail.gouv.fr/donnees/sections-cadastrales">sections</a>

## Serveur
Sert les données d'évolution sous forme de graphiques.<br/>
API sous la forme, `/insee/[codeINSEE]`


## Client Web
Simple page web statique, reprennant une bonne partie du code de <a href="https://app.dvf.etalab.gouv.fr/">l'application DVF</a> et affichant les données du serveur.

# Amorçage (Getting started)
`
cd serveur &
python dvf_evol_dashboard.py
`
http://localhost:8050/static/index.html


# Evolutions futures

(mais pas des prix cette fois)
- Visuel des graphiques
- Réorganisation de l'affichage sur téléphone (width<800px)
- Optimisation du cache
- Debug des cliques interfaces
- Refonte de l'archi, sortir de Dash, envoyer les données restreintes et générer les graphiques avec une librairie JS
- Mise en évidence des sections au survol du graphique associé
- Griser les sections ne comportant pas de données
- Alignement des calculs des évolutions moyennes par section avec les écrits scientifiques de référence (revue de la littérature à prévoir).
