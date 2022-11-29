function getRemoteJSON(url, throwIfNotFound) {
	return fetch(url).then(function (response) {
		if (response.ok) {
			return response.json()
		}

		if (response.status === 404 && !throwIfNotFound) {
			return
		}

		throw new Error('Impossible de récupérer les données demandées : ' + response.status)
	})
}

function sortByNom(features) {
	return features.sort(function(a,b){return a.properties.nom.localeCompare(b.properties.nom);})
}

function getCommunes(codeDepartement) {
	return getRemoteJSON(`https://geo.api.gouv.fr/departements/${codeDepartement}/communes?geometry=contour&format=geojson&type=commune-actuelle`).then(function (communes) {

		// Pour Paris, Lyon, Marseille, il faut compléter avec les arrondissements
		if (['75', '69', '13'].includes(codeDepartement)) {
			var features = communes.features.filter(function (e) {
				return !(['13055', '69123', '75056'].includes(e.properties.code))
			})
			ARRONDISSEMENTS.features.forEach(function (arrondissement) {
				if (arrondissement.properties.code.startsWith(codeDepartement)) {
					features.push(arrondissement)
				}
			})
			return {type: 'FeatureCollection', features: sortByNom(features)}
		}

		return {type: 'FeatureCollection', features: sortByNom(communes.features)}
	})
}

function getMutations(codeCommune, idSection, startDate, endDate) {
	return getRemoteJSON(`/api/mutations3/${codeCommune}/${idSectionToCode(idSection)}`)
		.then(function (data) {
			return data.mutations.filter(function (m) {
				return m.date_mutation >= startDate && m.date_mutation <= endDate && m.id_parcelle.startsWith(idSection)
			})
		})
}

function getCadastreLayer(layerName, codeCommune) {
	
		var communesToGet = codeCommune in COMMUNESMAP ? COMMUNESMAP[codeCommune] : [codeCommune]
		return Promise.all(communesToGet.map(function (communeToGet) {
			return getRemoteJSON(`https://cadastre.data.gouv.fr/bundler/cadastre-etalab/communes/${communeToGet}/geojson/${layerName}`)
		})).then(function (featureCollections) {
			return {
				type: 'FeatureCollection',
				features: featureCollections.reduce(function (acc, featureCollection) {
					if (featureCollection && featureCollection.features) {
						return acc.concat(featureCollection.features)
					}

					return acc
				}, [])
			}
		})

}

function getParcelles(codeCommune, idSection) {
	return getCadastreLayer('parcelles', codeCommune).then(function (featureCollection) {
		return {
			type: 'FeatureCollection',
			features: _.chain(featureCollection.features)
				.filter(function (f) {
					return f.id.startsWith(idSection)
				})
				//.sortBy('id')
				.value()
		}
	})
}


function getSections(codeCommune) {
	return getCadastreLayer('sections', codeCommune).then(function (featureCollection) {
		var features = featureCollection.features
		var hasMultiplePrefixes = features.some(function (f) {
			return f.properties.commune !== codeCommune || f.properties.prefixe !== '000'
		})
		features.forEach(function (f) {
			if (!hasMultiplePrefixes) {
				f.properties.label = f.properties.code
				return
			}

			var labelPrefix = f.properties.commune === codeCommune ? f.properties.prefixe : f.properties.commune.substr(2)
			f.properties.label = `${labelPrefix} ${f.properties.code}`
		})
		return {type: 'FeatureCollection', features: features}
		// return {type: 'FeatureCollection', features: sortByLabel(features)}
	})
}
