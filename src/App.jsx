import React, { useState, useEffect } from "react";
import axios from "axios";

const API_KEY = "128dcc08bbd92630daa156923027a9ea"; 

const WeatherDashboard = () => {
    const [city, setCity] = useState("Dhaka");
    const [weather, setWeather] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [uvIndex, setUvIndex] = useState(null);
    const [otherCountries, setOtherCountries] = useState([
        { name: "Australia", city: "Canberra", weather: null },
        { name: "Japan", city: "Tokyo", weather: null }
    ]);

    useEffect(() => {
        fetchWeather(city);
        fetchOtherCountriesWeather();
    }, []);

    const fetchWeather = async (cityName) => {
        try {
            const weatherRes = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
            );
            setWeather(weatherRes.data);

            const { coord } = weatherRes.data;
            fetchUVIndex(coord.lat, coord.lon);

            const forecastRes = await axios.get(
                `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`
            );
            setForecast(forecastRes.data);
        } catch (error) {
            console.error("Error fetching weather data", error);
            alert("City not found. Please try again!");
        }
    };

    const fetchUVIndex = async (lat, lon) => {
        try {
            const uvRes = await axios.get(
                `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`
            );
            setUvIndex(uvRes.data.value);
        } catch (error) {
            console.error("Error fetching UV Index", error);
        }
    };

    const fetchOtherCountriesWeather = async () => {
        const updatedCountries = await Promise.all(
            otherCountries.map(async (country) => {
                try {
                    const res = await axios.get(
                        `https://api.openweathermap.org/data/2.5/weather?q=${country.city}&appid=${API_KEY}&units=metric`
                    );
                    return { ...country, weather: res.data };
                } catch (error) {
                    console.error(`Error fetching weather for ${country.city}`, error);
                    return country;
                }
            })
        );
        setOtherCountries(updatedCountries);
    };

    const getWeatherIcon = (weatherMain) => {
        switch (weatherMain) {
            case 'Rain': return '🌧️';
            case 'Clear': return '☀️';
            case 'Clouds': return '☁️';
            default: return '🌤️';
        }
    };

    const getDayOfWeek = (date) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[date.getDay()];
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    return (
        <div className="weather-dashboard">
            <div className="sidebar">
                <div className="menu-icons">
                    <div className="menu-icon">≡</div>
                </div>
            </div>

            <div className="main-content">
                <div className="top-right-section">
                    <div className="search-area">
                        <input 
                            type="text" 
                            placeholder="Search your location" 
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    fetchWeather(city);
                                }
                            }}
                        />
                        <button onClick={() => fetchWeather(city)}>🔍</button> 
                    </div>
                </div>

                {weather && (
                    <div className="main-weather-section">
                        <div className="location-info">
                            <h2>{weather.name}, {weather.sys.country}</h2>
                            <p>{getDayOfWeek(new Date())}</p>
                        </div>

                        <div className="current-weather">
                            <div className="weather-icon">
                                {getWeatherIcon(weather.weather[0].main)}
                            </div>
                            <div className="temperature">
                                <span className="temp-main">{Math.round(weather.main.temp)}°C</span>
                                <span className="temp-range">
                                    {Math.round(weather.main.temp_min)}°/{Math.round(weather.main.temp_max)}°
                                </span>
                                <p className="weather-description">{weather.weather[0].description}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="weather-details">
                    <div className="todays-highlight">
                        <h3>Today's Highlight</h3>
                        {weather && (
                            <div className="highlight-grid">
                                <div className="highlight-item">
                                    <span>💨 Wind Status</span>
                                    <p>{weather.wind.speed} km/h</p>
                                </div>
                                <div className="highlight-item">
                                    <span>💧 Humidity</span>
                                    <p>{weather.main.humidity}%</p>
                                </div>
                                <div className="highlight-item">
                                    <span>☀️ UV Index</span>
                                    <p>{uvIndex ? uvIndex : "Loading..."}</p>
                                </div>
                                <div className="highlight-item">
                                    <span>👀 Visibility</span>
                                    <p>{weather.visibility / 1000} km</p>
                                </div>
                                <div className="highlight-item">
                                    <span>🌅 Sunrise</span>
                                    <p>{formatTime(weather.sys.sunrise)}</p>
                                </div>
                                <div className="highlight-item">
                                    <span>🌄 Sunset</span>
                                    <p>{formatTime(weather.sys.sunset)}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="forecast-section">
                        <h3>5 Day Forecast</h3>
                        <div className="forecast-grid">
                            {forecast && forecast.list
                                .filter((item, index) => index % 8 === 0)
                                .slice(0, 5)
                                .map((day, index) => (
                                    <div key={index} className="forecast-day">
                                        <p>{['Today', 'Mon', 'Tue', 'Wed', 'Thu'][index]}</p>
                                        <div className="forecast-icon">
                                            {getWeatherIcon(day.weather[0].main)}
                                        </div>
                                        <p>{Math.round(day.main.temp)}°C</p>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeatherDashboard;
