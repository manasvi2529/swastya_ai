# ==============================
# ✅ 7. CLEAR API
# ==============================
@app.delete("/clear")
def clear_data():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM cases")

    conn.commit()
    conn.close()

    return {"message": "All data cleared"}