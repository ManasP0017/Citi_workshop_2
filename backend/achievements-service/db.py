"""
PostgreSQL database operations for Achievements service.
Handles CRUD operations and table auto-creation.
Supports: achievements (legacy), achievement_catalog, achievement_awards.
"""

from psycopg import connect
import uuid

PG_CONN = None

CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    achievement_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""

CREATE_CATALOG_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS achievement_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(300) NOT NULL,
    description TEXT,
    recurrence VARCHAR(50),
    scope VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""

CREATE_AWARDS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS achievement_awards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    catalog_id UUID REFERENCES achievement_catalog(id) ON DELETE CASCADE,
    team_id UUID,
    individual_id UUID,
    awarded_date DATE NOT NULL,
    location VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""


def get_connection(config):
    """Get or create a PostgreSQL connection with connection pooling."""
    global PG_CONN
    try:
        if PG_CONN is None or PG_CONN.closed:
            PG_CONN = connect(config, autocommit=True)
        return PG_CONN
    except Exception as e:
        PG_CONN = None
        raise


def init_table(config):
    """Create all tables if they don't exist."""
    conn = get_connection(config)
    with conn.cursor() as cur:
        cur.execute(CREATE_TABLE_SQL)
        cur.execute(CREATE_CATALOG_TABLE_SQL)
        cur.execute(CREATE_AWARDS_TABLE_SQL)


# ──────────────────────────────────────────────
# Legacy Achievements CRUD (kept for backward compat)
# ──────────────────────────────────────────────

def create_achievement(config, data):
    """Create a new achievement record."""
    conn = get_connection(config)
    ach_id = str(uuid.uuid4())
    with conn.cursor() as cur:
        cur.execute(
            """INSERT INTO achievements (id, team_id, title, description, achievement_date)
               VALUES (%s, %s, %s, %s, %s)
               RETURNING id, team_id, title, description, achievement_date, created_at, updated_at""",
            (
                ach_id,
                data.get("team_id"),
                data["title"],
                data.get("description"),
                data["achievement_date"],
            ),
        )
        row = cur.fetchone()
        return row_to_dict(row)


def get_all_achievements(config, team_id=None):
    """Retrieve all achievements, optionally filtered by team_id."""
    conn = get_connection(config)
    with conn.cursor() as cur:
        if team_id:
            cur.execute(
                """SELECT a.id, a.team_id, a.title, a.description, a.achievement_date,
                          a.created_at, a.updated_at, t.name as team_name
                   FROM achievements a
                   LEFT JOIN teams t ON a.team_id::text = t.id::text
                   WHERE a.team_id = %s
                   ORDER BY a.achievement_date DESC""",
                (team_id,),
            )
        else:
            cur.execute(
                """SELECT a.id, a.team_id, a.title, a.description, a.achievement_date,
                          a.created_at, a.updated_at, t.name as team_name
                   FROM achievements a
                   LEFT JOIN teams t ON a.team_id::text = t.id::text
                   ORDER BY a.achievement_date DESC"""
            )
        rows = cur.fetchall()
        return [row_to_dict_with_team(row) for row in rows]


def get_achievement_by_id(config, achievement_id):
    """Retrieve a single achievement by ID."""
    conn = get_connection(config)
    with conn.cursor() as cur:
        cur.execute(
            """SELECT a.id, a.team_id, a.title, a.description, a.achievement_date,
                      a.created_at, a.updated_at, t.name as team_name
               FROM achievements a
               LEFT JOIN teams t ON a.team_id::text = t.id::text
               WHERE a.id = %s""",
            (achievement_id,),
        )
        row = cur.fetchone()
        return row_to_dict_with_team(row) if row else None


def update_achievement(config, achievement_id, data):
    """Update an achievement record."""
    conn = get_connection(config)
    with conn.cursor() as cur:
        cur.execute(
            """UPDATE achievements
               SET team_id = %s, title = %s, description = %s,
                   achievement_date = %s, updated_at = CURRENT_TIMESTAMP
               WHERE id = %s
               RETURNING id, team_id, title, description, achievement_date, created_at, updated_at""",
            (
                data.get("team_id"),
                data["title"],
                data.get("description"),
                data["achievement_date"],
                achievement_id,
            ),
        )
        row = cur.fetchone()
        return row_to_dict(row) if row else None


def delete_achievement(config, achievement_id):
    """Delete an achievement record."""
    conn = get_connection(config)
    with conn.cursor() as cur:
        cur.execute("DELETE FROM achievements WHERE id = %s RETURNING id", (achievement_id,))
        return cur.fetchone() is not None


# ──────────────────────────────────────────────
# Achievement Catalog CRUD
# ──────────────────────────────────────────────

def create_catalog_item(config, data):
    """Create a new catalog item (achievement definition)."""
    conn = get_connection(config)
    item_id = str(uuid.uuid4())
    with conn.cursor() as cur:
        cur.execute(
            """INSERT INTO achievement_catalog (id, title, description, recurrence, scope)
               VALUES (%s, %s, %s, %s, %s)
               RETURNING id, title, description, recurrence, scope, created_at, updated_at""",
            (
                item_id,
                data["title"],
                data.get("description"),
                data.get("recurrence"),
                data.get("scope"),
            ),
        )
        row = cur.fetchone()
        return catalog_row_to_dict(row)


