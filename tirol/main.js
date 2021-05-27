/* global L */
// Bike Trail Tirol Beispiel

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
    tracks: L.featureGroup(),
    wikipedia: L.featureGroup()
};

// Karte initialisieren und auf Innsbrucks Wikipedia Koordinate blicken
let map = L.map("map", {
    center: [47.267222, 11.392778],
    zoom: 9,
    layers: [
        baselayers.grau
    ]
})
// Kartenhintergründe und Overlays zur Layer-Control hinzufügen
let layerControl = L.control.layers({
    "basemap.at Standard": baselayers.standard,
    "basemap.at grau": baselayers.grau,
    "basemap.at Relief": baselayers.terrain,
    "basemap.at Oberfläche": baselayers.surface,
    "basemap.at hochauflösend": baselayers.highdpi,
    "basemap.at Orthofoto beschriftet": baselayers.ortho_overlay
}, {
    "GPX-Tracks": overlays.tracks,
    "Wikipedia-Artikel": overlays.wikipedia
}).addTo(map);

// Wikipedia Artikel Zeichnen 
const drawWikipedia = (bounds) => {
    console.log(bounds);
    let url = `https://secure.geonames.org/wikipediaBoundingBoxJSON?north=${bounds.getNorth()}&south=${bounds.getSouth()}&east=${bounds.getEast()}&west=${bounds.getWest()}&username=rafaelibk&lang=de&maxRows=30`;
    console.log(url);
    // URL bei geonames.org aufrufen und JSO-Daten abholen
    fetch(url).then(
        response => response.json()
    ).then(jsonData => {
        console.log(jsonData);
        // Artikel Marker erzeugen
        for (let article of jsonData.geonames) {
            let mrk = L.marker([article.lat, article.lng]);
            mrk.addTo(overlays.wikipedia);

            // Popup erzeugen
            // optionales Bild definieren
            let img = "";
            if (article.thumbnailImg) {
                img = `<img src="${article.thumbnailImg}" alt="thumbnail">`;
            }

            // Popup definieren
            mrk.bindPopup(`
                <small>${article.feature}</small>
                <h3>${article.title} (${article.elevation}m)</h3>
                ${img}
                <p>${article.summary}</p>
                <a target="Wikipedia" href="https://${article.wikipediaUrl}">Wikipedia-Artikel</a>
            `);
        }
    });
};


 
// Overlay mit GPX-Track anzeigen
overlays.tracks.addTo(map);
overlays.wikipedia.addTo(map);

const controlElevation = L.control.elevation({
    elevationDiv:"#profile",
    followMarker: false,
    theme: 'lime-theme',
}).addTo(map);

let activeElevationTrack;


const drawTrack = (nr) => {
    //console.log('Track: ', nr);
    controlElevation.clear();
    overlays.tracks.clearLayers();
    if(activeElevationTrack){
      activeElevationTrack.removeFrom(map);
    }
 
    let gpxTrack = new L.GPX(`tracks/${nr}.gpx`, {
        async: true, //wartet bis plugin vollständig geladen ist; bei Laden über Server
        marker_options: {
            startIconUrl: `icons/number_${nr}.png`,
            endIconUrl: `icons/finish.png`,
            shadowUrl: null
          },
        polyline_options: {
        color: 'black',
        dashArray: [2, 5],
    }
    }).addTo(overlays.tracks);
    gpxTrack.on("loaded", () => {
        console.log('loaded.gpx');
        map.fitBounds(gpxTrack.getBounds());
        gpxTrack.bindPopup(`
        <h3>${gpxTrack.get_name(gpxTrack)}</h3>
                <ul>
                    <li>Streckenlänge: ${gpxTrack.get_distance()} m</li>
                    <li>tiefster Punkt: ${gpxTrack.get_elevation_min()} m</li>
                    <li>höchster Punkt: ${gpxTrack.get_elevation_max()} m</li>
                    <li>Höhenmeter bergauf: ${gpxTrack.get_elevation_gain()} m</li>
                    <li>Höhenmeter bergab: ${gpxTrack.get_elevation_loss()} m</li>
                </ul>
        `);

        //Wikipedia Artikel 
        drawWikipedia(gpxTrack.getBounds());
       
    });
    controlElevation.load(`tracks/${nr}.gpx`);
    controlElevation.on("eledata_loaded", (evt) => {
        activeElevationTrack = evt.layer;
        //console.log('ele data: ', activeElevationTrack);
        //console.log('elecontr', controlElevation);
    })
};

const selectedTrack = 19;
drawTrack(selectedTrack);

//console.log('biketirol json: ', BIKETIROL);

let pulldown = document.querySelector("#pulldown");
//console.log('Pulldown: ', pulldown);
let selected = '';  //leere Variable definieren bei option einfügen
for (let track of BIKETIROL) {
    if(selectedTrack == track.nr) {
        selected = 'selected';
    } else {
        selected = '';
    }   
    pulldown.innerHTML += `<option ${selected} value="${track.nr}">${track.nr}: ${track.etappe}</option>`;
}

pulldown.onchange = () => {
    //console.log('changed!!!!!', pulldown.value); // schreibt Wert der Änderung in Console
    drawTrack(pulldown.value);
}