document.addEventListener("DOMContentLoaded", () => {
  if (!listingData || !listingData.geometry) return;

  mapboxgl.accessToken = mapToken;

  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    center: listingData.geometry.coordinates,
    zoom: 9
  });

  new mapboxgl.Marker({ color: "red" })
    .setLngLat(listingData.geometry.coordinates)
    .setPopup(
      new mapboxgl.Popup({ offset: 25 })
        .setHTML(
          `<h5>${listingData.title}</h5>
           <p>Exact location provided after booking</p>`
        )
    )
    .addTo(map);
});
