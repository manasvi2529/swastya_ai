from sklearn.cluster import DBSCAN
import numpy as np

def detect_clusters(cases):
    if len(cases) < 2:
        return []

    coords = np.array([[c["lat"], c["lon"]] for c in cases])

    model = DBSCAN(eps=0.01, min_samples=2)
    labels = model.fit_predict(coords)

    clusters = {}

    for i, label in enumerate(labels):
        if label == -1:
            continue

        if label not in clusters:
            clusters[label] = []

        clusters[label].append(cases[i])

    return list(clusters.values())


def calculate_risk(clusters):
    if not clusters:
        return "Low"

    max_cluster = max(len(c) for c in clusters)

    if max_cluster > 10:
        return "High"
    elif max_cluster > 5:
        return "Medium"
    else:
        return "Low"