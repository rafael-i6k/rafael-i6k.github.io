//https://leafletjs.com/reference-1.7.1.html#tilelayer
let basemapGray = L.tileLayer.provider('BasemapAT.grau');
//https://leafletjs.com/reference-1.7.1.html#map-example
let map = L.map("map", {
    center: [47, 11],
    zoom: 9,
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
    humidity: L.featureGroup(),
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
    "Relative Luftfeuchte (%)": overlays.humidity,
}, {
    collapsed: false,
}).addTo(map);
//overlays.temperature.addTo(map);

let layerScale = L.control.scale({
    maxwidth: 800,
    metric: true,
    imperial: false,
}).addTo(map);

let getDirection = (value, direction) => {
    for (let rule of direction) {
        if (value >= rule.min && value < rule.max) {
            return rule.dir;
        }
    }
    return "unbestimmt";
};

let getColor = (value, colorRamp) => {
    for (let rule of colorRamp) {
        // for statement schreibt colorRamp in die Variable rule, danach checkt if die colorramp nach min max in der variable rule && verknüpft Argumente
        if (value >= rule.min && value < rule.max) {
            return rule.col;
        }
    }
    return "black";
};

let newLabel = (coords, options) => {
    let color = getColor(options.value, options.colors)
    let label = L.divIcon({
        html: `<div style="background-color:${color}">${options.value}</div>`,
        className: "text-label"
    })
    let marker = L.marker([coords[1], coords[0]], {
        icon: label,
        title: `${options.station} (${coords[2]}m)`
    });
    return marker;
};


let awsUrl = 'https://wiski.tirol.gv.at/lawine/produkte/ogd.geojson';

//https://leafletjs.com/reference-1.7.1.html#featuregroup



fetch(awsUrl)
    .then(response => response.json())
    .then(json => {
        //  console.log('Daten konvertiert: ', json);
        for (station of json.features) {
            //console.log('Station: ', station);
            //https://leafletjs.com/reference-1.7.1.html#marker
            let marker = L.marker([
                station.geometry.coordinates[1],
                station.geometry.coordinates[0]
            ]);

            let formattedDate = new Date(station.properties.date);


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
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.HS.toFixed(0),
                    colors: COLORS.snowheight,
                    station: station.properties.name
                });
                marker.addTo(overlays.snowheight);


            }
            if (typeof station.properties.WG == "number") {
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.WG.toFixed(0),
                    colors: COLORS.windspeed,
                    station: station.properties.name
                });
                marker.addTo(overlays.windspeed);


            }

            if (typeof station.properties.LT == "number") {
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.LT.toFixed(0),
                    colors: COLORS.temperature,
                    station: station.properties.name
                });
                marker.addTo(overlays.temperature);


            }

            if (typeof station.properties.RH == "number") {
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.RH.toFixed(0),
                    colors: COLORS.humidity,
                    station: station.properties.name
                });
                marker.addTo(overlays.humidity);


            }

            if (typeof station.properties.WR == "number") {
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.WR.toFixed(0),
                    colors: DIRECTIONS,
                    station: station.properties.name
                });
                marker.addTo(overlays.winddirection);


            }

        }
        map.fitBounds(overlays.stations.getBounds());
    });


//fetch holt daten von URL, nach dem Daten geholt wurden führt then eine nächste funktion aus
//man muss abwarten was von der Leitung kommt, dies ist die Response, 
//https://lawine.tirol.gv.at/data/produkte/ogd.geojson falscher link

//https://wiski.tirol.gv.at/lawine/produkte/ogd.geojson