import type { Island } from "./aeropuertos";

/**
 * Catálogo del planificador de viajes: ciudades de salida en España y destinos
 * con guía propia («qué ver» y enlace de Civitatis). Viene del planificador
 * original de MeDa (meda-six.vercel.app).
 *
 * `priceIndex` compara el coste turístico medio (alojamiento, comida,
 * transporte local) con Madrid = 1. Es orientativo: el precio real se ve al
 * reservar. Los destinos que René calibró a mano en lib/data/travel.ts
 * mandan sobre estos índices (ver lib/viajes/plan.ts).
 */

export interface City {
  id: string;
  name: string;
  province: string;
  lat: number;
  lon: number;
  island?: Island;
}

export type AttractionKind = "monumento" | "museo" | "barrio" | "naturaleza" | "experiencia" | "mirador";

export interface Attraction {
  name: string;
  description: string;
  kind: AttractionKind;
}

export interface Guide {
  id: string;
  name: string;
  /** ISO 3166-1 alfa-2 */
  country: string;
  /** Nombre del país en español, para enseñarlo */
  countryName: string;
  lat: number;
  lon: number;
  /** Aeropuerto principal: el de los enlaces de vuelos */
  iata: string;
  /** Código de ciudad si tiene varios aeropuertos (ROM = Fiumicino + Ciampino): con él, el precio real cubre todos */
  cityCode?: string;
  priceIndex: number;
  island?: Island;
  civitatisSlug: string;
  attractions: Attraction[];
}

export const CITIES: City[] = [
  { id: "madrid", name: "Madrid", province: "Madrid", lat: 40.4168, lon: -3.7038 },
  { id: "barcelona", name: "Barcelona", province: "Barcelona", lat: 41.3874, lon: 2.1686 },
  { id: "valencia", name: "Valencia", province: "Valencia", lat: 39.4699, lon: -0.3763 },
  { id: "sevilla", name: "Sevilla", province: "Sevilla", lat: 37.3891, lon: -5.9845 },
  { id: "zaragoza", name: "Zaragoza", province: "Zaragoza", lat: 41.6488, lon: -0.8891 },
  { id: "malaga", name: "Málaga", province: "Málaga", lat: 36.7213, lon: -4.4214 },
  { id: "murcia", name: "Murcia", province: "Murcia", lat: 37.9922, lon: -1.1307 },
  { id: "palma", name: "Palma de Mallorca", province: "Illes Balears", lat: 39.5696, lon: 2.6502, island: "mallorca" },
  { id: "las-palmas", name: "Las Palmas de Gran Canaria", province: "Las Palmas", lat: 28.1235, lon: -15.4363, island: "gran-canaria" },
  { id: "bilbao", name: "Bilbao", province: "Bizkaia", lat: 43.263, lon: -2.935 },
  { id: "alicante", name: "Alicante", province: "Alicante", lat: 38.3452, lon: -0.481 },
  { id: "cordoba", name: "Córdoba", province: "Córdoba", lat: 37.8882, lon: -4.7794 },
  { id: "valladolid", name: "Valladolid", province: "Valladolid", lat: 41.6523, lon: -4.7245 },
  { id: "vigo", name: "Vigo", province: "Pontevedra", lat: 42.2406, lon: -8.7207 },
  { id: "gijon", name: "Gijón", province: "Asturias", lat: 43.5322, lon: -5.6611 },
  { id: "a-coruna", name: "A Coruña", province: "A Coruña", lat: 43.3623, lon: -8.4115 },
  { id: "granada", name: "Granada", province: "Granada", lat: 37.1773, lon: -3.5986 },
  { id: "vitoria", name: "Vitoria-Gasteiz", province: "Álava", lat: 42.8467, lon: -2.6716 },
  { id: "elche", name: "Elche", province: "Alicante", lat: 38.2699, lon: -0.7126 },
  { id: "oviedo", name: "Oviedo", province: "Asturias", lat: 43.3614, lon: -5.8494 },
  { id: "santa-cruz-tenerife", name: "Santa Cruz de Tenerife", province: "Santa Cruz de Tenerife", lat: 28.4636, lon: -16.2518, island: "tenerife" },
  { id: "pamplona", name: "Pamplona", province: "Navarra", lat: 42.8125, lon: -1.6458 },
  { id: "almeria", name: "Almería", province: "Almería", lat: 36.834, lon: -2.4637 },
  { id: "san-sebastian", name: "San Sebastián", province: "Gipuzkoa", lat: 43.3183, lon: -1.9812 },
  { id: "santander", name: "Santander", province: "Cantabria", lat: 43.4623, lon: -3.81 },
  { id: "burgos", name: "Burgos", province: "Burgos", lat: 42.3439, lon: -3.6969 },
  { id: "castellon", name: "Castellón de la Plana", province: "Castellón", lat: 39.9864, lon: -0.0513 },
  { id: "albacete", name: "Albacete", province: "Albacete", lat: 38.9943, lon: -1.8585 },
  { id: "salamanca", name: "Salamanca", province: "Salamanca", lat: 40.9701, lon: -5.6635 },
  { id: "logrono", name: "Logroño", province: "La Rioja", lat: 42.4627, lon: -2.445 },
  { id: "badajoz", name: "Badajoz", province: "Badajoz", lat: 38.8794, lon: -6.9707 },
  { id: "huelva", name: "Huelva", province: "Huelva", lat: 37.2614, lon: -6.9447 },
  { id: "tarragona", name: "Tarragona", province: "Tarragona", lat: 41.1189, lon: 1.2445 },
  { id: "leon", name: "León", province: "León", lat: 42.5987, lon: -5.5671 },
  { id: "cadiz", name: "Cádiz", province: "Cádiz", lat: 36.5271, lon: -6.2886 },
  { id: "jerez", name: "Jerez de la Frontera", province: "Cádiz", lat: 36.685, lon: -6.1261 },
  { id: "algeciras", name: "Algeciras", province: "Cádiz", lat: 36.1408, lon: -5.4562 },
  { id: "marbella", name: "Marbella", province: "Málaga", lat: 36.5101, lon: -4.8825 },
  { id: "jaen", name: "Jaén", province: "Jaén", lat: 37.7796, lon: -3.7849 },
  { id: "girona", name: "Girona", province: "Girona", lat: 41.9794, lon: 2.8214 },
  { id: "lleida", name: "Lleida", province: "Lleida", lat: 41.6176, lon: 0.62 },
  { id: "caceres", name: "Cáceres", province: "Cáceres", lat: 39.4753, lon: -6.3724 },
  { id: "toledo", name: "Toledo", province: "Toledo", lat: 39.8628, lon: -4.0273 },
  { id: "ciudad-real", name: "Ciudad Real", province: "Ciudad Real", lat: 38.9848, lon: -3.9274 },
  { id: "santiago", name: "Santiago de Compostela", province: "A Coruña", lat: 42.8782, lon: -8.5448 },
  { id: "ibiza", name: "Ibiza", province: "Illes Balears", lat: 38.9067, lon: 1.4206, island: "ibiza" },
];

