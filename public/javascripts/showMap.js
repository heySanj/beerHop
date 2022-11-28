mapboxgl.accessToken = mapBoxToken
  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/heysanj/clavtsygn000u14p7uo1kqhgn', // style URL
    center: breweryJSON.geometry.coordinates, // starting position [lng, lat]
    zoom: 14, // starting zoom
    attributionControl: false
})

map.addControl(new mapboxgl.NavigationControl())

const marker = new mapboxgl.Marker({
    color: "#ebb522"
  })
  .setLngLat(breweryJSON.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 })
    .setHTML(
      `<h5 style="font-size: 14px"><b>${breweryJSON.name}</b></h5>`
    )
  )
  .addTo(map)

map.addControl(new mapboxgl.FullscreenControl());


// Resize the map when the Show map button is clicked
document.getElementById("mapButton").addEventListener("click", () => map.resize());
