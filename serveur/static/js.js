
//data
var map = null;
var fillColor = '#2a4ba9'
var borderColor = '#627BC1'

var unmutatedColor = '#212f39'

var hoverableSources = ['departements', 'communes', 'sections']
var mapLoaded = false
var EMPTY_FEATURE_COLLECTION = {
	type: 'FeatureCollection',
	features: []
}
var fillLayerPaint = {
	"fill-color": fillColor,
	"fill-outline-color": borderColor,
	"fill-opacity": ["case",
		["boolean", ["feature-state", "hover"], false],
		0.2,
		0
	]
}

var contoursPaint = {
	"line-width": [
		'case',
		["boolean", ["feature-state", "hover"], false],
		3,
		1
	]
}
//var departements = null;
var departementsLayer = {
	id: 'departements-layer',
	source: 'departements',
	type: 'fill',
	paint: fillLayerPaint
}
var departementsContoursLayer = {
	id: 'departements-contours-layer',
	source: 'departements',
	type: 'line',
	paint: contoursPaint
}

var communes = null;
var communesLayer = {
	id: 'communes-layer',
	source: 'communes',
	type: 'fill',
	paint: fillLayerPaint
}
var communesContoursLayer = {
	id: 'communes-contours-layer',
	source: 'communes',
	type: 'line',
	paint: contoursPaint
}

var sections = null;
var sectionsLayer = {
	id: 'sections-layer',
	source: 'sections',
	type: 'fill',
	paint: fillLayerPaint
}
var sectionsSymbolLayer = {
	id: 'sections-symbol-layer',
	source: 'sections',
	type: 'symbol',
	paint: {
		'text-halo-color': '#fff',
		'text-halo-width': 2
	},
	layout: {
		'text-field': ['format',
			['get', 'label'], {}
		]
	}
}
var sectionsLineLayer = {
	id: 'sections-line-layer',
	source: 'sections',
	type: 'line',
	paint: contoursPaint
	}




    var hoveredStateId = null;
    var selectedStateId = null;
var choosen_dep = null
var choosen_com = null
var choosen_sect = null
var codeDepartement = null;
var codeCommune = null;
var idSection = null;

var isGraph = 2;
var intervalToClear = null;
var b_cp = null
var codu = null

var scripts_charges = false;
var script_compteur = 0
var renderer = null;
var nb_check_graph = 0;
var sectionSurbrille = null;
//FUNCTIONS
function findIDSection(code_section){
	for(i in sections.features){
		if(sections.features[i].id == code_section){
			return i
		}
	}
}

function checkChangeGraph(){
	nb_check_graph += 1
	let scts = document.querySelector("iframe").contentDocument.querySelector("#nbgraphes")
	if(scts && scts.textContent.length>0){

        var [n_insee, ngraphe] = scts.textContent.trim().split("_")
        var mesc = scts.textContent
        if(ngraphe==0){
            document.querySelector("#noResultTC").textContent = (b_cp?"Code Postal":"N° INSEE")
            document.querySelector("#noResultCode").textContent = codu
            showNoResult()
        }
		else{
			console.log("showgraphe")
			generateInfo("Affichage des graphiques",(ngraphe>130?"Nombre de graphique conséquent, possibilité de ralentissement à l'affichage":""),"success")
			showGraph()
		}
        
		nb_check_graph = 0
        clearInterval(intervalToClear);
        intervalToClear = null;

    }
	if(nb_check_graph==14)generateInfo("Attention","Il s'agit d'une commune conséquente (centaines de sections), l'affichage des graphiques devrait prendre un peu plus de temps.", "primary", tempus=15000)
}
function showGraph(){
	window.setTimeout(
		()=>{
			isGraph = 1
			document.querySelector("#rplcm").style.display = "none";
			document.querySelector("#presentation").style.display = "none";
		},1000
	)
    
}
function showNoResult(){
    isGraph = 1
    document.querySelector("#noResult").style.display = "block";
    document.querySelector("#rplcm").style.display = "bloc";
    document.querySelector("#presentation").style.display = "none";
    document.querySelector("#chargement").style.display = "none";
}
function showCharg(){
    isGraph = 0
    document.querySelector("#chargement").style.display = "block";
    document.querySelector("#rplcm").style.display = "block";
    document.querySelector("#presentation").style.display = "none";
    document.querySelector("#noResult").style.display = "none";
}

async function rechercheCP(cp, bcp=false){
    showCharg()
    let ngraphe =  document.querySelector("#nbgraphes")
    if(ngraphe != null)ngraphe.parentNode.removeChild(ngraphe);
    console.log("changement iframe : "+cp)
    adresse = "/"+cp
    icadre = document.querySelector("#iframeGraphiques")
    icadre.setAttribute("src", adresse);
    intervalToClear = setInterval(checkChangeGraph,500)
	if(bcp)entrerDansCommune(cp.substring(6))
    codu = cp.split("/")[1]
}

function resetSourcesData(sources) {
	sources.forEach(function (source) {
		var source = map.getSource(source)
		if (source) {
			source.setData(EMPTY_FEATURE_COLLECTION)
		}
	})
}
function fit(geojson) {
	var bbox = turf.bbox(geojson)
	map.fitBounds(bbox, { padding: 20, animate: true })
}
function communeFilter() {map.setFilter('communes-layer', ['!=', ['get', 'code'], codeCommune])}
function departementsFilter() {map.setFilter('departements-layer', ['!=', ['get', 'code'], codeDepartement])}
function layerfilter() {
	if (codeDepartement) {departementsFilter()}
	if (codeCommune) {communeFilter()}
}
function afficherCommunesDepartement(data) {
	communes = data

	map.getSource('communes').setData(communes)
	departementsFilter()

	resetSourcesData(['sections'])

	fit(communes)
}

