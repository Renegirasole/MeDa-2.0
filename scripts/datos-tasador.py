"""
Genera los datos del Tasador por zona (lib/data/zonas/*.json) a partir de fuentes públicas.

Fuentes (descargar a una carpeta y pasarla como argumento):
  serpavi.xlsx  Sistema Estatal de Referencia del Precio del Alquiler de Vivienda (MIVAU), BD 2011-2024
                https://www.mivau.gob.es/vivienda/alquila-bien-es-tu-derecho/serpavi
  secc/         Secciones censales (shapefile SECC_CE_20210101_INE_WM, misma página)
  muni.xls      Valor tasado de vivienda libre, municipios > 25.000 hab. (Ministerio de Transportes, tabla 35103500)
  prov.xls      Valor tasado de vivienda libre por provincia (tabla 35101000)
                https://apps.fomento.gob.es/BoletinOnline2/?nivel=2&orden=35000000

Uso: python scripts/datos-tasador.py <carpeta-con-las-fuentes>
Requiere: pip install openpyxl xlrd pyshp
"""
import json, math, os, re, sys, unicodedata
import openpyxl, xlrd, shapefile

SRC = sys.argv[1]
OUT = os.path.join(os.path.dirname(__file__), "..", "lib", "data", "zonas")
YEAR = "24"  # último año de SERPAVI

def norm(s: str) -> str:
    s = unicodedata.normalize("NFD", str(s)).encode("ascii", "ignore").decode().lower().strip()
    m = re.match(r"^(.*?)\s*(?:\(|,\s*)(el|la|los|las|l'|o|a|os|as|es|sa|s'|els|les)\)?$", s)
    if m:
        s = f"{m.group(2)} {m.group(1)}".replace("' ", "'")
    s = s.split("/")[0]  # nombres bilingües: nos quedamos con el primero
    return re.sub(r"[^a-z0-9]+", "", s)

def r1(v):
    try:
        return round(float(v), 2)
    except (TypeError, ValueError):
        return None

# ——— Alquiler (SERPAVI) ———
wb = openpyxl.load_workbook(os.path.join(SRC, "serpavi.xlsx"), read_only=True)

def sheet(name, key_cols):
    ws = wb[name]
    rows = ws.iter_rows(values_only=True)
    head = list(next(rows))
    ix = {h: i for i, h in enumerate(head)}
    cols = [f"ALQM2_LV_25_VC_{YEAR}", f"ALQM2_LV_M_VC_{YEAR}", f"ALQM2_LV_75_VC_{YEAR}", f"BI_ALVHEPCO_TVC_{YEAR}", f"SLVM2_M_VC_{YEAR}"]
    out = {}
    for row in rows:
        vals = [row[ix[c]] for c in cols]
        rec = {k: (str(row[ix[k]]).zfill({"CPRO": 2, "CUMUN": 5, "CUSEC": 10}[k]) if k in ("CPRO", "CUMUN", "CUSEC") else row[ix[k]]) for k in key_cols}
        if r1(vals[1]) is None or r1(vals[3]) is None:
            out[rec[key_cols[0]]] = {"rec": rec, "rent": None}
            continue
        out[rec[key_cols[0]]] = {"rec": rec, "rent": [r1(vals[0]), r1(vals[1]), r1(vals[2]), int(vals[3]), r1(vals[4])]}
    return out

munis = sheet("Municipios", ["CUMUN", "NMUN", "CPRO", "NPRO"])
provs = sheet("Provincias", ["CPRO", "LITPRO"])
secs = sheet("Secciones censales", ["CUSEC", "CUMUN"])
print("municipios", len(munis), "secciones", len(secs))

# ——— Centroides de sección (Web Mercator -> WGS84) ———
def to_ll(x, y):
    lng = x / 6378137.0 * 180 / math.pi
    lat = (2 * math.atan(math.exp(y / 6378137.0)) - math.pi / 2) * 180 / math.pi
    return lat, lng

