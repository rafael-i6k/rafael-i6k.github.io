//https://leafletjs.com/reference-1.7.1.html#tilelayer
let basemapGray = L.tileLayer.provider('BasemapAT.grau');
//https://leafletjs.com/reference-1.7.1.html#map-example
let map = L.map("map", {
    center: [47, 11],
    zoom: 9,
    // legt Mitte der Karte und den Zoom fest, liegt im Ötztal
    layers: [
        basemapGray
    ]
});

let overlays = {
    stations: L.featureGroup(),
    temperature: L.featureGroup(),
    snowheight: L.featureGroup(),
    windspeed: L.featureGroup(),
    winddirection: L.featureGroup(),
};

//https://leafletjs.com/reference-1.7.1.html#control-layers
//https://leafletjs.com/reference-1.7.1.html#tilelayer
let layerControl = L.control.layers({
    'BasemapAT.grau': basemapGray,
    'BasemapAT.orthofoto': L.tileLayer.provider('BasemapAT.orthofoto'),
    'BasemapAT.highdpi': L.tileLayer.provider('BasemapAT.highdpi'),
    'BasemapAT.basemap': L.tileLayer.provider('BasemapAT.basemap'),
    'BasemapAT.surface': L.tileLayer.provider('BasemapAT.surface'),
    'BasemapAT.overlay+ortho': L.layerGroup([
        L.tileLayer.provider('BasemapAT.orthofoto'),
        L.tileLayer.provider('BasemapAT.overlay'),
    ])
}, {
    "Wetterstationen Tirol": overlays.stations,
    "Temperatur (°C)": overlays.temperature,
    "Schneehöhe (cm)": overlays.snowheight,
    "Windgeschwindigkeit (km/h)": overlays.windspeed,
    "Windrichtung": overlays.winddirection,
}, {collapsed: false, 
}) .addTo(map);
overlays.temperature.addTo(map);

let layerScale = L.control.scale({
    maxwidth: 800,
    metric: true,
    imperial: false,
}) .addTo(map);

let newLabel = (coords, options) => {
    let label = L.divIcon({
        html: <div>${options.value}</div>,
        className: "text-label"
    })
    let marker = L.marker([coords[1], coords[0]], {
        icon: label
    });
    return marker;
};

let awsUrl = 'https://wiski.tirol.gv.at/lawine/produkte/ogd.geojson';

//https://leafletjs.com/reference-1.7.1.html#featuregroup

//awsLayer.addTo(map);
//bevor Marker hinzugefügt werden, ist der Layer schon aktiv; 
//Vorteil kann Layer ein und ausschalten
//2.Vorteil ich kann Ausschnitt suchen, dass alle Marker auf der Karte sind fitbounds


