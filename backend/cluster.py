from sklearn.cluster import DBSCAN
import numpy as np


# ==============================
# ✅ Detect clusters (per disease)
# ==============================
def detect_clusters(cases):
    if len(cases) < 2:
        return []

    clusters_result = []

    # 🔥 Group cases by disease
    disease_groups = {}
    for case in cases:
        disease = case["disease"]
        if disease not in disease_groups:
            disease_groups[disease] = []
        disease_groups[disease].append(case)

    # 🔥 Run DBSCAN for each disease separately
    for disease, group in disease_groups.items():

        if len(group) < 2:
            continue

        coords = np.array([[c["lat"], c["lon"]] for c in group])

        model = DBSCAN(eps=0.01, min_samples=2)
        labels = model.fit_predict(coords)

        temp_clusters = {}

        for i, label in enumerate(labels):
            if label == -1:
                continue

            if label not in temp_clusters:
                temp_clusters[label] = []

            temp_clusters[label].append(group[i])

        # Store clusters with disease info
        for cluster in temp_clusters.values():
            clusters_result.append({
                "disease": disease,
                "size": len(cluster),
                "cases": cluster
            })

    return clusters_result


# ==============================
# ✅ Calculate risk (improved)
# ==============================
def calculate_risk(clusters):

    if not clusters:
        return "Low"

    max_cluster = max(c["size"] for c in clusters)

    if max_cluster >= 8:
        return "High"
    elif max_cluster >= 4:
        return "Medium"
    else:
        return "Low"