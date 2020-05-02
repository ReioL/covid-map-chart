import React, { useState, useEffect } from "react"
import countriesData from "../countries.json"
//{ "type": "Feature", "properties": { "ADMIN": "Aruba", "ISO_A3": "ABW" }, "geometry":
//{ "type": "Polygon", "coordinates": [ [ [ -69.996937628999916, 12.577582098000036 ],
//[ -69.936390753999945, 12.531724351000051 ], [ -69.924672003999945, 12.519232489000046 ],
//[ -69.915760870999918, 12.497015692000076 ], [ -69.880197719999842, 12.453558661000045 ], ...] ] } },
const { L } = window

export default function App() {
  let mymap = null
  useEffect(() => {
    mymap = L.map("root", { minZoom: 3, maxZoom: 6 }).setView([51.505, -0.09], 4)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      noWrap: true,
      maxZoom: 18,
    }).addTo(mymap)
    /* L.geoJSON(countriesData, {
        style: { fillColor: "#ff0000", fillOpacity: 0.5, color: "#ff0000" },
        pointToLayer: (feature, latlng) => {},
        onEachFeature: (feature, layer) => {
          console.log(layer.getBounds().getCenter())
          const cent = layer.getBounds().getCenter()
          const text = L.tooltip(
            {
              permanent: true,
              direction: "center",
              className: "text",
            },
            layer
          )
          layer.bindTooltip("test", { permanent: true, offset: [58.595272, 25.0136071] })
        },
      }).addTo(mymap) */
    mymap.setMaxBounds([
      [-85, -180],
      [85, 180],
    ])
  }, [])

  useEffect(() => {
    fetch("https://www.trackcorona.live/api/countries")
      .then((response) => response.json())
      .then(({ data }) => {
        data.forEach(({ location, confirmed, latitude, longitude }) => {
          const circle = L.circleMarker([latitude, longitude], { radius: 10, fillOpacity: 1 })
            .addTo(mymap)
            .bindPopup(location)
          const tooltip = L.tooltip({
            permanent: true,
            direction: "center",
            className: "text",
          })
            .setContent(confirmed.toString())
            .setLatLng(circle.getLatLng())
          tooltip.addTo(mymap)
        })
      })
  }, [])

  return <></>
}