function resetCommune() {
	codeCommune = null;
	sections = null;

	map.getSource('sections').setData(EMPTY_FEATURE_COLLECTION)
	map.setFilter('communes-layer', null)

	if (idSection) {
		resetSection()
	}
}
function resetDepartement() {
	communes = null;
	codeDepartement = null

	map.getSource('communes').setData(EMPTY_FEATURE_COLLECTION)
	map.setFilter('departements-layer', null)

	if (codeCommune) {
		resetCommune()
	}
}
function entrerDansDepartement(sonCode) {
	if (codeDepartement) {
		resetDepartement()
	}
	// Vide l'interface
	codeDepartement = sonCode;
	console.log('Nous entrons dans le département ' + codeDepartement);
	// Charge les communes
	return getCommunes(codeDepartement).then(afficherCommunesDepartement)
}
function entrerDansCommune(newCodeCommune) {
	if (codeCommune) {resetCommune()}
	if (idSection) {resetSection()}

	console.log("Nous entrons dans la commune " + newCodeCommune);
	codeCommune = newCodeCommune;

    
    document.querySelector('#barreDeRecherche').value = "Code INSEE - "+newCodeCommune
    //document.querySelector('#barreDeRecherche').value = villeSelectionne.nom

	return getSections(codeCommune).then(
		function (data) {
			sections = data
			map.getSource('sections').setData(sections)

			//data.features.map(filledSectionsOptions)
			communeFilter()
			fit(sections)
		}
	);
}

function onDepartementClick(event) {
	var sonCode = event.features[0].properties.code
	entrerDansDepartement(sonCode);
	choosen_dep = sonCode;
};
function onCityClicked(event) {
	var sonCode = event.features[0].properties.code;
    rechercheCP("insee/"+sonCode)
	entrerDansCommune(sonCode);
	choosen_dep = sonCode;
}
function onSectionClicked(event){
	if (event.features[0].layer.source == "sections" && event.features[0].properties.id!=sectionSurbrille){
	 	surbrillanceSection(event.features[0].properties.id)
	}
} 
function loadCustomLayers() {
	if (!mapLoaded) {
		if (departements) {
			map.addSource("departements", {
				type: 'geojson',
				generateId: true,
				data: departements
			})
			map.addLayer(departementsLayer)
			map.addLayer(departementsContoursLayer)
			map.setPaintProperty(departementsContoursLayer.id, 'line-color', '#000')
		}

		map.addSource("communes", {
			type: 'geojson',
			generateId: true,
			data: communes
		})
		map.addLayer(communesLayer)
		map.addLayer(communesContoursLayer)
		map.setPaintProperty(communesContoursLayer.id, 'line-color', '#000')

		map.addSource("sections", {
			type: 'geojson',
			generateId: true,
			data: sections
		})
		map.addLayer(sectionsLayer)
		map.addLayer(sectionsLineLayer)
		map.addLayer(sectionsSymbolLayer)
		map.setPaintProperty(sectionsLineLayer.id, 'line-color', '#000')

	}

	mapLoaded = true
}

function surbrillanceSection(section){
	let prevsect = document.querySelector("iframe").contentDocument.querySelector("#graph_"+sectionSurbrille)
	if(prevsect){
		prevsect.style.boxShadow = "none";
	}
	if(section){
		sectionSurbrille = section
		let graphique = document.querySelector("iframe").contentDocument.querySelector("#graph_"+sectionSurbrille)
		if(graphique){
			graphique.scrollIntoView()
			graphique.style.boxShadow = "rgb(87, 85, 217) 0px 10px 10px -2px, rgb(87, 85, 217) 0px 1px 8px 1px"	
			// graphique.style.boxShadow = "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"	
		}
		else{
			generateInfo("Section "+section, "il n'existe pas de données pour cette section", "")
		}
	}
	else{
		sectionSurbrille = null
	}
}

function onMouseMove(event, source) {
	var canvas = map.getCanvas()
	canvas.style.cursor = 'pointer'

	if (event.features.length > 0) {
		if (hoveredStateId !== null) {
			hoverableSources.map(function (source) {
				map.setFeatureState({ source, id: hoveredStateId }, { hover: false }); // clean all sources to prevent error
			})
		}
		hoveredStateId = event.features[0].id;
		map.setFeatureState({ source, id: hoveredStateId }, { hover: true });
		
	}
}

function onMouseLeave(event, source) {
	var canvas = map.getCanvas()
	canvas.style.cursor = ''

	if (hoveredStateId !== null) {
		map.setFeatureState({ source, id: hoveredStateId }, { hover: false });
		// surbrillanceSection(null)
	}
	
}
function initCarte(){
    map = new mapboxgl.Map({
        container: 'mapid',
        style: 'https://openmaptiles.geo.data.gouv.fr/styles/osm-bright/style.json',
        center: [3, 47],
        zoom: 5,
        minZoom: 1,
        maxZoom: 19
    })
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }));

	map.on('load', function() {
		if (!departements) {
					map.addSource("departements", {
						type: 'geojson',
						generateId: true,
					data: departements
					})
					map.addLayer(departementsLayer)
					map.addLayer(departementsContoursLayer)
				map.setPaintProperty(departementsContoursLayer.id, 'line-color', '#000')
			 }
		})
    map.on('styledata', loadCustomLayers)

    hoverableSources.map(function (source) {
        var layer = `${source}-layer`
    
        map.on("mousemove", layer, function (e) { onMouseMove(e, source) });
        map.on("mouseleave", layer, function (e) { onMouseLeave(e, source) });
    })
    map.on('click', 'departements-layer', onDepartementClick)
	map.on('click', 'communes-layer', onCityClicked)
	map.on('click', 'sections-layer', onSectionClicked)
}


initCarte()