def centroid(shape):
    pts = shape.points
    parts = list(shape.parts) + [len(pts)]
    A = cx = cy = 0.0
    for p in range(len(parts) - 1):
        ring = pts[parts[p]:parts[p + 1]]
        for (x0, y0), (x1, y1) in zip(ring, ring[1:]):
            c = x0 * y1 - x1 * y0
            A += c; cx += (x0 + x1) * c; cy += (y0 + y1) * c
    if abs(A) < 1e-9:
        xs, ys = zip(*pts); return sum(xs) / len(xs), sum(ys) / len(ys)
    return cx / (3 * A), cy / (3 * A)

sf = shapefile.Reader(os.path.join(SRC, "secc", "SECC_CE_20210101_INE_WM"), encoding="latin-1")
by_muni = {}
for sr in sf.iterShapeRecords():
    cusec, cumun = sr.record["CUSEC"], sr.record["CUMUN"]
    s = secs.get(cusec)
    if not s or not s["rent"] or s["rent"][3] < 10:  # pocas viviendas: no es fiable
        continue
    lat, lng = to_ll(*centroid(sr.shape))
    p25, med, p75, n, _ = s["rent"]
    by_muni.setdefault(cumun, []).append([cusec[5:], round(lat, 5), round(lng, 5), p25, med, p75, n])
print("municipios con secciones", len(by_muni), "secciones", sum(len(v) for v in by_muni.values()))

# ——— Valor tasado (Ministerio de Transportes) ———
def last_sheet(path):
    b = xlrd.open_workbook(path, encoding_override="cp1252")
    s = b.sheet_by_index(b.nsheets - 1)
    title = " ".join(str(s.cell_value(r, 1)) for r in range(8, 14))
    period = re.search(r"(Primer|Segundo|Tercer|Cuarto) trimestre\s*(?:de\s*)?(\d{4})", title, re.I)
    return s, (f"{period.group(1).lower()} trimestre de {period.group(2)}" if period else s.name.strip())

num = lambda v: float(v) if isinstance(v, (int, float)) and v > 0 else None

s, sale_period = last_sheet(os.path.join(SRC, "muni.xls"))
prov_by_name = {norm(v["rec"]["LITPRO"]): k for k, v in provs.items()}
# Uniprovinciales: el Ministerio las nombra por la comunidad autónoma.
prov_by_name.update({norm(k2): v for k2, v in {"Madrid (Comunidad de)": "28", "Murcia (Región de)": "30", "Navarra (Comunidad Foral de)": "31", "Asturias (Principado de )": "33", "Maó": "07032", "Alicante/Alacant": "03", "Castellón/Castelló": "12", "Valencia/València": "46", "Balears (Illes)": "07", "Palmas (Las)": "35", "Coruña (A)": "15", "Rioja (La)": "26", "Araba/Álava": "01", "Gipuzkoa": "20", "Bizkaia": "48"}.items()})
muni_index = {}
for k, v in munis.items():
    muni_index.setdefault((v["rec"]["CPRO"], norm(v["rec"]["NMUN"])), k)
    for alt in str(v["rec"]["NMUN"]).split("/"):
        muni_index.setdefault((v["rec"]["CPRO"], norm(alt)), k)


by_name = {}
for (p_, n_), k_ in muni_index.items():
    by_name.setdefault(n_, set()).add(k_)

ALIAS = {("07", "mahon"): "07032", ("11", "puertodesantamaria"): "11027", ("08", "santacolomagramanet"): "08245", ("12", "villarreal"): "12135"}

def find_muni(prov, mname):
    """La tabla del Ministerio deja la provincia en blanco y a veces cambia de provincia sin avisar."""
    n = norm(mname)
    code = ALIAS.get((prov, n)) or muni_index.get((prov, n))
    if code:
        return code
    same = by_name.get(n, set())
    if len(same) == 1:
        return next(iter(same))
    starts = {k for (p_, n_), k in muni_index.items() if p_ == prov and (n_.startswith(n) or n.startswith(n_))}
    return next(iter(starts)) if len(starts) == 1 else None

