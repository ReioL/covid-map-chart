import React, { useState, useRef, useEffect } from "react"
import Chart from "chart.js"

const chartConfig = {
  type: "bar",
  data: {
    datasets: [],
  },
  options: {
    tooltips: {
      mode: "index",
      intersect: false,
      callbacks: {
        footer: (tooltipItems) => {
          const total = tooltipItems.reduce((acc, data) => acc + data.yLabel, 0)
          return `Total: ${total}`
        },
      },
    },
    scales: {
      xAxes: [
        {
          type: "time",
          time: {
            tooltipFormat: "DD-MMM",
            displayFormats: {
              day: "DD MMM",
            },
            unit: "day",
          },
          stacked: true,
          offset: true,
          gridLines: {
            drawOnChartArea: false,
          },
          bounds: "ticks",
          barPercentage: 0.5,
        },
      ],
      yAxes: [
        {
          type: "linear",
          ticks: {
            beginAtZero: true,
            maxTicksLimit: 15,
            min: 0,
            callback: (value, index, values) => {
              return value
            },
          },
          stacked: true,
          gridLines: {
            drawOnChartArea: true,
          },
        },
      ],
    },
  },
}

export default function Graph({ countryCode }) {
  const [chartInstance, setChartInstance] = useState(null)
  const chartContainer = useRef(null)
  useEffect(() => {
    const newChartInstance = new Chart(chartContainer.current, chartConfig)
    setChartInstance(newChartInstance)
  }, [chartContainer])

  useEffect(() => {
    if (chartInstance) {
      fetch(`https://api.covid19api.com/total/dayone/country/${countryCode}`)
        .then((response) => response.json())
        .then((json) => {
          const data = json.reduce(
            (acc, { Date, Confirmed, Deaths, Recovered, Active }) => {
              return {
                confirmedData: [...acc.confirmedData, { t: Date, y: Confirmed }],
                deathData: [...acc.deathData, { t: Date, y: Deaths }],
                recoveredData: [...acc.recoveredData, { t: Date, y: Recovered }],
                activeData: [...acc.activeData, { t: Date, y: Active }],
              }
            },
            { confirmedData: [], deathData: [], recoveredData: [], activeData: [] }
          )
          chartInstance.data.datasets = [
            /* { label: "confirmed", data: data.confirmedData, backgroundColor: "rgba(255, 99, 132, 0.5)" }, */
            {
              label: "deaths",
              data: data.deathData,
              backgroundColor: "rgba(229, 42, 42, 1)",
              minBarLength: 5,
            },
            {
              label: "recovered",
              data: data.recoveredData,
              backgroundColor: "rgba(82, 229, 42, 1)",
              minBarLength: 5,
            },
            {
              label: "active",
              data: data.activeData,
              backgroundColor: "rgba(42, 104, 229, 1)",
              minBarLength: 5,
            },
          ]
          chartInstance.update()
        })
    }
  }, [countryCode, chartInstance])
  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <div style={{ width: "2000px", height: "50vh" }}>
        <canvas ref={chartContainer} style={{ width: "0px" }} />
      </div>
    </div>
  )
}
