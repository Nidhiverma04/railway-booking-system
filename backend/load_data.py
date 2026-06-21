import mysql.connector
import csv
import os

# ── config ────────────────────────────────────────────────────────────────────
DB = dict(host="localhost", user="root", password="Nidhi@1313", database="railways")
BASE = os.path.dirname(os.path.abspath(__file__))

def path(*parts):
    return os.path.join(BASE, *parts)

# ── connect ───────────────────────────────────────────────────────────────────
print("Connecting to MySQL...")
conn = mysql.connector.connect(**DB)
cur  = conn.cursor()
print("Connected!\n")

# ── helper ────────────────────────────────────────────────────────────────────
def load_csv(filepath, table, columns, batch=500):
    filepath = path(filepath)
    print(f"Loading {filepath}  →  {table}")
    cur.execute(f"DELETE FROM `{table}`")          # clear before reload
    conn.commit()

    placeholders = ", ".join(["%s"] * len(columns))
    col_names    = ", ".join(columns)
    sql = f"INSERT IGNORE INTO `{table}` ({col_names}) VALUES ({placeholders})"

    rows, total = [], 0
    with open(filepath, encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(tuple(row[c] or None for c in columns))
            if len(rows) >= batch:
                cur.executemany(sql, rows)
                conn.commit()
                total += len(rows)
                rows   = []
                print(f"  {total} rows...", end="\r")
    if rows:
        cur.executemany(sql, rows)
        conn.commit()
        total += len(rows)
    print(f"  ✓ {total} rows loaded into {table}")

# ── load each CSV ─────────────────────────────────────────────────────────────
load_csv(
    "sql/dataset/station_data.csv",
    "stations",
    ["station_name", "station_code"]
)

load_csv(
    "sql/dataset/train_data.csv",
    "trains",
    ["train_id", "train_number", "train_name", "train_type"]
)

load_csv(
    "sql/dataset/train_stops_data.csv",
    "train_stops",
    ["train_id", "station_id", "arrival_time", "departure_time", "stop_order"]
)

# ── verify ────────────────────────────────────────────────────────────────────
print("\nVerifying row counts:")
for table in ["stations", "trains", "train_stops"]:
    cur.execute(f"SELECT COUNT(*) FROM `{table}`")
    count = cur.fetchone()[0]
    print(f"  {table:15s} → {count:,} rows")

cur.close()
conn.close()
print("\nDone!")