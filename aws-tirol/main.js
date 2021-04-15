
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

fetch(awsUrl)
    .then(response => response.json())
    .then(json => {
        console.log('Daten konvertiert: ', json);
        for (station of json.features) {
            console.log('Station: ', station);
            let marker = L.marker([station.geometry.coordinates[1], 
                station.geometry.coordinates[0]]
                );
            marker.addTo(map);
        }
});

//fetch holt daten von URL, nach dem Daten geholt wurden führt then eine nächste funktion aus

//https://lawine.tirol.gv.at/data/produkte/ogd.geojson falscher link

//https://wiski.tirol.gv.at/lawine/produkte/ogd.geojson