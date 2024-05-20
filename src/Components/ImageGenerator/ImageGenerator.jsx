import React, { useRef, useState, useEffect } from 'react'
import './ImageGenerator.css'
import default_image from '../Assets/default_image.svg'
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, off } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const ImageGenerator = () => {


    const [humidity, setHumidity] = useState(0);
    const [temperature, setTemperature] = useState(0);
    const [brightness, setBrightness] = useState(0);
    useEffect(() => {
        const db = getDatabase();
        const databaseRef = ref(db, 'Sensores');

        const onDataChange = (snapshot) => {
            const data = snapshot.val();
            setHumidity(data.sensorHumedad);
            setTemperature(data.sensorTemperatura);
            setBrightness(data.sensorLuminosidad);
        };

        const databaseListener = onValue(databaseRef, onDataChange);

        return () => {
            off(databaseRef, 'value', databaseListener); // Detener la escucha del evento 'value'
        };
    }, []);

    const [image_url, setImageUrl] = useState("/");

    let inputRef = useRef(null);

    const [loading, setLoading] = useState(false);

    const [style, setStyle] = useState("photorealism");

    // const [humidity, setHumidity] = useState(51);
    //const [temperature, setTemperature] = useState(80);
    // const [brightness, setBrightness] = useState(100);

    const styles = ["photorealism", "impressionism", "renaissance", "anime"];

    // Funciones para traducir valores de sensores en palabras descriptivas
    const getHumidityDescription = (humidity) => {
        if (humidity < 10) return "arid";
        if (humidity < 20) return "very dry";
        if (humidity < 30) return "dry";
        if (humidity < 60) return "wet";
        return "rainy";
    };

    const getTemperatureDescription = (temperature) => {
        if (temperature < 5 ) return "freezing"; 
        if (temperature < 10) return "cold";
        if (temperature < 25) return "mild";
        if (temperature < 35) return "hot";
        return "super hot";
    };

    const getBrightnessDescription = (brightness) => {
        if (brightness < 100) return "dark";
        if (brightness < 300) return "dim";
        if (brightness < 700) return "slightly bright";
        return "super bright";
    };

    const ImageGenerator = async () => {
        if (inputRef.current.value === "") {
            return 0;
        }
        const humidityDescription = getHumidityDescription(humidity);
        const temperatureDescription = getTemperatureDescription(temperature);
        const brightnessDescription = getBrightnessDescription(brightness);

        const prompt = `${inputRef.current.value}  in a ${brightnessDescription} environment that has a ${temperatureDescription} weather and is ${humidityDescription}, ${style} style`;

        setLoading(true);

        const response = await fetch(
            "https://api.openai.com/v1/images/generations",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer" + " " + process.env.REACT_APP_OPENAI_API_KEY,
                    "User-Agent": "Chrome", 
                },
                body: JSON.stringify({
                    prompt: prompt,
                    model: "dall-e-3",
                    n:1,
                    size: "1024x1024"
                }),
            }
        );
        let data = await response.json();
        let data_array = data.data;
        setImageUrl(data_array[0].url);
        setLoading(false);
    }

    return (
        <div className='ai-image-generator'>
            <div className="header">Stable <span> IOT </span> </div>
            <div className="sensor-readings">
                <div>Humedad: {humidity.toFixed(2)}%</div>
                <div>Temperatura: {temperature.toFixed(2)}°C</div>
                <div>Luminosidad: {brightness.toFixed(2)} cd/m²</div>
            </div>
            <div className="img-loading">
                <div className="image"><img src={image_url==="/"?default_image:image_url} alt="" /></div>
                <div className="loading">
                    <div className={loading?"loading-bar-full":"loading-bar"}></div>
                    <div className={loading?"loading-text":"display-none"}>Loading...</div>
                </div>
            </div>
            <div className="style-selector">
                {styles.map((s) => (
                    <label key={s}>
                        <input
                            type="radio"
                            value={s}
                            checked={style === s}
                            onChange={() => setStyle(s)}
                        />
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                    </label>
                ))}
            </div>
            <div className="search-box">
                <input type="text" ref={inputRef} className= 'search-input' placeholder='Describe your image' />
                <div className="generate-btn" onClick={()=>{ImageGenerator()}}>Generate</div>
            </div>
        </div>
    )
}

export default ImageGenerator

