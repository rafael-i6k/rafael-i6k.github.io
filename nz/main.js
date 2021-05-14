//-43.883333, 170.516667  south east

let stop = {
    nr: 2,
    name: "Lake Tekapo",
    lat: -43.883333,
    lng: 170.516667,
    user: "rafael-i6k",
    wikipedia: "https://en.wikipedia.org/wiki/Lake_Tekapo"
};

const map = L.map("map", { //L muss gross geschrieben sein um Leaflet accessen zu können
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

/* ROUTE.sort((stop1, stop2) => {
    return stop1.nr > stop2.nr
});
 */
//sortiert nun nach nummer aufsteigend, kann < ändern < absteigend

for (let entry of ROUTE) {
    //console.log(entry);

    nav.innerHTML += `<option value="${entry.user}">Stop ${entry.nr}: ${entry.name}</option>`;
    

    let mrk = L.marker([entry.lat, entry.lng]).addTo(map);
    mrk.bindPopup(`
        <h4>Stop ${entry.nr}: ${entry.name}</h4>
        <p><a href="${entry.wikipedia}"><i class="fas fa-external-link-alt mr-3"></i>Read about stop in Wikipedia</a></p>
`);

    if (entry.nr == 2) {
        map.setView([entry.lat, entry.lng], 12)
        mrk.openPopup();
    }

}

nav.options.selectedIndex = 2 - 1;

nav.onchange = (evt) => {
    let selected = evt.target.selectedIndex;
    let options = evt.target.options;
    let username = options[selected].value;
    let link = `https://${username}.github.io/nz/index.html`;
    console.log(username, link);

    window.location.href = link;
};

//<option value="rafael-i6k">Lake Tekapo</option>

//console.log(document.querySelector("#map"));

// {s} bedeutet server, um traffic auf server von openstreetmap abzuregeln
// L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")


//https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png

var miniMap = new L.Control.MiniMap(L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"), {
    toggleDisplay: true,
    minimized: false,
}).addTo(map);