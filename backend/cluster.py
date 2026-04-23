from sklearn.cluster import DBSCAN
import numpy as np


# ==============================
# ✅ Detect clusters (per disease)
# ==============================
def detect_clusters(cases):
    if not cases or len(cases) < 2:
        return []

    clusters_result = []

    # 🔥 Group cases by disease
    disease_groups = {}
    for case in cases:
        disease = case.get("disease")
        if not disease:
            continue

        disease_groups.setdefault(disease, []).append(case)

    # 🔥 Run DBSCAN for each disease separately
    for disease, group in disease_groups.items():

        if len(group) < 2:
            continue

        try:
            coords = np.array([[c["lat"], c["lon"]] for c in group])
        except KeyError:
            continue  # skip bad data safely

        # 🔥 DBSCAN model (tuned for city-level clustering)
        model = DBSCAN(eps=0.02, min_samples=2)
        labels = model.fit_predict(coords)

        temp_clusters = {}

        for i, label in enumerate(labels):
            if label == -1:
                continue  # ignore noise

            temp_clusters.setdefault(label, []).append(group[i])

        # 🔥 Build final cluster output
        for cluster_cases in temp_clusters.values():

            size = len(cluster_cases)

            # 👉 Calculate cluster center (IMPORTANT for map)
            avg_lat = sum(c["lat"] for c in cluster_cases) / size
            avg_lon = sum(c["lon"] for c in cluster_cases) / size

            clusters_result.append({
                "disease": disease,
                "size": size,
                "lat": round(avg_lat, 5),
                "lon": round(avg_lon, 5),
                "cases": cluster_cases
            })

    return clusters_result


# ==============================
# ✅ Calculate risk (IMPROVED)
# ==============================
def calculate_risk(clusters):

    if not clusters:
        return "Low"

    max_cluster = max(c["size"] for c in clusters)

    # 🔥 More realistic thresholds
    if max_cluster >= 10:
        return "High"
    elif max_cluster >= 5:
        return "Medium"
    else:
        return "Low"