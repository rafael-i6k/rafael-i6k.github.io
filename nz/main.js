//-43.883333, 170.516667  south east

let stop = {
    nr:2,
    name: "Lake Tekapo",
    lat: -43.883333,
    lng: 170.516667,
    user: "rafael-i6k",
    wikipedia: "https://en.wikipedia.org/wiki/Lake_Tekapo"
};

const map = L.map("map", {
    center: [stop.lat, stop.lng],
    zoom: 13,
    layers: [
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    ]
});

let mrk = L.marker([-43.883333, 170.516667]).addTo(map);
mrk.bindPopup(`<h4>Stop ${stop.nr}: ${stop.name}</h4>`).openPopup();

//console.log(document.querySelector("#map"));

// {s} bedeutet server, um traffic auf server von openstreetmap abzuregeln
// L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")