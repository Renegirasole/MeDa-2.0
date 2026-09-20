/**
 * Ciudades con traslado privado de Welcome Pickups (slug de su web:
 * https://www.welcomepickups.com/{slug}/). Lista tomada de su web en
 * septiembre de 2026; si la ciudad no está, el plan enlaza a una búsqueda de
 * traslados en GetYourGuide.
 */
export const TRANSFER_CITIES: ReadonlySet<string> = new Set([
  "athens", "paris", "madrid", "santorini", "skiathos", "crete", "thessaloniki", "rome", "milan", "barcelona", "amsterdam",
  "hong-kong", "berlin", "cyprus", "london", "vienna", "prague", "munich", "budapest", "mallorca", "ibiza", "lisbon", "tel-aviv",
  "beirut", "rhodes", "seville", "corfu", "granada", "valencia", "mykonos", "kos", "malaga", "alicante", "porto", "dubrovnik",
  "istanbul", "zakynthos", "singapore", "zurich", "buenos-aires", "kuala-lumpur", "phuket", "sydney", "krakow", "paros", "naxos",
  "new-york", "frankfurt", "bucharest", "faro", "warsaw", "nice", "salzburg", "florence", "abu-dhabi", "dubai", "dublin",
  "venice", "mexico-city", "marseille", "cape-town", "samos", "kalamata", "kavala", "brussels", "edinburgh", "casablanca",
  "amman", "antalya", "bali", "bangkok", "beijing", "belgrade", "bilbao", "bogota", "bologna", "bordeaux", "bratislava", "cancun",
  "cappadocia", "copenhagen", "doha", "geneva", "hanoi", "honolulu", "johannesburg", "las-vegas", "lima", "los-angeles", "lyon",
  "malta", "marrakech", "melbourne", "miami", "nairobi", "naples", "delhi", "orlando", "rio-de-janeiro", "santiago", "seoul",
  "sofia", "split", "stockholm", "tokyo", "toulouse", "bodrum", "catania", "palermo", "boston", "san-jose-ca", "sao-paulo",
  "medellin", "toronto", "denver", "washington", "chicago", "montreal", "vancouver", "cairo", "helsinki", "manchester",
  "auckland", "puerto-vallarta", "cabo-san-lucas", "ho-chi-minh", "stuttgart", "izmir", "tunis", "santo-domingo", "dallas",
  "oslo", "san-diego", "gran-canaria", "tenerife", "austin", "dalaman", "bristol", "lanzarote", "glasgow", "seattle",
  "punta-cana", "tampa", "birmingham", "belfast", "montego-bay", "adelaide", "antigua", "san-juan", "ljubljana", "mauritius",
  "atlanta", "nassau", "aruba", "reykjavik", "detroit", "phoenix", "philadelphia", "gold-coast", "houston", "new-orleans",
  "perth", "liverpool", "calgary", "nashville", "savannah", "portland", "brisbane", "minneapolis", "cardiff", "ottawa",
  "san-antonio", "bangalore", "cochin", "hamburg", "riga", "zadar", "madeira", "hurghada", "tirana", "mumbai", "dusseldorf",
  "sharm-el-sheikh", "shanghai", "manila", "taipei", "jakarta", "chiang-mai", "guangzhou", "siem-reap", "fortaleza",
  "porto-alegre", "basel", "zanzibar", "murcia", "vilnius", "zagreb", "osaka", "mazatlan", "tallinn", "skopje", "leeds",
  "podgorica", "cagliari", "sarajevo", "luxembourg", "monterrey", "curacao", "bari", "bastia", "cologne", "gothenburg",
  "rotterdam", "tromso", "quebec", "bahrain", "quito", "montpellier", "tijuana", "turin", "guadalajara", "baltimore", "kathmandu",
  "ankara", "phnom-penh", "riyadh", "hyderabad", "hannover", "dar-es-salaam", "buffalo", "kuwait", "bergen", "dammam",
  "christchurch", "lagos", "algiers", "sapporo", "wellington", "recife", "kota-kinabalu", "kefalonia", "colombo", "muscat",
  "surabaya", "medan", "penang", "panama", "saint-thomas", "cebu", "jeddah", "san-salvador", "belize", "queenstown", "cusco",
  "eindhoven", "chisinau", "la-paz", "mahe", "baku", "almaty", "tbilisi", "saint-lucia", "stavanger", "chennai", "cairns",
  "yerevan", "tashkent", "sharjah", "astana", "olbia", "katowice", "oaxaca", "billund", "nadi", "tangier", "cartagena", "tahiti",
  "kingston", "managua", "krabi", "arusha", "da-nang", "langkawi", "biarritz", "koh-samui", "ponta-delgada", "verona",
  "southampton", "pisa", "port-of-spain", "san-jose", "tivat", "genoa", "nantes", "montevideo", "cali", "durban", "santa-marta",
  "strasbourg", "guatemala", "almeria", "luxor", "burgas", "providenciales", "merida", "gdansk", "goa", "trabzon", "alexandria",
  "addis-ababa", "santiago-de-compostela", "newcastle-upon-tyne", "san-francisco", "asuncion", "lahore", "marsa-alam", "djerba",
  "jaipur", "guadeloupe", "barbados", "salalah", "wroclaw", "pula", "rabat", "hamilton", "varna", "san-andres", "fes", "poznan",
  "lille", "rovaniemi", "martinique", "san-sebastian", "zaragoza", "mendoza", "brno", "vigo", "graz", "oviedo", "rennes",
  "innsbruck", "agadir", "busan", "nha-trang", "puerto-princesa", "kutaisi", "dhaka", "jerez", "madinah", "girona", "lesvos",
  "barranquilla", "davao", "puerto-escondido", "santa-cruz-de-la-sierra", "figari", "aktion", "pereira", "lombok", "salvador",
  "rimini", "saintmartin", "phu-quoc", "florianopolis", "huatulco", "johor-bahru", "boracay", "yogyakarta", "tawau", "vientiane",
  "monastir", "tarragona", "hammamet", "brindisi",
]);

/** Slug de Welcome Pickups para las ciudades del catálogo (sus ids van en español). */
const CATALOG_SLUG: Record<string, string> = {
  madrid: "madrid",
  barcelona: "barcelona",
  sevilla: "seville",
  valencia: "valencia",
  malaga: "malaga",
  bilbao: "bilbao",
  roma: "rome",
  paris: "paris",
  lisboa: "lisbon",
  londres: "london",
  amsterdam: "amsterdam",
  berlin: "berlin",
};

const slugify = (name: string): string =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Slug de traslados de una ciudad: por id del catálogo o por su nombre en inglés. */
export function transferSlug(city: { catalogId?: string | null; nameEn?: string | null }): string | null {
  if (city.catalogId) {
    const slug = CATALOG_SLUG[city.catalogId];
    return slug && TRANSFER_CITIES.has(slug) ? slug : null;
  }
  if (!city.nameEn) return null;
  const slug = slugify(city.nameEn);
  return TRANSFER_CITIES.has(slug) ? slug : null;
}