sale_muni, unmatched, prov = {}, [], None
for r in range(16, s.nrows):
    pname, mname = str(s.cell_value(r, 1)).strip(), str(s.cell_value(r, 2)).strip()
    if pname:
        prov = prov_by_name.get(norm(pname))
    if not mname or prov is None:
        continue
    new, old, total = num(s.cell_value(r, 3)), num(s.cell_value(r, 4)), num(s.cell_value(r, 5))
    code = find_muni(prov, mname)
    if not code:
        unmatched.append(f"{pname}/{mname}")
        continue
    if total:
        sale_muni[code] = [round(total), round(new) if new else None, round(old) if old else None]
print("tasación municipios", len(sale_muni), "sin cruzar", unmatched)

HISTORY = 12

def sheet_values(sheet):
    """Municipio (código INE) → valor tasado total de esa hoja trimestral."""
    out, prov = {}, None
    for r in range(16, sheet.nrows):
        pname, mname = str(sheet.cell_value(r, 1)).strip(), str(sheet.cell_value(r, 2)).strip()
        if pname:
            prov = prov_by_name.get(norm(pname))
        if not mname or prov is None:
            continue
        code = find_muni(prov, mname)
        total = num(sheet.cell_value(r, 5))
        if code and total:
            out[code] = round(total)
    return out

book = xlrd.open_workbook(os.path.join(SRC, "muni.xls"), encoding_override="cp1252")
quarters = book.sheet_names()[-HISTORY:]
quarter_labels = [q.strip() for q in quarters]
series = {}
for name in quarters:
    for code, value in sheet_values(book.sheet_by_name(name)).items():
        series.setdefault(code, {})[name.strip()] = value
print("serie histórica", len(series), "municipios,", len(quarters), "trimestres")

s, _ = last_sheet(os.path.join(SRC, "prov.xls"))
sale_prov, sale_national = {}, None
for r in range(s.nrows):
    name = str(s.cell_value(r, 1)).strip()
    if norm(name) == "totalnacional":
        vals = [v for v in (num(s.cell_value(r, c)) for c in range(2, s.ncols - 2)) if v]
        sale_national = round(vals[-1]) if vals else None
    code = prov_by_name.get(norm(name))
    if code:
        # Columnas: trimestres consecutivos y, al final, dos de variación en %. El último trimestre con dato es el más reciente.
        vals = [v for v in (num(s.cell_value(r, c)) for c in range(2, s.ncols - 2)) if v]
        if vals:
            sale_prov[code] = round(vals[-1])
print("tasación provincias", len(sale_prov), "sin cruzar", [p_["rec"]["LITPRO"] for c_, p_ in provs.items() if c_ not in sale_prov])

# ——— Salida ———
os.makedirs(OUT, exist_ok=True)
municipios = {}
for k, v in munis.items():
    rent = v["rent"]
    if rent is None and k not in sale_muni:
        continue
    municipios[k] = {
        "n": v["rec"]["NMUN"],
        "p": v["rec"]["CPRO"],
        "r": rent[:4] + [rent[4]] if rent else None,
        "s": sale_muni.get(k),
        "h": [series.get(k, {}).get(q) for q in quarter_labels] if k in series else None,
    }
provincias = {k: {"n": v["rec"]["LITPRO"], "r": v["rent"], "s": sale_prov.get(k)} for k, v in provs.items()}
meta = {
    "rentYear": 2000 + int(YEAR),
    "salePeriod": sale_period,
    "nationalSale": sale_national,
    "quarters": quarter_labels,
}
with open(os.path.join(OUT, "municipios.json"), "w", encoding="utf-8") as f:
    json.dump({"meta": meta, "municipios": municipios, "provincias": provincias}, f, ensure_ascii=False, separators=(",", ":"))
with open(os.path.join(OUT, "secciones.json"), "w", encoding="utf-8") as f:
    json.dump(by_muni, f, separators=(",", ":"))
print("ok", meta)
