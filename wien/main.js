// OGD-Wien Beispiel

// Kartenhintergründe der basemap.at definieren
let baselayers = {
    standard: L.tileLayer.provider("BasemapAT.basemap"),
    grau: L.tileLayer.provider("BasemapAT.grau"),
    terrain: L.tileLayer.provider("BasemapAT.terrain"),
    surface: L.tileLayer.provider("BasemapAT.surface"),
    highdpi: L.tileLayer.provider("BasemapAT.highdpi"),
    ortho_overlay: L.layerGroup([
        L.tileLayer.provider("BasemapAT.orthofoto"),
        L.tileLayer.provider("BasemapAT.overlay")
    ]),
};


// Overlays für die Themen zum Ein- und Ausschalten definieren
let overlays = {
    busLines: L.featureGroup(),
    busStops: L.markerClusterGroup(),
    pedAreas: L.featureGroup(),
    sights: L.featureGroup(),
};

// Karte initialisieren und auf Wiens Wikipedia Koordinate blicken
let map = L.map("map", {
    fullscreenControl: true,
    center: [48.208333, 16.373056],
    zoom: 13,
    layers: [
        baselayers.grau
    ]
});

// minimap, muss nach Initialisierung der Karte kommen, da sonst addTo(map) den Code abstürzt
var miniMap = new L.Control.MiniMap(L.tileLayer.provider("BasemapAT.basemap"), {
    toggleDisplay: true,
    minimized: false,
}).addTo(map);


// Kartenhintergründe und Overlays zur Layer-Control hinzufügen
let layerControl = L.control.layers({
    "basemap.at Standard": baselayers.standard,
    "basemap.at grau": baselayers.grau,
    "basemap.at Relief": baselayers.terrain,
    "basemap.at Oberfläche": baselayers.surface,
    "basemap.at hochauflösend": baselayers.highdpi,
    "basemap.at Orthofoto beschriftet": baselayers.ortho_overlay
}, {
    "Liniennetz Vienna Sightseeing": overlays.busLines,
    "Haltestellen Vienna Sightseeing": overlays.busStops,
    "Fußgängerzonen": overlays.pedAreas,
    "Sehenswürdigkeiten": overlays.sights
}).addTo(map);

// alle Overlays nach dem Laden anzeigen
overlays.busLines.addTo(map);
overlays.busStops.addTo(map);
overlays.pedAreas.addTo(map);
overlays.sights.addTo(map);

let drawBusStop = (geojsonData) => {
    L.geoJson(geojsonData, {
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`<strong>${feature.properties.LINE_NAME}</strong>
            <hr>
            Station: ${feature.properties.STAT_NAME}`)
        },
        pointToLayer: (geoJsonPoint, latlng) => {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: 'icons/busstop.png',
                    iconSize: [38, 38]
                })
            })
        },
        attribution: '<a href="https://data.wien.gv.at">Stadt Wien</a>, <a href="https://mapicons.mapsmarker.com">Maps Icons Collection</a>'
    }).addTo(overlays.busStops);
}

let drawBusLines = (geojsonData) => {
   // console.log('Bus Lines: ', geojsonData);
    L.geoJson(geojsonData, {
        style: (feature) => {
            let col = COLORS.buslines[feature.properties.LINE_NAME];
            return {
                color: col
            }
        },
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`<strong>${feature.properties.LINE_NAME}</strong>
            <hr>
            von ${feature.properties.FROM_NAME}<br>
            nach ${feature.properties.TO_NAME}`)
        }
    }).addTo(overlays.busLines);
}

let drawPedestrianAreas = (geojsonData) => {
    //console.log('Zone: ', geojsonData);
    L.geoJson(geojsonData, {
        style: (feature) => {
            return {
                stroke: true,
                color: "silver",
                fillColor: "yellow",
                fillOpacity: 0.3
            }
        },
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`<strong>Fußgängerzone ${feature.properties.ADRESSE}</strong>
            <hr>
            ${feature.properties.ZEITRAUM} <br>
            ${feature.properties.AUSN_TEXT}
            `);
        }
    }).addTo(overlays.pedAreas);
}

let drawSights = (geojsonData) => {
    //console.log('Sehenswuerdigkeit: ', geojsonData);
    L.geoJson(geojsonData, {
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`<strong>${feature.properties.NAME}</strong>
            <hr>
            Sehenswuerdigkeit: ${feature.properties.NAME}`)
        },
        pointToLayer: (geoJsonPoint, latlng) => {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: 'icons/sehenswuerdig.png',
                    iconSize: [38, 38]
                })
            })
        },
    }).addTo(overlays.sights);
}

for (let config of OGDWIEN) {
    // console.log("Config: ", config.data);
    fetch(config.data)
        .then(response => response.json())
        .then(geojsonData => {
            // console.log("Data: ", geojsonData);
            if (config.title == "Haltestellen Vienna Sightseeing") {
                drawBusStop(geojsonData);
            } else if (config.title == "Liniennetz Vienna Sightseeing") {
                drawBusLines(geojsonData);
            } else if (config.title === "Fußgängerzonen") {
                drawPedestrianAreas(geojsonData);
            } else if (config.title == "Sehenswürdigkeiten") {
                drawSights(geojsonData);
            }
        })
}
// leaflet hash
var hash = new L.Hash(map);

let styleIntervals = (feature) => {
    //console.log(feature.properties);
    //console.log(feature.properties.Measure);
    let color  = "";
    let range = feature.properties.Range;
    if (feature.properties.Measure === "time") {
        color = COLORS.minutes[range];
    } else if (feature.properties.Measure === "distance") {
        color = COLORS.kilometers[range];
    } else {
        color = "black";
    }
    return {
        color: color,
        opacity: 0.5,
        fillOpacity: 0.2
    };
};

L.control.reachability({
    // add settings/options here; -2x doppelte Groesse des Icons
    apiKey: '5b3ce3597851110001cf6248e7ba00d651304c2ca3bf9931047a8204',
    styleFn: styleIntervals,
    drawButtonContent: '',
    drawButtonStyleClass: 'fa fa-pencil-alt fa-2x', //falsch
    deleteButtonContent: '',
    deleteButtonStyleClass: 'fa fa-trash fa-2x',
    distanceButtonContent: '',
    distanceButtonStyleClass: 'fa fa-road fa-2x',
    timeButtonContent: '',
    timeButtonStyleClass: 'far fa-clock fa-2x', //falsch
    travelModeButton1Content: '',
    travelModeButton1StyleClass: 'fa fa-car fa-2x',
    travelModeButton2Content: '',
    travelModeButton2StyleClass: 'fa fa-bicycle fa-2x',
    travelModeButton3Content: '',
    travelModeButton3StyleClass: 'fa fa-male fa-2x',
    travelModeButton4Content: '',
    travelModeButton4StyleClass: 'fas fa-wheelchair fa-2x' //falsch
}).addTo(map);

//
// token key
// 5b3ce3597851110001cf6248e7ba00d651304c2ca3bf9931047a8204