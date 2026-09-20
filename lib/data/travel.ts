import type { DestinationRef, OriginRef } from "@/lib/engine";

/**
 * Datos de referencia para el planificador de viajes.
 * Son rangos orientativos en euros, NO precios en tiempo real.
 * Revisar trimestralmente y sustituir por datos de API de afiliados
 * (vuelos y alojamiento) en cuanto estén integrados.
 */
export const TRAVEL_REFERENCE_UPDATED = "2026-09";

export const ORIGINS: OriginRef[] = [
  { id: "sevilla", name: "Sevilla", airportTransfer: { budget: 8, value: 10, top: 50 }, transportFactor: 1.1, lat: 37.3891, lon: -5.9845, country: "ES", iata: "SVQ" },
  { id: "madrid", name: "Madrid", airportTransfer: { budget: 10, value: 10, top: 60 }, transportFactor: 1, lat: 40.4168, lon: -3.7038, country: "ES", iata: "MAD" },
  { id: "barcelona", name: "Barcelona", airportTransfer: { budget: 12, value: 15, top: 60 }, transportFactor: 0.95, lat: 41.3874, lon: 2.1686, country: "ES", iata: "BCN" },
  { id: "valencia", name: "Valencia", airportTransfer: { budget: 10, value: 10, top: 50 }, transportFactor: 1.05, lat: 39.4699, lon: -0.3763, country: "ES", iata: "VLC" },
  { id: "malaga", name: "Málaga", airportTransfer: { budget: 9, value: 9, top: 45 }, transportFactor: 1.05, lat: 36.7213, lon: -4.4214, country: "ES", iata: "AGP" },
  { id: "bilbao", name: "Bilbao", airportTransfer: { budget: 6, value: 6, top: 60 }, transportFactor: 1.15, lat: 43.263, lon: -2.935, country: "ES", iata: "BIO" },
];

export const DESTINATIONS: DestinationRef[] = [
  {
    id: "roma",
    name: "Roma",
    nameEn: "Rome",
    lat: 41.9028,
    lon: 12.4964,
    country: "IT",
    iata: "ROM",
    curated: true,
    transport: { budget: 90, value: 170, top: 320 },
    lodgingPerRoomNight: { budget: 70, value: 130, top: 260 },
    foodPerDay: { budget: 30, value: 50, top: 90 },
    activitiesPerDay: { budget: 15, value: 30, top: 60 },
    highlights: {
      budget: ["Fontana di Trevi y Panteón a pie", "Trastevere al atardecer", "Museos Vaticanos el último domingo de mes"],
      value: ["Coliseo, Foro y Palatino con entrada combinada", "Museos Vaticanos con reserva", "Cena en el Testaccio"],
      top: ["Coliseo con acceso a la arena", "Vaticano a primera hora con guía", "Clase de pasta fresca"],
    },
  },
  {
    id: "paris",
    name: "París",
    nameEn: "Paris",
    lat: 48.8566,
    lon: 2.3522,
    country: "FR",
    iata: "PAR",
    curated: true,
    transport: { budget: 90, value: 170, top: 320 },
    lodgingPerRoomNight: { budget: 90, value: 160, top: 320 },
    foodPerDay: { budget: 35, value: 60, top: 110 },
    activitiesPerDay: { budget: 15, value: 35, top: 70 },
    highlights: {
      budget: ["Montmartre y el Sacré-Cœur", "Paseo por el Sena", "Jardines de Luxemburgo"],
      value: ["Museo del Louvre con reserva", "Subida a la Torre Eiffel", "Museo de Orsay"],
      top: ["Crucero con cena por el Sena", "Versalles con guía", "Cena en bistró con estrella"],
    },
  },
  {
    id: "lisboa",
    name: "Lisboa",
    nameEn: "Lisbon",
    lat: 38.7223,
    lon: -9.1393,
    country: "PT",
    iata: "LIS",
    curated: true,
    transport: { budget: 60, value: 120, top: 250 },
    lodgingPerRoomNight: { budget: 60, value: 110, top: 220 },
    foodPerDay: { budget: 25, value: 40, top: 75 },
    activitiesPerDay: { budget: 10, value: 25, top: 50 },
    highlights: {
      budget: ["Alfama y miradores", "Tranvía 28", "LX Factory"],
      value: ["Torre de Belém y Jerónimos", "Excursión a Sintra en tren", "Fado en Alfama"],
      top: ["Sintra con guía privado", "Atardecer en velero por el Tajo", "Cena en Chiado"],
    },
  },
  {
    id: "londres",
    name: "Londres",
    nameEn: "London",
    lat: 51.5074,
    lon: -0.1278,
    country: "GB",
    iata: "LON",
    curated: true,
    transport: { budget: 90, value: 180, top: 350 },
    lodgingPerRoomNight: { budget: 100, value: 180, top: 350 },
    foodPerDay: { budget: 40, value: 65, top: 120 },
    activitiesPerDay: { budget: 15, value: 35, top: 75 },
    highlights: {
      budget: ["British Museum (gratis)", "Camden y Regent's Park", "South Bank a pie"],
      value: ["Torre de Londres", "London Eye", "Musical en el West End"],
      top: ["Afternoon tea clásico", "Estudios de cine con visita completa", "Mejores butacas en el West End"],
    },
  },
  {
    id: "amsterdam",
    name: "Ámsterdam",
    nameEn: "Amsterdam",
    lat: 52.3676,
    lon: 4.9041,
    country: "NL",
    iata: "AMS",
    curated: true,
    transport: { budget: 90, value: 170, top: 320 },
    lodgingPerRoomNight: { budget: 100, value: 170, top: 320 },
    foodPerDay: { budget: 35, value: 55, top: 100 },
    activitiesPerDay: { budget: 15, value: 35, top: 65 },
    highlights: {
      budget: ["Canales y barrio de Jordaan", "Vondelpark en bici", "Mercado Albert Cuyp"],
      value: ["Rijksmuseum", "Casa de Ana Frank con reserva", "Paseo en barco por los canales"],
      top: ["Museo Van Gogh con guía", "Crucero privado por los canales", "Excursión a Zaanse Schans"],
    },
  },
  {
    id: "berlin",
    name: "Berlín",
    nameEn: "Berlin",
    lat: 52.52,
    lon: 13.405,
    country: "DE",
    iata: "BER",
    curated: true,
    transport: { budget: 80, value: 160, top: 300 },
    lodgingPerRoomNight: { budget: 70, value: 120, top: 240 },
    foodPerDay: { budget: 30, value: 45, top: 85 },
    activitiesPerDay: { budget: 15, value: 30, top: 60 },
    highlights: {
      budget: ["East Side Gallery", "Puerta de Brandeburgo y Reichstag", "Mauerpark los domingos"],
      value: ["Isla de los Museos", "Topografía del Terror y Checkpoint Charlie", "Cúpula del Reichstag"],
      top: ["Ruta en bici con guía", "Cena en Kreuzberg", "Concierto en la Filarmónica"],
    },
  },
];

export const ORIGIN_BY_ID = Object.fromEntries(ORIGINS.map((o) => [o.id, o]));
export const DESTINATION_BY_ID = Object.fromEntries(DESTINATIONS.map((d) => [d.id, d]));
