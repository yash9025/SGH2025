
import { useState, useEffect } from "react"
import { AlertTriangle, Wind, Activity, MapPin, Droplets } from "lucide-react"

export default function Home() {
    const [location, setLocation] = useState({ lat: null, lon: null })
    const [city, setCity] = useState(null)
    const [aqiData, setAqiData] = useState(null)
    const [activity, setActivity] = useState("")
    const [loading, setLoading] = useState(true)
    const API_KEY = "b9e079008a585a57054650b8297e88fc" // Replace with your OpenWeather API key

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords
                    setLocation({ lat: latitude, lon: longitude })
                    fetchCity(latitude, longitude)
                },
                (error) => {
                    console.error("Error getting location:", error)
                    alert("Please allow location access to fetch AQI data.")
                },
            )
        } else {
            console.error("Geolocation is not supported by this browser.")
        }
    }, [])

    useEffect(() => {
        if (location.lat && location.lon) {
            fetchAQI(location.lat, location.lon)
        }
    }, [location])

    const fetchAQI = async (lat, lon) => {
        try {
            setLoading(true);
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
            );
            const data = await response.json();
            if (!data.list || data.list.length === 0) {
                throw new Error("Invalid AQI data received.");
            }
            setAqiData(data.list[0]);
        } catch (error) {
            console.error("Error fetching AQI:", error);
            setAqiData(null);
        } finally {
            setLoading(false);
        }
    };


    const fetchCity = async (lat, lon) => {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`,
            )
            const data = await response.json()
            setCity(data.name)
        } catch (error) {
            console.error("Error fetching city name:", error)
        }
    }

    const getAQICategory = (aqi) => {
        const categories = ["Good", "Fair", "Moderate", "Poor", "Very Poor", "Hazardous"]
        return categories[aqi - 1] || "Unknown"
    }

    const getAQIColor = (aqi) => {
        const colors = [
            "from-emerald-400 to-green-500", // Good
            "from-green-400 to-lime-500", // Fair
            "from-yellow-400 to-amber-500", // Moderate
            "from-orange-400 to-red-500", // Poor
            "from-red-400 to-rose-600", // Very Poor
            "from-purple-500 to-fuchsia-700", // Hazardous
        ]
        return colors[aqi - 1] || "from-gray-400 to-gray-600"
    }

    const getPollutionSource = (components) => {
        if (!components) return "Unknown";
        
        const { pm2_5, pm10, no2, so2, co, nh3 } = components;

        if (pm2_5 > 50 || pm10 > 80) {
            return "Dust/Airborne Particles";
        } else if (no2 > 50 || so2 > 40) {
            return "Industrial";
        } else if (co > 1.0 && no2 > 30) {
            return "Vehicular";  // CO + NO₂ combination improves accuracy
        } else if (nh3 > 10 || so2 > 20) {
            return "Household Chemicals";  // Added SO₂ for better classification
        } else {
            return "Mixed Source";
        }
    };


    const activityRecommendations = {
        Jogging: "Prefer jogging in the early morning when pollution levels are lower.",
        Commute: "Wear a mask and avoid peak traffic hours if AQI is high.",
        "Indoor Stay": "Keep windows closed and use air purifiers if AQI is poor.",
        "School/Work": "Try to carpool or use public transport to reduce emissions.",
    }

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden relative scroll-smooth">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black z-0"></div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600"></div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-10 z-0"></div>

            <div className="relative z-10 container mx-auto px-4 py-12">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 inline-block">
                        AirGuard<span className="text-cyan-400">•</span>AI
                    </h1>
                    <p className="text-cyan-400/80 mt-2 text-lg tracking-wider uppercase">
                        Real-time Air Quality Monitoring System
                    </p>
                </div>

                <div className="max-w-5xl mx-auto">
                    {/* Location info */}
                    <div className="backdrop-blur-md bg-blue-900/10 border border-blue-500/20 rounded-xl p-4 mb-6 flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                                <MapPin className="h-5 w-5 text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Current Location</p>
                                <p className="font-mono">
                                    {city ? (
                                        <span className="text-white">{city}</span>
                                    ) : (
                                        <span className="text-gray-500">Locating...</span>
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-400 text-sm">Coordinates</p>
                            <p className="font-mono text-xs text-gray-300">
                                {location.lat && location.lon
                                    ? `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`
                                    : "Calculating..."}
                            </p>
                        </div>
                    </div>

                    {/* Main dashboard */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* AQI Main Display */}
                        <div className="lg:col-span-1">
                            <div className="backdrop-blur-md bg-blue-900/10 border border-blue-500/20 rounded-xl p-6 h-full">
                                <h2 className="text-lg font-medium text-gray-300 mb-4 flex items-center">
                                    <Activity className="h-5 w-5 mr-2 text-cyan-400" />
                                    Air Quality Index
                                </h2>

                                {loading ? (
                                    <div className="flex flex-col items-center justify-center h-48">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                                        <p className="mt-4 text-gray-400">Analyzing atmosphere...</p>
                                    </div>
                                ) : aqiData ? (
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`relative w-48 h-48 rounded-full flex items-center justify-center bg-gradient-to-br ${getAQIColor(aqiData.main.aqi)} mb-4 shadow-[0_0_15px] shadow-cyan-500/50`}
                                        >
                                            <div className="absolute inset-1 rounded-full bg-black/80 flex items-center justify-center flex-col">
                                                <span className="text-5xl font-bold">{aqiData.main.aqi}</span>
                                                <span className="text-lg mt-1">{getAQICategory(aqiData.main.aqi)}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-400 mt-2">Last updated: {new Date().toLocaleTimeString()}</p>

                                        {aqiData.main.aqi > 3 && (
                                            <div className="mt-4 flex items-center text-amber-400 bg-amber-900/20 px-3 py-2 rounded-lg">
                                                <AlertTriangle className="h-5 w-5 mr-2" />
                                                <span className="text-sm">Air quality alert in effect</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-48">
                                        <p className="text-gray-400">Unable to fetch AQI data</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pollutant Levels */}
                        <div className="lg:col-span-2">
                            <div className="backdrop-blur-md bg-blue-900/10 border border-blue-500/20 rounded-xl p-6 h-full">
                                <h2 className="text-lg font-medium text-gray-300 mb-4 flex items-center">
                                    <Wind className="h-5 w-5 mr-2 text-cyan-400" />
                                    Atmospheric Composition
                                </h2>

                                {loading ? (
                                    <div className="flex items-center justify-center h-48">
                                        <p className="text-gray-400">Loading pollutant data...</p>
                                    </div>
                                ) : aqiData ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {Object.entries(aqiData.components).map(([key, value]) => {
                                            const pollutantNames = {
                                                co: "Carbon Monoxide",
                                                no2: "Nitrogen Dioxide",
                                                o3: "Ozone",
                                                so2: "Sulfur Dioxide",
                                                pm2_5: "PM2.5",
                                                pm10: "PM10",
                                                nh3: "Ammonia",
                                            }

                                            // Determine severity color
                                            let severityColor = "bg-green-500"
                                            if (key === "pm2_5" && value > 25) severityColor = "bg-red-500"
                                            else if (key === "pm10" && value > 50) severityColor = "bg-red-500"
                                            else if (key === "o3" && value > 100) severityColor = "bg-red-500"
                                            else if (key === "no2" && value > 200) severityColor = "bg-red-500"
                                            else if (key === "so2" && value > 350) severityColor = "bg-red-500"
                                            else if (key === "co" && value > 10000) severityColor = "bg-red-500"
                                            else if (key === "nh3" && value > 200) severityColor = "bg-red-500"
                                            else if (value > 0) severityColor = "bg-blue-500"

                                            return (
                                                <div
                                                    key={key}
                                                    className="backdrop-blur-md bg-blue-900/5 border border-blue-500/10 rounded-lg p-3"
                                                >
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-sm font-medium">{pollutantNames[key]}</span>
                                                        <div className={`h-2 w-2 rounded-full ${severityColor}`}></div>
                                                    </div>
                                                    <div className="flex items-baseline">
                                                        <span className="text-2xl font-bold text-white">{value.toFixed(1)}</span>
                                                        <span className="ml-1 text-xs text-gray-400">μg/m³</span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-48">
                                        <p className="text-gray-400">Unable to fetch pollutant data</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>


                    {aqiData && (
                        <div className="backdrop-blur-md bg-blue-900/10 border border-blue-500/20 rounded-xl p-6 mt-6">
                            <h2 className="text-lg font-medium text-gray-300 mb-4 flex items-center">
                                <Droplets className="h-5 w-5 mr-2 text-cyan-400" />
                                Primary Pollution Source
                            </h2>
                            <p className="text-lg">
                                <span className="font-semibold text-cyan-400">{getPollutionSource(aqiData.components)}</span>
                            </p>
                        </div>
                    )}




                    {/* Activity Recommendations */}
                    <div className="backdrop-blur-md bg-blue-900/10 border border-blue-500/20 rounded-xl p-6 mt-6">
                        <h2 className="text-lg font-medium text-gray-300 mb-4 flex items-center">
                            <Droplets className="h-5 w-5 mr-2 text-cyan-400" />
                            Activity Recommendations
                        </h2>

                        <div className="mb-4">
                            <p className="text-gray-400 mb-3">What activity are you planning today?</p>
                            <div className="flex flex-wrap gap-2">
                                {Object.keys(activityRecommendations).map((act) => (
                                    <button
                                        key={act}
                                        className={`cursor-pointer px-4 py-2 rounded-lg transition-all duration-300 ${activity === act
                                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                                            : "bg-blue-900/20 text-gray-300 hover:bg-blue-800/30"
                                            }`}
                                        onClick={() => setActivity(act)}
                                    >
                                        {act}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {activity && (
                            <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4 animate-fadeIn">
                                <p className="text-cyan-300">{activityRecommendations[activity]}</p>

                                {aqiData && aqiData.main.aqi > 3 && activity === "Jogging" && (
                                    <div className="mt-3 text-amber-400 text-sm flex items-start">
                                        <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                        <span>
                                            Current AQI levels are not ideal for outdoor exercise. Consider indoor alternatives today.
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center mt-12 text-xs text-gray-500">
                    <p>AirGuard•AI v1.0</p>
                </div>
            </div>
        </div>
    )
}

