mapboxgl.accessToken = mapBoxToken
const map = new mapboxgl.Map({
  container: "map",
  // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
  style: "mapbox://styles/heysanj/clavtsygn000u14p7uo1kqhgn",
  center: [133.890970, -28.751407],
  zoom: 3,
  attributionControl: false,
  cooperativeGestures: true // Ctrl + Wheel needed to zoom
});

// Add on screen controls
map.addControl(new mapboxgl.NavigationControl())
map.addControl(new mapboxgl.FullscreenControl());


map.on("load", () => {
  // Add a new source from our GeoJSON data and
  // set the 'cluster' option to true. GL-JS will
  // add the point_count property to your source data.
  map.addSource("breweries", {
    type: "geojson",
    data: { features: breweriesJSON },
    cluster: true,
    clusterMaxZoom: 14, // Max zoom to cluster points on
    clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
  });

  map.addLayer({
    id: "clusters",
    type: "circle",
    source: "breweries",
    filter: ["has", "point_count"],
    paint: {
      // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
      // with three steps to implement three types of circles:
      //   * Yellow, 20px circles when point count is less than 5
      //   * Orange, 30px circles when point count is between 5 and 20
      //   * Red, 40px circles when point count is greater than or equal to 20
      "circle-color": [
        "step",
        ["get", "point_count"],
        "#e0c31a",
        5,
        "#faaa32",
        20,
        "#f06a2d",
      ],
      "circle-radius": ["step", ["get", "point_count"], 20, 5, 30, 20, 40],
    },
  });

  map.addLayer({
    id: "cluster-count",
    type: "symbol",
    source: "breweries",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}", // Number of breweries in the cluster
      "text-font": ["Rubik Bold", "Rubik Bold"],
      "text-size": 14,
    },
  });

  map.addLayer({
    id: "unclustered-point",
    type: "circle",
    source: "breweries",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#e0c31a",
      "circle-radius": 7,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#fff",
    },
  });

  // inspect a cluster on click
  map.on("click", "clusters", (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["clusters"],
    });
    const clusterId = features[0].properties.cluster_id;
    map
      .getSource("breweries")
      .getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;

        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom,
        });
      });
  });

  // When a click event occurs on a feature in
  // the unclustered-point layer, open a popup at
  // the location of the feature, with
  // description HTML from its properties.
  map.on("click", "unclustered-point", (bar) => {

    const coordinates = bar.features[0].geometry.coordinates.slice()
    const { popUpMarkup } = bar.features[0].properties

    // Ensure that if the map is zoomed out such that
    // multiple copies of the feature are visible, the
    // popup appears over the copy being pointed to.
    while (Math.abs(bar.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += bar.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(popUpMarkup)
      .addTo(map);
  });

  map.on("mouseenter", "clusters", () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "clusters", () => {
    map.getCanvas().style.cursor = "";
  });
});
