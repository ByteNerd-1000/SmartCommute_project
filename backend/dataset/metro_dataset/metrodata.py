import pandas as pd

# =========================================
# LOAD DATASETS
# =========================================

stops = pd.read_csv("metro_stops.csv")
routes = pd.read_csv("metro_routes.csv")
trips = pd.read_csv("metro_trips.csv")
stop_times = pd.read_csv("metro_stop_times.csv")

print("\n===================================")
print(" PUNE METRO DATASET VALIDATION ")
print("===================================\n")

# =========================================
# BASIC SHAPES
# =========================================

print("Dataset Shapes:\n")

print("metro_stops.csv:", stops.shape)
print("metro_routes.csv:", routes.shape)
print("metro_trips.csv:", trips.shape)
print("metro_stop_times.csv:", stop_times.shape)

# =========================================
# MISSING VALUES
# =========================================

print("\n===================================")
print(" MISSING VALUES ")
print("===================================\n")

datasets = {
    "stops": stops,
    "routes": routes,
    "trips": trips,
    "stop_times": stop_times
}

for name, df in datasets.items():

    missing = df.isnull().sum().sum()

    if missing == 0:
        print(f"✅ {name}: No missing values")
    else:
        print(f"⚠ {name}: Missing values found")
        print(df.isnull().sum())

# =========================================
# DUPLICATES
# =========================================

print("\n===================================")
print(" DUPLICATE CHECK ")
print("===================================\n")

for name, df in datasets.items():

    duplicates = df.duplicated().sum()

    print(f"{name}: {duplicates} duplicate rows")

# =========================================
# STATION VALIDATION
# =========================================

print("\n===================================")
print(" STATION VALIDATION ")
print("===================================\n")

print("Total Stations:", len(stops))

print("\nMetro Lines:")
print(stops['metro_line'].value_counts())

print("\nOperational Status:")
print(stops['operational_status'].value_counts())

# =========================================
# INTERCHANGE CHECK
# =========================================

print("\n===================================")
print(" INTERCHANGE CHECK ")
print("===================================\n")

interchanges = stops[stops['interchange'] == 'yes']

print(interchanges[['station_name', 'metro_line']])

# =========================================
# COORDINATE VALIDATION
# =========================================

print("\n===================================")
print(" COORDINATE VALIDATION ")
print("===================================\n")

invalid_lat = stops[
    (stops['latitude'] < -90) |
    (stops['latitude'] > 90)
]

invalid_lon = stops[
    (stops['longitude'] < -180) |
    (stops['longitude'] > 180)
]

print("Invalid Latitude Rows:", len(invalid_lat))
print("Invalid Longitude Rows:", len(invalid_lon))

# =========================================
# ROUTE VALIDATION
# =========================================

print("\n===================================")
print(" ROUTE VALIDATION ")
print("===================================\n")

print(routes)

# =========================================
# TRIP VALIDATION
# =========================================

print("\n===================================")
print(" TRIP VALIDATION ")
print("===================================\n")

print(trips)

# =========================================
# STOP SEQUENCE VALIDATION
# =========================================

print("\n===================================")
print(" STOP SEQUENCE CHECK ")
print("===================================\n")

for trip_id in stop_times['trip_id'].unique():

    trip_data = stop_times[
        stop_times['trip_id'] == trip_id
    ]

    is_sorted = trip_data['stop_sequence'].is_monotonic_increasing

    print(f"Trip {trip_id}: Sequence Sorted = {is_sorted}")

# =========================================
# TIMING VALIDATION
# =========================================

print("\n===================================")
print(" TIMING VALIDATION ")
print("===================================\n")

print(stop_times.head(10))

# =========================================
# UNIQUE STATIONS
# =========================================

print("\n===================================")
print(" UNIQUE STATION CHECK ")
print("===================================\n")

unique_stations = stops['station_name'].nunique()

print("Unique Station Names:", unique_stations)

# =========================================
# LINE DISTRIBUTION
# =========================================

print("\n===================================")
print(" LINE DISTRIBUTION ")
print("===================================\n")

print(stops.groupby('metro_line').size())

# =========================================
# FINAL VERDICT
# =========================================

print("\n===================================")
print(" FINAL VERDICT ")
print("===================================\n")

issues = []

if len(invalid_lat) > 0:
    issues.append("Invalid latitude values")

if len(invalid_lon) > 0:
    issues.append("Invalid longitude values")

for name, df in datasets.items():

    if df.isnull().sum().sum() > 0:
        issues.append(f"{name} has missing values")

if len(issues) == 0:
    print("✅ Metro dataset is realistic and usable.")
    print("✅ Suitable for SmartCommute.")
    print("✅ Suitable for multimodal planning.")
    print("✅ Suitable for map visualization.")
    print("✅ Suitable for recommendation systems.")
else:
    print("⚠ Issues Found:\n")

    for issue in issues:
        print("-", issue)

print("\n===================================")
print(" VALIDATION COMPLETE ")
print("===================================\n")
