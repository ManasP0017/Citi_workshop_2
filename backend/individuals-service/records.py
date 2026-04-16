"""
Records logic for individuals.
Handles CRUD for performance reviews, development plans, competencies, and training records.
"""

def create_record(conn, table, data):
    with conn.cursor() as cur:
        keys = list(data.keys())
        values = [data[k] for k in keys]
        cols = ", ".join(keys)
        placeholders = ", ".join(["%s"] * len(keys))
        
        # Build RETURNING statement to get all columns
        cur.execute(
            f"INSERT INTO {table} ({cols}) VALUES ({placeholders}) RETURNING *",
            values
        )
        return dict(zip([desc[0] for desc in cur.description], cur.fetchone()))

def get_records(conn, table, individual_id):
    with conn.cursor() as cur:
        cur.execute(f"SELECT * FROM {table} WHERE individual_id = %s ORDER BY created_at DESC", (individual_id,))
        cols = [desc[0] for desc in cur.description]
        return [dict(zip(cols, row)) for row in cur.fetchall()]

def update_record(conn, table, record_id, data):
    with conn.cursor() as cur:
        keys = list(data.keys())
        values = [data[k] for k in keys]
        set_clause = ", ".join([f"{k} = %s" for k in keys])
        
        values.append(record_id)
        cur.execute(
            f"UPDATE {table} SET {set_clause} WHERE id = %s RETURNING *",
            values
        )
        row = cur.fetchone()
        if not row:
            return None
        return dict(zip([desc[0] for desc in cur.description], row))

def delete_record(conn, table, record_id):
    with conn.cursor() as cur:
        cur.execute(f"DELETE FROM {table} WHERE id = %s RETURNING id", (record_id,))
        return cur.fetchone() is not None
