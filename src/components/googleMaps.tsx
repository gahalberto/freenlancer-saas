// components/Map.js
"use client";

import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { CButton, CRow } from "@coreui/react-pro";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUber, faWaze } from '@fortawesome/free-brands-svg-icons';
import { GetUserLocation } from "@/app/_actions/getUserLocation";
import { useSession } from "next-auth/react";

type TypeProps = {
    zipcode: string,
    showButtons: Boolean
}

const containerStyle = {
    width: "100%",
    height: "200px",
};

const Map = ({ zipcode, showButtons }: TypeProps) => {
    const [coordinates, setCoordinates] = useState({ lat: -23.5505, lng: -46.6333 });
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [travelInfo, setTravelInfo] = useState<{ duration: string; distance: string } | null>(null);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        libraries: ["places"],
    });

    const { data: session } = useSession();

    useEffect(() => {
        const fetchCoordinates = async () => {
            try {
                const response = await fetch(
                    `https://maps.googleapis.com/maps/api/geocode/json?address=${zipcode}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
                );
                const data = await response.json();
                if (data.results && data.results.length > 0) {
                    const location = data.results[0].geometry.location;
                    setCoordinates({ lat: location.lat, lng: location.lng });
                } else {
                    console.error("CEP não encontrado.");
                }
            } catch (error) {
                console.error("Erro ao buscar coordenadas:", error);
            }
        };

        const getUserGeo = async () => {
            const userGeo = await GetUserLocation(session?.user.id as string);
            if (userGeo) {
                const lat = Number(userGeo.address_lat);
                const lng = Number(userGeo.address_lng);
                setUserLocation({ lat, lng });

                const response = await fetch(
                    `/api/getDirections?originLat=${lat}&originLng=${lng}&destLat=${coordinates.lat}&destLng=${coordinates.lng}`
                );
                const durationData = await response.json();

                if (durationData.status === 'OK') {
                    const leg = durationData.routes[0].legs[0];
                    setTravelInfo({
                        duration: leg.duration.text,
                        distance: leg.distance.text
                    });
                } else {
                    console.error("Erro ao calcular a rota:", durationData);
                }
            }
        };

        if (session?.user.id) {
            getUserGeo();
        }
        if (zipcode) {
            fetchCoordinates();
        }
    }, [zipcode]);

    if (!isLoaded) return <div>Carregando mapa...</div>;

    return (
        <>
            <GoogleMap clickableIcons={false}  mapContainerStyle={containerStyle} center={coordinates} zoom={15}>
                <Marker position={coordinates} />
                {userLocation && <Marker position={userLocation} label="Sua Localização" />}
            </GoogleMap>

            {travelInfo && (
                <div className="mt-2">
                    <div><b>Tempo da sua casa ao evento:</b> {travelInfo.duration}</div>
                    <div><b>Distancia da sua casa:</b> {travelInfo.distance}</div>
                </div>
            )}


            {showButtons && (
                <CRow>
                    <CButton color="primary" style={{ marginTop: 10 }}
                        onClick={() => window.open(`https://waze.com/ul?ll=${coordinates.lat},${coordinates.lng}&navigate=yes`, "_blank")}
                    >
                        <FontAwesomeIcon icon={faWaze} style={{ marginRight: 10 }} />
                        Abrir no Waze
                    </CButton>

                    <CButton color="dark" style={{ marginTop: 10 }}
                        onClick={() => window.open(`uber://?action=setPickup&pickup[latitude]=${userLocation?.lat}&pickup[longitude]=${userLocation?.lng}&dropoff[latitude]=${coordinates.lat}&dropoff[longitude]=${coordinates.lng}`, "_blank")}
                    >
                        <FontAwesomeIcon icon={faUber} style={{ marginRight: 10 }} /> Abrir no Uber
                    </CButton>
                </CRow>

            )}
        </>
    );
};

export default Map;
