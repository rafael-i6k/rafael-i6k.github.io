
let basemapGray = L.tileLayer.provider('BasemapAT.grau');

let map = L.map("map", {
    center: [47, 11],
    zoom: 9,
    // legt Mitte der Karte und den Zoom fest, liegt im Ötztal
    layers: [
        basemapGray
    ]
});

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
}) .addTo(map);

let awsUrl = 'https://wiski.tirol.gv.at/lawine/produkte/ogd.geojson';

let awsLayer = L.featureGroup();
layerControl.addOverlay(awsLayer, "Wetterstationen Tirol");
//awsLayer.addTo(map);
//bevor Marker hinzugefügt werden, ist der Layer schon aktiv; 
//Vorteil kann Layer ein und ausschalten
//2.Vorteil ich kann Ausschnitt suchen, dass alle Marker auf der Karte sind fitbounds
let snowLayer = L.featureGroup();
layerControl.addOverlay(snowLayer, "Schneehöhen");
snowLayer.addTo(map);

fetch(awsUrl)
    .then(response => response.json())
    .then(json => {
        console.log('Daten konvertiert: ', json);
        for (station of json.features) {
            console.log('Station: ', station);
            let marker = L.marker([
                station.geometry.coordinates[1], 
                station.geometry.coordinates[0]]
                );

                let formattedDate = new Date(station.properties.date);

                //man muss bei marker die Reihenfolge der Koordinaten ändern, bei marker zuerst länge und dann breite...glaub ich
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
                marker.addTo(awsLayer);
                if (station.properties.HS) {
                    let highlightClass = '';
                    if (station.properties.HS > 100) {
                        highlightClass = 'snow-100';
                    }
                    if (station.properties.HS > 200) {
                        highlightClass = 'snow-200';
                    }
                    
                    let snowIcon = L.divIcon({
                        html: `<div class="snow-label">${station.properties.HS}</div>`
                    });
                    let snowMarker = L.marker([
                        station.geometry.coordinates[1],
                        station.geometry.coordinates[0]
                    ], {
                        icon: snowIcon
                    });
                    snowMarker.addTo(snowLayer);
                }
        }
        //set map view to all stations; ------ Erweiterung "DE" bewirkt deutsches Datumsformat
        map.fitBounds(awsLayer.getBounds());
});


//fetch holt daten von URL, nach dem Daten geholt wurden führt then eine nächste funktion aus
//man muss abwarten was von der Leitung kommt, dies ist die Response, 
//https://lawine.tirol.gv.at/data/produkte/ogd.geojson falscher link

//https://wiski.tirol.gv.at/lawine/produkte/ogd.geojson