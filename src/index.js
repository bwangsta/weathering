import "bootstrap-icons/font/bootstrap-icons.css";

import "./style.css"
import "./assets/img/cloudy.jpg"
import "./assets/img/sunny.jpg"
import "./assets/img/drizzle.jpg"
import "./assets/img/rain.jpg"
import "./assets/img/snow.jpg"
import "./assets/img/thunderstorm.jpg"
import WeatherAPI from "./weather-api"
import Weather from "./components/weather"
import Forecast from "./components/forecast"
import SearchResultList from "./components/search-result-list"
import { clear, initialLoad, typeTimer, resetSearchInput, displayTime, showError, validLocation } from "./helper"
// DELETE later
import TestData from "./test-data";

initialLoad()

const content = document.querySelector("#content")
const searchInput = document.querySelector(".searchbar__input")
const searchError = document.querySelector(".searchbar__error")
const searchBtn = document.querySelector(".searchbar__btn")
const searchResultsDiv = document.querySelector(".search-results")

const weatherAPI = WeatherAPI()
const timer = typeTimer()

searchInput.addEventListener("keyup", e => {
    timer.reset()
    clear(searchResultsDiv)
    timer.set(showSearchResult, e)
})

searchBtn.addEventListener("click", async e => {
    e.preventDefault()

    const geocode = await weatherAPI.fetchGeocode(searchInput.value)
    const isValidLocation = validLocation(geocode)

    if (searchInput.validity.valid && isValidLocation) {
        const { name, admin1, country, latitude, longitude } = geocode.results[0]
        const data = await weatherAPI.fetchWeather(latitude, longitude)

        renderContent(name, admin1, country, data)
    }
    else {
        showError(searchInput, searchError, isValidLocation)
    }
})

async function showSearchResult(event) {
    const geocode = await weatherAPI.fetchGeocode(event.target.value)
    const isValidLocation = validLocation(geocode)

    if (searchInput.validity.valid && isValidLocation) {
        searchResultsDiv.append(SearchResultList(geocode))
        selectSearchResult()
        searchInput.classList.remove("invalid")
        searchError.textContent = ""
    }
    else {
        showError(searchInput, searchError, isValidLocation)
    }
}

function selectSearchResult() {
    const searchResults = document.querySelectorAll(".results>*")

    searchResults.forEach(location => {
        location.addEventListener("click", async (e) => {
            // immediately search for the weather of that city
            const { lat, lon, city, state, country } = e.target.dataset
            const data = await weatherAPI.fetchWeather(lat, lon)

            renderContent(city, state, country, data)
        })
    })
}

function renderContent(location, state, country, data) {
    timer.reset()
    clear(searchResultsDiv)
    clear(content)

    content.append(
        Weather(location, state, country, data),
        Forecast(data)
    )

    displayTime(data)
    resetSearchInput()
}

// TESTING PURPOSES ONLY
const test = TestData()

async function main(city) {
    const geocode = await test.fetchGeocode(city)
    const { name, admin1, country, latitude, longitude } = geocode.results[0]
    const data = await test.fetchWeather(latitude, longitude)

    content.append(
        Weather(name, admin1, country, data),
        Forecast(data)
    )
    displayTime(data)
}

main("Irvine")