export const GUIDES: Guide[] = [
  {
    id: "madrid", name: "Madrid", country: "ES", countryName: "España", lat: 40.4168, lon: -3.7038, iata: "MAD", priceIndex: 1, civitatisSlug: "madrid",
    attractions: [
      { name: "Museo del Prado", description: "Velázquez, Goya y El Bosco en una de las mejores pinacotecas del mundo.", kind: "museo" },
      { name: "Palacio Real", description: "La residencia oficial de la Corona, con más de 3.000 salas.", kind: "monumento" },
      { name: "Parque del Retiro", description: "Barcas en el estanque y el Palacio de Cristal.", kind: "naturaleza" },
      { name: "Barrio de las Letras", description: "Tapas, librerías y el Madrid de Cervantes y Lope de Vega.", kind: "barrio" },
      { name: "Templo de Debod", description: "Templo egipcio con uno de los mejores atardeceres de la ciudad.", kind: "mirador" },
    ],
  },
  {
    id: "barcelona", name: "Barcelona", country: "ES", countryName: "España", lat: 41.3874, lon: 2.1686, iata: "BCN", priceIndex: 1.15, civitatisSlug: "barcelona",
    attractions: [
      { name: "Sagrada Familia", description: "La obra maestra inacabada de Gaudí. Reserva entrada con antelación.", kind: "monumento" },
      { name: "Park Güell", description: "Mosaicos de Gaudí y vistas a toda la ciudad.", kind: "mirador" },
      { name: "Barrio Gótico", description: "Callejuelas medievales alrededor de la catedral.", kind: "barrio" },
      { name: "Casa Batlló", description: "La casa de Gaudí en el Paseo de Gràcia.", kind: "monumento" },
      { name: "Montjuïc", description: "Castillo, jardines y la Font Màgica.", kind: "naturaleza" },
    ],
  },
  {
    id: "sevilla", name: "Sevilla", country: "ES", countryName: "España", lat: 37.3891, lon: -5.9845, iata: "SVQ", priceIndex: 0.9, civitatisSlug: "sevilla",
    attractions: [
      { name: "Real Alcázar", description: "Palacio mudéjar y jardines, escenario de Juego de Tronos.", kind: "monumento" },
      { name: "Catedral y Giralda", description: "La mayor catedral gótica del mundo y su campanario.", kind: "monumento" },
      { name: "Plaza de España", description: "El gran conjunto de la Exposición de 1929.", kind: "monumento" },
      { name: "Barrio de Triana", description: "Cerámica, flamenco y tapeo al otro lado del río.", kind: "barrio" },
      { name: "Setas de Sevilla", description: "Pasarela sobre la ciudad en la Encarnación.", kind: "mirador" },
    ],
  },
  {
    id: "valencia", name: "Valencia", country: "ES", countryName: "España", lat: 39.4699, lon: -0.3763, iata: "VLC", priceIndex: 0.9, civitatisSlug: "valencia",
    attractions: [
      { name: "Ciudad de las Artes y las Ciencias", description: "Oceanogràfic, museo y la arquitectura de Calatrava.", kind: "museo" },
      { name: "Mercado Central", description: "Uno de los mercados más grandes y bonitos de Europa.", kind: "experiencia" },
      { name: "Albufera", description: "Paseo en barca al atardecer y paella en su origen.", kind: "naturaleza" },
      { name: "Barrio del Carmen", description: "Casco antiguo con torres medievales y ambiente nocturno.", kind: "barrio" },
      { name: "Jardín del Turia", description: "Nueve kilómetros de parque en el antiguo cauce del río.", kind: "naturaleza" },
    ],
  },
  {
    id: "granada", name: "Granada", country: "ES", countryName: "España", lat: 37.1773, lon: -3.5986, iata: "GRX", priceIndex: 0.8, civitatisSlug: "granada",
    attractions: [
      { name: "La Alhambra", description: "Palacios nazaríes y Generalife. Las entradas se agotan: resérvalas pronto.", kind: "monumento" },
      { name: "Mirador de San Nicolás", description: "La postal de la Alhambra con Sierra Nevada detrás.", kind: "mirador" },
      { name: "Albaicín", description: "Barrio morisco de calles blancas y teterías.", kind: "barrio" },
      { name: "Sacromonte", description: "Cuevas y flamenco en la ladera.", kind: "experiencia" },
      { name: "Catedral y Capilla Real", description: "Donde descansan los Reyes Católicos.", kind: "monumento" },
    ],
  },
  {
    id: "malaga", name: "Málaga", country: "ES", countryName: "España", lat: 36.7213, lon: -4.4214, iata: "AGP", priceIndex: 0.95, civitatisSlug: "malaga",
    attractions: [
      { name: "Alcazaba y Gibralfaro", description: "Fortaleza árabe con vistas al puerto.", kind: "monumento" },
      { name: "Museo Picasso", description: "Obra del pintor en su ciudad natal.", kind: "museo" },
      { name: "Caminito del Rey", description: "Pasarelas colgadas sobre el desfiladero, a una hora de la ciudad.", kind: "naturaleza" },
      { name: "Playa de la Malagueta", description: "Playa urbana con chiringuitos y espetos.", kind: "experiencia" },
      { name: "Soho y calle Larios", description: "Arte urbano, compras y ambiente.", kind: "barrio" },
    ],
  },
  {
    id: "bilbao", name: "Bilbao", country: "ES", countryName: "España", lat: 43.263, lon: -2.935, iata: "BIO", priceIndex: 1, civitatisSlug: "bilbao",
    attractions: [
      { name: "Museo Guggenheim", description: "El edificio de Gehry que transformó la ciudad.", kind: "museo" },
      { name: "Casco Viejo", description: "Las Siete Calles y los mejores pintxos.", kind: "barrio" },
      { name: "Puente Colgante de Bizkaia", description: "Patrimonio de la Humanidad, en Portugalete.", kind: "monumento" },
      { name: "Monte Artxanda", description: "Funicular y vistas de toda la ría.", kind: "mirador" },
      { name: "San Juan de Gaztelugatxe", description: "La ermita sobre el mar, a 35 km.", kind: "naturaleza" },
    ],
  },
  {
    id: "san-sebastian", name: "San Sebastián", country: "ES", countryName: "España", lat: 43.3183, lon: -1.9812, iata: "EAS", priceIndex: 1.25, civitatisSlug: "san-sebastian",
    attractions: [
      { name: "Playa de la Concha", description: "Una de las playas urbanas más bonitas de Europa.", kind: "naturaleza" },
      { name: "Parte Vieja", description: "Ruta de pintxos por los bares de siempre.", kind: "experiencia" },
      { name: "Monte Igueldo", description: "Funicular centenario y vistas a la bahía.", kind: "mirador" },
      { name: "Peine del Viento", description: "Las esculturas de Chillida frente al mar.", kind: "monumento" },
      { name: "Monte Urgull", description: "Paseo entre fortificaciones sobre el puerto.", kind: "naturaleza" },
    ],
  },
  {
    id: "mallorca", name: "Palma de Mallorca", country: "ES", countryName: "España", lat: 39.5696, lon: 2.6502, iata: "PMI", priceIndex: 1.15, island: "mallorca", civitatisSlug: "mallorca",
    attractions: [
      { name: "Catedral de Palma (La Seu)", description: "Gótica, frente al mar, con intervenciones de Gaudí.", kind: "monumento" },
      { name: "Serra de Tramuntana", description: "Valldemossa, Deià y Sóller entre montañas.", kind: "naturaleza" },
      { name: "Castillo de Bellver", description: "Castillo circular con vistas a la bahía.", kind: "mirador" },
      { name: "Calas del sur", description: "Caló des Moro y Es Trenc, mejor a primera hora.", kind: "naturaleza" },
      { name: "Cuevas del Drach", description: "Lago subterráneo con concierto en barca.", kind: "experiencia" },
    ],
  },
  {
    id: "ibiza", name: "Ibiza", country: "ES", countryName: "España", lat: 38.9067, lon: 1.4206, iata: "IBZ", priceIndex: 1.55, island: "ibiza", civitatisSlug: "ibiza",
    attractions: [
      { name: "Dalt Vila", description: "Ciudad amurallada Patrimonio de la Humanidad.", kind: "monumento" },
      { name: "Cala Comte", description: "Agua turquesa y atardecer famoso.", kind: "naturaleza" },
      { name: "Es Vedrà", description: "El islote místico visto desde Cala d'Hort.", kind: "mirador" },
      { name: "Mercadillo hippie de Las Dalias", description: "Artesanía y ambiente de los 70.", kind: "experiencia" },
      { name: "Excursión a Formentera", description: "Ferry a las playas de Ses Illetes.", kind: "experiencia" },
    ],
  },
  {
    id: "tenerife", name: "Tenerife", country: "ES", countryName: "España", lat: 28.2916, lon: -16.6291, iata: "TFS", cityCode: "TCI", priceIndex: 0.95, island: "tenerife", civitatisSlug: "tenerife",
    attractions: [
      { name: "Parque Nacional del Teide", description: "El pico más alto de España y cielos de estrellas.", kind: "naturaleza" },
      { name: "Acantilados de Los Gigantes", description: "Paredes de 500 m sobre el mar, en barco.", kind: "naturaleza" },
      { name: "Avistamiento de cetáceos", description: "Calderones y delfines en el sur de la isla.", kind: "experiencia" },
      { name: "La Laguna", description: "Casco histórico Patrimonio de la Humanidad.", kind: "barrio" },
      { name: "Masca", description: "Pueblo encajado en un barranco del macizo de Teno.", kind: "mirador" },
    ],
  },
  {
    id: "gran-canaria", name: "Gran Canaria", country: "ES", countryName: "España", lat: 28.1235, lon: -15.4363, iata: "LPA", priceIndex: 0.9, island: "gran-canaria", civitatisSlug: "gran-canaria",
    attractions: [
      { name: "Dunas de Maspalomas", description: "Desierto de arena junto al mar.", kind: "naturaleza" },
      { name: "Roque Nublo", description: "Monolito volcánico en el centro de la isla.", kind: "mirador" },
      { name: "Barrio de Vegueta", description: "Casa de Colón y el casco antiguo de Las Palmas.", kind: "barrio" },
      { name: "Playa de Las Canteras", description: "Arrecife natural en plena ciudad.", kind: "naturaleza" },
      { name: "Puerto de Mogán", description: "La \"pequeña Venecia\" canaria.", kind: "experiencia" },
    ],
  },
  {
    id: "cadiz", name: "Cádiz", country: "ES", countryName: "España", lat: 36.5271, lon: -6.2886, iata: "XRY", priceIndex: 0.9, civitatisSlug: "cadiz",
    attractions: [
      { name: "Playa de La Caleta", description: "Entre dos castillos, la playa más gaditana.", kind: "naturaleza" },
      { name: "Catedral y Torre de Poniente", description: "Cúpula dorada y vistas desde la torre más alta.", kind: "mirador" },
      { name: "Barrio de la Viña", description: "Pescaíto frito y alma del Carnaval.", kind: "barrio" },
      { name: "Mercado Central", description: "Pescado del día y puestos para tapear.", kind: "experiencia" },
      { name: "Pueblos blancos", description: "Vejer, Arcos o Grazalema a menos de una hora.", kind: "experiencia" },
    ],
  },
  {
    id: "roma", name: "Roma", country: "IT", countryName: "Italia", lat: 41.9028, lon: 12.4964, iata: "FCO", cityCode: "ROM", priceIndex: 1.15, civitatisSlug: "roma",
    attractions: [
      { name: "Coliseo y Foro Romano", description: "El anfiteatro más famoso del mundo y el corazón de la Roma antigua.", kind: "monumento" },
      { name: "Museos Vaticanos y Capilla Sixtina", description: "Miguel Ángel, Rafael y siglos de colección papal. Colas largas: reserva.", kind: "museo" },
      { name: "Fontana di Trevi", description: "Lanza la moneda para volver a Roma. Mejor a primera hora.", kind: "monumento" },
      { name: "Panteón", description: "El templo romano mejor conservado, con su cúpula abierta.", kind: "monumento" },
      { name: "Trastevere", description: "Callejuelas, trattorias y la Roma más auténtica al anochecer.", kind: "barrio" },
      { name: "Basílica de San Pedro", description: "Sube a la cúpula para ver la plaza desde arriba.", kind: "mirador" },
    ],
  },
  {
    id: "paris", name: "París", country: "FR", countryName: "Francia", lat: 48.8566, lon: 2.3522, iata: "CDG", cityCode: "PAR", priceIndex: 1.4, civitatisSlug: "paris",
    attractions: [
      { name: "Torre Eiffel", description: "Sube de noche para ver la ciudad iluminada.", kind: "mirador" },
      { name: "Museo del Louvre", description: "La Gioconda y miles de obras más. Reserva franja horaria.", kind: "museo" },
      { name: "Montmartre y Sacré-Cœur", description: "El barrio de los pintores y vistas desde la basílica.", kind: "barrio" },
      { name: "Crucero por el Sena", description: "Los monumentos desde el río, mejor al atardecer.", kind: "experiencia" },
      { name: "Palacio de Versalles", description: "El palacio de Luis XIV y sus jardines, a 40 min en tren.", kind: "monumento" },
      { name: "Museo de Orsay", description: "Impresionistas en una antigua estación.", kind: "museo" },
    ],
  },
  {
    id: "londres", name: "Londres", country: "GB", countryName: "Reino Unido", lat: 51.5074, lon: -0.1278, iata: "LHR", cityCode: "LON", priceIndex: 1.5, civitatisSlug: "londres",
    attractions: [
      { name: "Museo Británico", description: "La piedra de Rosetta y el Partenón. Colección permanente sin coste.", kind: "museo" },
      { name: "Torre de Londres", description: "Joyas de la Corona y 900 años de historia.", kind: "monumento" },
      { name: "Westminster y Big Ben", description: "Parlamento, abadía y el reloj más famoso.", kind: "monumento" },
      { name: "Camden Market", description: "Mercado alternativo, comida callejera y música.", kind: "barrio" },
      { name: "Estudios de Harry Potter", description: "Los decorados reales de las películas, a las afueras.", kind: "experiencia" },
    ],
  },
  {
    id: "amsterdam", name: "Ámsterdam", country: "NL", countryName: "Países Bajos", lat: 52.3676, lon: 4.9041, iata: "AMS", priceIndex: 1.45, civitatisSlug: "amsterdam",
    attractions: [
      { name: "Museo Van Gogh", description: "La mayor colección del pintor. Entrada solo online.", kind: "museo" },
      { name: "Casa de Ana Frank", description: "El escondite del diario. Las entradas salen con semanas de antelación.", kind: "museo" },
      { name: "Paseo por los canales", description: "En barco o en bici por el cinturón de canales.", kind: "experiencia" },
      { name: "Rijksmuseum", description: "Rembrandt y Vermeer.", kind: "museo" },
      { name: "Jordaan", description: "El barrio con más encanto: cafés, galerías y mercadillos.", kind: "barrio" },
    ],
  },
  {
    id: "berlin", name: "Berlín", country: "DE", countryName: "Alemania", lat: 52.52, lon: 13.405, iata: "BER", priceIndex: 1.1, civitatisSlug: "berlin",
    attractions: [
      { name: "Puerta de Brandeburgo", description: "Símbolo de la reunificación alemana.", kind: "monumento" },
      { name: "East Side Gallery", description: "El tramo más largo del Muro, cubierto de murales.", kind: "monumento" },
      { name: "Isla de los Museos", description: "Cinco museos, entre ellos el Pergamon y el Neues.", kind: "museo" },
      { name: "Cúpula del Reichstag", description: "Visita con reserva previa gratuita.", kind: "mirador" },
      { name: "Kreuzberg", description: "Multicultural, alternativo y con la mejor vida nocturna.", kind: "barrio" },
    ],
  },
  {
    id: "lisboa", name: "Lisboa", country: "PT", countryName: "Portugal", lat: 38.7223, lon: -9.1393, iata: "LIS", priceIndex: 0.95, civitatisSlug: "lisboa",
    attractions: [
      { name: "Torre de Belém y Jerónimos", description: "Manuelino puro junto al Tajo, y los pasteles de Belém al lado.", kind: "monumento" },
      { name: "Tranvía 28", description: "Recorre Alfama, Graça y Baixa en el tranvía clásico.", kind: "experiencia" },
      { name: "Barrio de Alfama", description: "Fado, miradores y callejuelas.", kind: "barrio" },
      { name: "Sintra", description: "Palacios de cuento a 40 minutos en tren.", kind: "monumento" },
      { name: "Mirador de Santa Luzia", description: "Tejados rojos y el río a tus pies.", kind: "mirador" },
    ],
  },
  {
    id: "oporto", name: "Oporto", country: "PT", countryName: "Portugal", lat: 41.1579, lon: -8.6291, iata: "OPO", priceIndex: 0.85, civitatisSlug: "oporto",
    attractions: [
      { name: "Ribeira", description: "Casas de colores junto al Duero.", kind: "barrio" },
      { name: "Bodegas de Vila Nova de Gaia", description: "Cata de vino de Oporto al otro lado del puente.", kind: "experiencia" },
      { name: "Librería Lello", description: "Una de las librerías más bonitas del mundo.", kind: "monumento" },
      { name: "Puente Don Luis I", description: "Crúzalo por arriba al atardecer.", kind: "mirador" },
      { name: "Estación de São Bento", description: "Vestíbulo cubierto de azulejos.", kind: "monumento" },
    ],
  },
  {
    id: "praga", name: "Praga", country: "CZ", countryName: "República Checa", lat: 50.0755, lon: 14.4378, iata: "PRG", priceIndex: 0.8, civitatisSlug: "praga",
    attractions: [
      { name: "Puente de Carlos", description: "Estatuas barrocas sobre el Moldava. Ve al amanecer.", kind: "monumento" },
      { name: "Castillo de Praga", description: "El mayor complejo de castillo antiguo del mundo.", kind: "monumento" },
      { name: "Plaza de la Ciudad Vieja", description: "El reloj astronómico y la iglesia de Týn.", kind: "monumento" },
      { name: "Barrio Judío (Josefov)", description: "Sinagogas y el antiguo cementerio.", kind: "barrio" },
      { name: "Colina de Petřín", description: "Mirador y jardines sobre la ciudad.", kind: "mirador" },
    ],
  },
  {
    id: "budapest", name: "Budapest", country: "HU", countryName: "Hungría", lat: 47.4979, lon: 19.0402, iata: "BUD", priceIndex: 0.75, civitatisSlug: "budapest",
    attractions: [
      { name: "Parlamento de Budapest", description: "El edificio neogótico a orillas del Danubio.", kind: "monumento" },
      { name: "Balnearios Széchenyi", description: "Aguas termales al aire libre, también en invierno.", kind: "experiencia" },
      { name: "Bastión de los Pescadores", description: "Las mejores vistas del Parlamento.", kind: "mirador" },
      { name: "Ruin bars", description: "Bares en edificios abandonados del barrio judío.", kind: "barrio" },
      { name: "Crucero por el Danubio", description: "La ciudad iluminada desde el río.", kind: "experiencia" },
    ],
  },
  {
    id: "viena", name: "Viena", country: "AT", countryName: "Austria", lat: 48.2082, lon: 16.3738, iata: "VIE", priceIndex: 1.15, civitatisSlug: "viena",
    attractions: [
      { name: "Palacio de Schönbrunn", description: "La residencia de verano de Sissi.", kind: "monumento" },
      { name: "Ópera Estatal", description: "Una función en uno de los grandes teatros de ópera; hay entradas de pie a precio reducido.", kind: "experiencia" },
      { name: "Palacio Belvedere", description: "El Beso de Klimt.", kind: "museo" },
      { name: "Catedral de San Esteban", description: "Sube a la torre sur.", kind: "mirador" },
      { name: "Naschmarkt", description: "Mercado para comer de todo.", kind: "experiencia" },
    ],
  },
  {
    id: "milan", name: "Milán", country: "IT", countryName: "Italia", lat: 45.4642, lon: 9.19, iata: "MXP", cityCode: "MIL", priceIndex: 1.2, civitatisSlug: "milan",
    attractions: [
      { name: "Duomo de Milán", description: "Pasea por las terrazas entre sus agujas.", kind: "mirador" },
      { name: "La Última Cena", description: "El fresco de Da Vinci. Cupos muy limitados.", kind: "museo" },
      { name: "Galería Vittorio Emanuele II", description: "La galería comercial más elegante de Italia.", kind: "monumento" },
      { name: "Navigli", description: "Canales y aperitivo al atardecer.", kind: "barrio" },
      { name: "Lago de Como", description: "Excursión de un día en tren.", kind: "naturaleza" },
    ],
  },
  {
    id: "venecia", name: "Venecia", country: "IT", countryName: "Italia", lat: 45.4408, lon: 12.3155, iata: "VCE", priceIndex: 1.45, civitatisSlug: "venecia",
    attractions: [
      { name: "Plaza y Basílica de San Marcos", description: "Mosaicos dorados y el campanile.", kind: "monumento" },
      { name: "Palacio Ducal", description: "El poder de la República y el Puente de los Suspiros.", kind: "museo" },
      { name: "Paseo en góndola", description: "Compártela para dividir el precio.", kind: "experiencia" },
      { name: "Burano", description: "La isla de las casas de colores, en vaporetto.", kind: "barrio" },
      { name: "Puente de Rialto", description: "El puente más antiguo del Gran Canal.", kind: "monumento" },
    ],
  },
  {
    id: "florencia", name: "Florencia", country: "IT", countryName: "Italia", lat: 43.7696, lon: 11.2558, iata: "FLR", priceIndex: 1.2, civitatisSlug: "florencia",
    attractions: [
      { name: "Galería Uffizi", description: "Botticelli, Da Vinci y el Renacimiento entero.", kind: "museo" },
      { name: "Duomo y cúpula de Brunelleschi", description: "463 escalones hasta la cima.", kind: "mirador" },
      { name: "David de Miguel Ángel", description: "En la Galería de la Academia.", kind: "museo" },
      { name: "Ponte Vecchio", description: "El puente de los orfebres.", kind: "monumento" },
      { name: "Piazzale Michelangelo", description: "Atardecer sobre toda la ciudad.", kind: "mirador" },
    ],
  },
  {
    id: "atenas", name: "Atenas", country: "GR", countryName: "Grecia", lat: 37.9838, lon: 23.7275, iata: "ATH", priceIndex: 0.95, civitatisSlug: "atenas",
    attractions: [
      { name: "Acrópolis y Partenón", description: "Sube temprano: en verano el calor aprieta.", kind: "monumento" },
      { name: "Museo de la Acrópolis", description: "Las esculturas originales, con suelo de cristal.", kind: "museo" },
      { name: "Plaka", description: "Barrio antiguo bajo la Acrópolis.", kind: "barrio" },
      { name: "Cabo Sunión", description: "Templo de Poseidón sobre el mar al atardecer.", kind: "mirador" },
      { name: "Ágora antigua", description: "Donde paseaban Sócrates y Platón.", kind: "monumento" },
    ],
  },
  {
    id: "dublin", name: "Dublín", country: "IE", countryName: "Irlanda", lat: 53.3498, lon: -6.2603, iata: "DUB", priceIndex: 1.45, civitatisSlug: "dublin",
    attractions: [
      { name: "Trinity College", description: "El Libro de Kells y la Long Room.", kind: "museo" },
      { name: "Guinness Storehouse", description: "Pinta incluida con vistas desde el Gravity Bar.", kind: "experiencia" },
      { name: "Temple Bar", description: "Pubs con música en directo.", kind: "barrio" },
      { name: "Acantilados de Moher", description: "Excursión de un día a la costa oeste.", kind: "naturaleza" },
      { name: "Howth", description: "Pueblo pesquero y paseo por los acantilados.", kind: "naturaleza" },
    ],
  },
  {
    id: "bruselas", name: "Bruselas", country: "BE", countryName: "Bélgica", lat: 50.8503, lon: 4.3517, iata: "BRU", priceIndex: 1.15, civitatisSlug: "bruselas",
    attractions: [
      { name: "Grand Place", description: "Una de las plazas más bonitas de Europa.", kind: "monumento" },
      { name: "Atomium", description: "El átomo gigante de la Expo 58.", kind: "mirador" },
      { name: "Ruta del cómic", description: "Murales de Tintín y compañía por la ciudad.", kind: "barrio" },
      { name: "Brujas", description: "Canales medievales a una hora en tren.", kind: "experiencia" },
      { name: "Cata de chocolate y cerveza", description: "Lo que no puede faltar.", kind: "experiencia" },
    ],
  },
  {
    id: "estambul", name: "Estambul", country: "TR", countryName: "Turquía", lat: 41.0082, lon: 28.9784, iata: "IST", priceIndex: 0.75, civitatisSlug: "estambul",
    attractions: [
      { name: "Santa Sofía", description: "Basílica, mezquita y símbolo de la ciudad.", kind: "monumento" },
      { name: "Mezquita Azul", description: "Seis minaretes y azulejos de Iznik.", kind: "monumento" },
      { name: "Gran Bazar", description: "Más de 4.000 tiendas bajo techo. Regatea.", kind: "experiencia" },
      { name: "Crucero por el Bósforo", description: "Entre Europa y Asia.", kind: "experiencia" },
      { name: "Palacio de Topkapi", description: "La residencia de los sultanes otomanos.", kind: "museo" },
    ],
  },
  {
    id: "marrakech", name: "Marrakech", country: "MA", countryName: "Marruecos", lat: 31.6295, lon: -7.9811, iata: "RAK", priceIndex: 0.6, civitatisSlug: "marrakech",
    attractions: [
      { name: "Plaza Jemaa el-Fna", description: "Puestos de comida y espectáculo al caer la noche.", kind: "experiencia" },
      { name: "Jardín Majorelle", description: "El azul de Yves Saint Laurent.", kind: "naturaleza" },
      { name: "Zocos de la Medina", description: "Especias, cuero y lámparas. Regatea con calma.", kind: "barrio" },
      { name: "Palacio de la Bahía", description: "Mosaicos y patios del siglo XIX.", kind: "monumento" },
      { name: "Excursión al desierto de Agafay", description: "Cena bajo las estrellas a una hora.", kind: "naturaleza" },
    ],
  },
  {
    id: "nueva-york", name: "Nueva York", country: "US", countryName: "Estados Unidos", lat: 40.7128, lon: -74.006, iata: "JFK", cityCode: "NYC", priceIndex: 2, civitatisSlug: "nueva-york",
    attractions: [
      { name: "Central Park", description: "En bici o andando, de sur a norte.", kind: "naturaleza" },
      { name: "Estatua de la Libertad", description: "Ferry a Liberty Island (o el ferry gratuito a Staten Island para verla).", kind: "monumento" },
      { name: "Top of the Rock", description: "El Empire State de frente y Central Park detrás.", kind: "mirador" },
      { name: "Puente de Brooklyn", description: "Crúzalo andando hasta DUMBO.", kind: "monumento" },
      { name: "The Met", description: "Uno de los museos más grandes del mundo.", kind: "museo" },
    ],
  },
  {
    id: "cancun", name: "Cancún", country: "MX", countryName: "México", lat: 21.1619, lon: -86.8515, iata: "CUN", priceIndex: 1.1, civitatisSlug: "cancun",
    attractions: [
      { name: "Chichén Itzá", description: "Maravilla del mundo maya a 3 horas.", kind: "monumento" },
      { name: "Isla Mujeres", description: "Playa Norte y snorkel en ferry.", kind: "naturaleza" },
      { name: "Cenotes", description: "Baños en pozos naturales de agua dulce.", kind: "naturaleza" },
      { name: "Tulum", description: "Ruinas mayas sobre el Caribe.", kind: "monumento" },
      { name: "Xcaret", description: "Parque natural con espectáculo nocturno.", kind: "experiencia" },
    ],
  },
  {
    id: "tokio", name: "Tokio", country: "JP", countryName: "Japón", lat: 35.6762, lon: 139.6503, iata: "HND", cityCode: "TYO", priceIndex: 1.2, civitatisSlug: "tokio",
    attractions: [
      { name: "Cruce de Shibuya", description: "El paso de peatones más famoso del mundo.", kind: "barrio" },
      { name: "Templo Senso-ji", description: "El templo más antiguo de Tokio, en Asakusa.", kind: "monumento" },
      { name: "Mercado de Tsukiji", description: "Sushi para desayunar.", kind: "experiencia" },
      { name: "Shibuya Sky", description: "Mirador al aire libre sobre la ciudad.", kind: "mirador" },
      { name: "Monte Fuji", description: "Excursión de un día a los cinco lagos.", kind: "naturaleza" },
    ],
  },
  {
    id: "buenos-aires", name: "Buenos Aires", country: "AR", countryName: "Argentina", lat: -34.6037, lon: -58.3816, iata: "EZE", cityCode: "BUE", priceIndex: 0.7, civitatisSlug: "buenos-aires",
    attractions: [
      { name: "La Boca y Caminito", description: "Casas de chapa de colores y tango en la calle.", kind: "barrio" },
      { name: "Cementerio de la Recoleta", description: "Mausoleos monumentales y la tumba de Evita.", kind: "monumento" },
      { name: "San Telmo", description: "Mercado de antigüedades los domingos.", kind: "barrio" },
      { name: "Espectáculo de tango", description: "Cena show en una milonga.", kind: "experiencia" },
      { name: "Tigre", description: "Delta del Paraná en lancha.", kind: "naturaleza" },
    ],
  },
];

export const CITY_BY_ID: Record<string, City> = Object.fromEntries(CITIES.map((c) => [c.id, c]));
export const GUIDE_BY_ID: Record<string, Guide> = Object.fromEntries(GUIDES.map((g) => [g.id, g]));
