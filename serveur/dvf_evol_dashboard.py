

# lancer le serveur
# venv/Scripts/Activate.ps1 dans Powershell devant ./venv
# python dvf_evol_dashboard.py
# http://localhost:8050
# http://localhost:8050/cp/06200
# http://localhost:8050/insee/06254

#constantes
PATH_DATA = "chemin/vers/les/donnees/generees/par/le/traitement/de/donnees"


from dash import Dash, html, dcc, dash_table
import plotly.express as px
from dash.dependencies import Input, Output
import pandas as pd
import json
import re
from furl import furl
import numpy as np
import datetime

import flask
import webbrowser
import os

#STATIC FILES PART
STATIC_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
server = flask.Flask(__name__)

app = Dash(__name__, server=server)
app.config.suppress_callback_exceptions = True

#les données
df = pd.read_csv(PATH_DATA, sep=",", encoding="utf8", dtype={'Code INSEE': "string"})
print(len(df))

trimestre = [str(np.datetime64('2014-01') + np.timedelta64(3*(x), 'M')) for x in range(0,36)]

app.layout = html.Div([
    dcc.Location(id='url', refresh=False),

    html.Div(id="lesgraphes"),
    html.Div(id="nbgraphes")
])

@app.callback(
     [
        Output('lesgraphes', 'children'),
        Output('nbgraphes', 'children')
    ],
              [Input('url', 'href')])
def _content(href: str):
    print(f"deb - {str(datetime.datetime.now())}")
    f = furl(href)
    
    cp = re.match(r"\/?(insee)\/([0-9AB]{5})",str(f.path))
    if cp is None:
        return html.H1("Pas un code INSEE (erreur au sein de l'url)", style={"font-family": "Courier New,Courier,Lucida Sans Typewriter,Lucida Typewriter,monospace"}), html.Div("0")
    else:
        typecode = cp.group(1)
        section = None
        if typecode=="insee":
            print("INSEE")
            sections = df[df["Code INSEE"]==cp.group(2)]
        liste_graph = []
        n_insee = sections.at[sections["section"].first_valid_index(),'section'] if len(sections)>0 else "0"
        for si, srow in sections.iterrows():
            srow.reset_index()
            sect = srow.values.tolist()
            gsection = srow["section"]
            sect = sect[1:-1]
            fi, li = srow[1:-1].first_valid_index(),srow[1:-1].last_valid_index()
            trideb, trifin = (None,None)
            if fi is not None:
                sect[int(fi)-1]=1
                sect = sect[int(fi)-1:int(li)]
                #progression au lieu de coef directeur
                for i in range(len(sect)): 
                    if i>0:
                        sect[i] = sect[i]*sect[i-1] 


                fig = px.line(
                            y=sect,
                            x=trimestre[int(fi)-1:int(li)],
                            title=f"{gsection[5:]}. {trimestre[int(fi)-1]}/{trimestre[int(li)]}",
                            labels={"x":"Trimestre", "y":"Facteur d'evolution"},
                            width=350, height=350,
                            )
                liste_graph.append(dcc.Graph(id=f"graph_{gsection}",figure=fig, className="graphSections"))
        print(f"fin - {str(datetime.datetime.now())}")
        return liste_graph, n_insee+"_"+str(len(liste_graph))

#sert le front       
@app.server.route('/static/<resource>')
def serve_static(resource):
    RESSOURCE = resource   
    return flask.send_from_directory(STATIC_PATH, RESSOURCE, mimetype="text/"+str(RESSOURCE).split(".")[-1])



if __name__ == '__main__':
    webbrowser.open('http://127.0.0.1:8050/', new=0, autoraise=True) 
    app.run_server(debug=True, use_reloader=False)

