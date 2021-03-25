
//-43.883333, 170.516667  south east

const map = L.map("map", {
    center: [ -43.883333, 170.516667 ],
    zoom: 13,
    layers: [
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    ]
    // {s} bedeutet server, um traffic auf server von openstreetmap abzuregeln
});
console.log(document.querySelector("#map"));