fetch(awsUrl)
    .then(response => response.json())
    .then(json => {
        console.log('Daten konvertiert: ', json);
        for (station of json.features) {
            console.log('Station: ', station);
            //https://leafletjs.com/reference-1.7.1.html#marker
            let marker = L.marker([
                station.geometry.coordinates[1], 
                station.geometry.coordinates[0]]
                );

                let formattedDate = new Date(station.properties.date);

                //man muss bei marker die Reihenfolge der Koordinaten ändern, bei Json anders zuerst breite dann länge...glaub ich
                //grundsätzlich x, y, z, json brauch aber y, x also breite vor länge 

                marker.bindPopup(`
                <h3>${station.properties.name}</h3>
                <ul>
                    <li>Datum: ${formattedDate.toLocaleDateString("de")}</li>
                    <li>Temperatur: ${station.properties.LT} C</li>
                    <li>Schneehöhe: ${station.properties.HS} cm</li>
                    <li>Windgeschwindigkeit: ${station.properties.WG || '?'} m/s</li>
                    <li>Luftfeuchtigkeit: ${station.properties.RH || '?'} %</li>
                    <li>Höhe Messstation: ${station.geometry.coordinates[2]} m</li>
                </ul>
                <a target="_blank" href="https://wiski.tirol.gv.at/lawine/grafiken/1100/standard/tag/${station.properties.plot}.png">Grafik</a>
                `);
                marker.addTo(overlays.stations);
                if (typeof station.properties.HS == "number") {
                    let highlightClass = '';
                    if (station.properties.HS > 100) {
                        highlightClass = 'snow-100';
                    }
                    if (station.properties.HS > 200) {
                        highlightClass = 'snow-200';
                    }
                    //https://leafletjs.com/reference-1.7.1.html#divicon
                    let snowIcon = L.divIcon({
                        html: `<div class="snow-label ${highlightClass}">${station.properties.HS}</div>`
                    });
                    //https://leafletjs.com/reference-1.7.1.html#marker
                    let snowMarker = L.marker([
                        station.geometry.coordinates[1],
                        station.geometry.coordinates[0]
                    ], {
                        icon: snowIcon
                    });
                    snowMarker.addTo(overlays.snowheight);
                }
                marker.addTo(overlays.windspeed);
                if (typeof station.properties.WG == "number") {
                    let highlightClass = '';
                    if (station.properties.WG > 3) {
                        highlightClass = 'wind-3';
                    }
                    if (station.properties.WG > 10) {
                        highlightClass = 'wind-10';
                    }
                    //https://leafletjs.com/reference-1.7.1.html#divicon
                    let windIcon = L.divIcon({
                        html: `<div class="wind-label ${highlightClass}">${station.properties.WG}</div>`
                    });
                    //https://leafletjs.com/reference-1.7.1.html#marker
                    let windMarker = L.marker([
                        station.geometry.coordinates[1],
                        station.geometry.coordinates[0]
                    ], {
                        icon: windIcon
                    });
                    windMarker.addTo(overlays.windspeed);
                }
                
                marker.addTo(overlays.temperature);
                //if (station.properties.LT) ist truthy, wenn die Temperatur einen Wert hat und nicht undefined ist; mit Zusatz || == 0 gibt es auch LT aus wenn die Temperatur 0 ist. Das heißt im Umkehrschluss, dass, wenn (ohne Zusatz) LT 0 ist, dies das Statement bzw Bedingung als falsy versteht und deswegen keinen Marker für diese Messtation erzeugt
                // bessere Lösung ist if(typeof station.properties.LT == "number") solange LT eine number ist, ist die if truthy
                if (station.properties.LT || station.properties.LT === 0) {
                    let marker = newLabel(station.geometry.coordinates, {
                        value: station.properties.LT
                    });
                    marker.addTo(overlays.temperature);
                    let highlightTemperatureClass = '';
                    if (station.properties.LT == 0) {
                        highlightTemperarureClass = 'zero-temp';
                    }/*
                    if (station.properties.LT < 0) {
                        highlightTemperatureClass = 'negative-temp';
                    }
                    if (station.properties.LT > 0) {
                        highlightTemperatureClass = 'positive-temp';
                    }
                    //https://leafletjs.com/reference-1.7.1.html#divicon
                    let temperatureIcon = L.divIcon({
                        html: `<div class="temperature-label ${highlightTemperatureClass}">${station.properties.LT}</div>`
                    });
                    let temperatureMarker = L.marker([
                        station.geometry.coordinates[1],
                        station.geometry.coordinates[0]
                    ], {
                        icon: temperatureIcon
                    });
                    temperatureMarker.addTo(overlays.temperature); */
                } 
        }
        //set map view to all stations; ------ Erweiterung "DE" bewirkt deutsches Datumsformat
        map.fitBounds(overlays.stations.getBounds());
});


//fetch holt daten von URL, nach dem Daten geholt wurden führt then eine nächste funktion aus
//man muss abwarten was von der Leitung kommt, dies ist die Response, 
//https://lawine.tirol.gv.at/data/produkte/ogd.geojson falscher link

//https://wiski.tirol.gv.at/lawine/produkte/ogd.geojson



