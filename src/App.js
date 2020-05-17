import React, { useState, useEffect } from "react"
import Graph from "./Graph"
import countriesData from "../countries.json"
//{ "type": "Feature", "properties": { "ADMIN": "Aruba", "ISO_A3": "ABW" }, "geometry":
//{ "type": "Polygon", "coordinates": [ [ [ -69.996937628999916, 12.577582098000036 ],
//[ -69.936390753999945, 12.531724351000051 ], [ -69.924672003999945, 12.519232489000046 ],
//[ -69.915760870999918, 12.497015692000076 ], [ -69.880197719999842, 12.453558661000045 ], ...] ] } },
const { L } = window
let mymap = null
export default function App() {
  const [openOverlay, setOpenOverlay] = useState(false)
  const [location, setLocation] = useState("")
  const [countryCode, setCountryCode] = useState("")
  const [countryTotal, setCountryTotal] = useState({})
  const [total, setTotal] = useState({})
  window.onclick = (event) => {
    const modal = document.getElementById("myModal")
    if (event.target === modal) {
      setOpenOverlay(false)
    }
  }

  useEffect(() => {
    mymap = L.map("map", { minZoom: 3, maxZoom: 6 }).setView([51.505, -0.09], 4)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      noWrap: true,
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
        // eslint-disable-next-line camelcase
        data.forEach(({ location, country_code, confirmed, latitude, longitude }) => {
          const radius = confirmed < 10000 ? 5 : confirmed < 100000 ? 20 : 30
          const circle = L.circleMarker([latitude, longitude], { radius, weight: 0, fillOpacity: 0.5 })
            .addTo(mymap)
            .on("mouseover", () =>
              circle
                .bindTooltip(`${location}</br>${confirmed.toString()}`, { className: "text", direction: "center" })
                .openTooltip()
            )
            .on("click", () => {
              setOpenOverlay(true)
              setCountryCode(country_code)
              setLocation(location)
            })
          const tooltip = L.tooltip({
            permanent: false,
            direction: "center",
            className: "text",
          })
            .setContent(confirmed.toString())
            .setLatLng(circle.getLatLng())
          //tooltip.addTo(mymap)
        })
      })
  }, [])

  useEffect(() => {
    if (countryCode) {
      fetch(`https://www.trackcorona.live/api/countries/${countryCode}`)
        .then((response) => response.json())
        .then((json) => {
          const { confirmed, dead, recovered, updated } = json.data[0]
          setCountryTotal({ confirmed, dead, recovered, updated })
        })
    }
  }, [countryCode])

  useEffect(() => {
    fetch("https://api.covid19api.com/world/total")
      .then((response) => response.json())
      .then((json) => {
        const { TotalConfirmed, TotalDeaths, TotalRecovered } = json
        setTotal({
          totalConfirmed: TotalConfirmed.toLocaleString(),
          totalDeaths: TotalDeaths.toLocaleString(),
          totalRecovered: TotalRecovered.toLocaleString(),
        })
      })
  }, [])

  useEffect(() => {
    if (openOverlay) {
      // eslint-disable-next-line no-underscore-dangle
      mymap._handlers.forEach((handler) => handler.disable())
    } else {
      // eslint-disable-next-line no-underscore-dangle
      mymap._handlers.forEach((handler) => handler.enable())
    }
  }, [openOverlay])

  return (
    <>
      <div className="mapContainer">
        <div id="map">
          {openOverlay ? (
            <div id="myModal" className="modal" style={{ display: openOverlay ? "block" : "none" }}>
              <div className="modal-content">
                <div className="modal-header">
                  <h2>{location}</h2>
                  <span
                    className="close"
                    onClick={() => setOpenOverlay(false)}
                    onKeyPress={() => {}}
                    role="button"
                    tabIndex="0"
                  >
                    &times;
                  </span>
                </div>
                <div className="modal-body">
                  {countryCode ? <Graph countryCode={countryCode} /> : <div>Loading...</div>}
                </div>
                <div className="modal-footer">
                  <h3>
                    Total stats{" "}
                    <span style={{ float: "right" }}>
                      Last updated: {new Date(countryTotal.updated).toLocaleString()}
                    </span>
                  </h3>
                  <p>Total Confirmed: {countryTotal.confirmed}</p>
                  <p>Total Deaths: {countryTotal.dead}</p>
                  <p>Total Recovered: {countryTotal.recovered}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <div className="totalHeader">Total cases globally</div>
      <div className="totalData">
        <div className="totalConfirmed">
          Confirmed cases <div>{total.totalConfirmed}</div>
        </div>
        <div className="totalDeaths">
          Confirmed deaths <div>{total.totalDeaths}</div>
        </div>
        <div className="totalRecovered">
          Confirmed recovered <div>{total.totalRecovered}</div>
        </div>
      </div>
    </>
  )
}