def get_all_catalog(config):
    """Retrieve all catalog items."""
    conn = get_connection(config)
    with conn.cursor() as cur:
        cur.execute(
            """SELECT id, title, description, recurrence, scope, created_at, updated_at
               FROM achievement_catalog
               ORDER BY created_at DESC"""
        )
        rows = cur.fetchall()
        return [catalog_row_to_dict(row) for row in rows]


def delete_catalog_item(config, catalog_id):
    """Delete a catalog item. Awards linked to it are cascade-deleted."""
    conn = get_connection(config)
    with conn.cursor() as cur:
        cur.execute("DELETE FROM achievement_catalog WHERE id = %s RETURNING id", (catalog_id,))
        return cur.fetchone() is not None


# ──────────────────────────────────────────────
# Achievement Awards CRUD
# ──────────────────────────────────────────────

def create_award(config, data):
    """Create a new award (grant an achievement to a team/individual)."""
    conn = get_connection(config)
    award_id = str(uuid.uuid4())
    with conn.cursor() as cur:
        cur.execute(
            """INSERT INTO achievement_awards (id, catalog_id, team_id, individual_id, awarded_date, location)
               VALUES (%s, %s, %s, %s, %s, %s)
               RETURNING id, catalog_id, team_id, individual_id, awarded_date, location, created_at, updated_at""",
            (
                award_id,
                data["catalog_id"],
                data.get("team_id"),
                data.get("individual_id"),
                data["awarded_date"],
                data.get("location"),
            ),
        )
        row = cur.fetchone()
        return award_row_to_dict(row)


def get_all_awards(config, team_id=None):
    """Retrieve all awards with joined catalog, team, and individual names."""
    conn = get_connection(config)
    with conn.cursor() as cur:
        base_sql = """
            SELECT aw.id, aw.catalog_id, aw.team_id, aw.individual_id,
                   aw.awarded_date, aw.location, aw.created_at, aw.updated_at,
                   c.title, c.description, c.recurrence, c.scope,
                   t.name as team_name,
                   CASE WHEN i.id IS NOT NULL THEN i.first_name || ' ' || i.last_name ELSE NULL END as individual_name
            FROM achievement_awards aw
            LEFT JOIN achievement_catalog c ON aw.catalog_id::text = c.id::text
            LEFT JOIN teams t ON aw.team_id::text = t.id::text
            LEFT JOIN individuals i ON aw.individual_id::text = i.id::text
        """
        if team_id:
            base_sql += " WHERE aw.team_id = %s"
            base_sql += " ORDER BY aw.awarded_date DESC"
            cur.execute(base_sql, (team_id,))
        else:
            base_sql += " ORDER BY aw.awarded_date DESC"
            cur.execute(base_sql)

        rows = cur.fetchall()
        return [award_row_to_dict_full(row) for row in rows]


def delete_award(config, award_id):
    """Delete an award."""
    conn = get_connection(config)
    with conn.cursor() as cur:
        cur.execute("DELETE FROM achievement_awards WHERE id = %s RETURNING id", (award_id,))
        return cur.fetchone() is not None


# ──────────────────────────────────────────────
# Row converters
# ──────────────────────────────────────────────

def row_to_dict(row):
    """Convert a legacy achievement row to a dictionary."""
    if not row:
        return None
    return {
        "id": str(row[0]),
        "team_id": str(row[1]) if row[1] else None,
        "title": row[2],
        "description": row[3],
        "achievement_date": row[4].isoformat() if row[4] else None,
        "created_at": row[5].isoformat() if row[5] else None,
        "updated_at": row[6].isoformat() if row[6] else None,
    }


def row_to_dict_with_team(row):
    """Convert a legacy achievement row with team name to a dictionary."""
    if not row:
        return None
    d = row_to_dict(row)
    d["team_name"] = row[7] if len(row) > 7 else None
    return d


def catalog_row_to_dict(row):
    """Convert a catalog row to a dictionary."""
    if not row:
        return None
    return {
        "id": str(row[0]),
        "title": row[1],
        "description": row[2],
        "recurrence": row[3],
        "scope": row[4],
        "created_at": row[5].isoformat() if row[5] else None,
        "updated_at": row[6].isoformat() if row[6] else None,
    }


def award_row_to_dict(row):
    """Convert a basic award row to a dictionary."""
    if not row:
        return None
    return {
        "id": str(row[0]),
        "catalog_id": str(row[1]) if row[1] else None,
        "team_id": str(row[2]) if row[2] else None,
        "individual_id": str(row[3]) if row[3] else None,
        "awarded_date": row[4].isoformat() if row[4] else None,
        "location": row[5],
        "created_at": row[6].isoformat() if row[6] else None,
        "updated_at": row[7].isoformat() if row[7] else None,
    }


def award_row_to_dict_full(row):
    """Convert a joined award row (with catalog/team/individual) to a dictionary."""
    if not row:
        return None
    return {
        "id": str(row[0]),
        "catalog_id": str(row[1]) if row[1] else None,
        "team_id": str(row[2]) if row[2] else None,
        "individual_id": str(row[3]) if row[3] else None,
        "awarded_date": row[4].isoformat() if row[4] else None,
        "location": row[5],
        "created_at": row[6].isoformat() if row[6] else None,
        "updated_at": row[7].isoformat() if row[7] else None,
        "title": row[8],
        "description": row[9],
        "recurrence": row[10],
        "scope": row[11],
        "team_name": row[12],
        "individual_name": row[13],
    }
