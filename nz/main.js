//-43.883333, 170.516667  south east

let stop = {
    nr: 2,
    name: "Lake Tekapo",
    lat: -43.883333,
    lng: 170.516667,
    user: "rafael-i6k",
    wikipedia: "https://en.wikipedia.org/wiki/Lake_Tekapo"
};

const map = L.map("map", {
    //center: [stop.lat, stop.lng],
    //zoom: 13,
    layers: [
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    ]
});

let nav = document.querySelector("#navigation");
console.log(nav);

//console.log(ROUTE);

ROUTE.sort((stop1, stop2) => {
    return stop1.nr > stop2.nr
});

//sortiert nun nach nummer aufsteigend, kann < ändern < absteigend

for (let entry of ROUTE) {
    //console.log(entry);

    nav.innerHTML += `
        <option value="${entry.user}">Stop ${entry.nr}: ${entry.name}</option>
    
    `;

    let mrk = L.marker([ entry.lat, entry.lng ]).addTo(map);
    mrk.bindPopup(`
        <h4>Stop ${entry.nr}: ${entry.name}</h4>
        <p><i class="fas fa-external-link-alt mr-3"></i> <a href="${stop.wikipedia}">Read about stop in Wikipedia</a></p>
`);

    if (entry.nr == 2) {
        map.setView([ entry.lat, entry.lng], 13)
        mrk.openPopup();
    }

}

//<option value="rafael-i6k">Lake Tekapo</option>

//console.log(document.querySelector("#map"));

// {s} bedeutet server, um traffic auf server von openstreetmap abzuregeln
// L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")