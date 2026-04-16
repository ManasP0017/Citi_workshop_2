"""
AWS Lambda handler for Achievements service.
Provides CRUD operations for managing team achievements.
Routes:
  Legacy:  POST/GET/PUT/DELETE /api/achievements-service
  Catalog: POST/GET /api/achievements-service/catalog
           DELETE   /api/achievements-service/catalog/{id}
  Awards:  POST/GET /api/achievements-service/awards
           DELETE   /api/achievements-service/awards/{id}
"""

import json
import logging
import os
from db import (
    init_table,
    create_achievement,
    get_all_achievements,
    get_achievement_by_id,
    update_achievement,
    delete_achievement,
    create_catalog_item,
    get_all_catalog,
    delete_catalog_item,
    create_award,
    get_all_awards,
    delete_award,
)
from auth import verify_token

logger = logging.getLogger()
logger.setLevel(logging.INFO)

IS_LOCAL = os.getenv("IS_LOCAL", "false") == "true"
PG_CONFIG = (
    f"host={os.getenv('POSTGRES_HOST', 'localhost')} "
    f"port={os.getenv('POSTGRES_PORT', '5432')} "
    f"user={os.getenv('POSTGRES_USER', 'postgres')} "
    f"password={os.getenv('POSTGRES_PASS', 'postgres123')} "
    f"dbname={os.getenv('POSTGRES_NAME', 'postgres')} "
    f"connect_timeout=15"
)
if not IS_LOCAL:
    PG_CONFIG += " sslmode=require"

_initialized = False


def _ensure_init():
    global _initialized
    if not _initialized:
        init_table(PG_CONFIG)
        _initialized = True

def check_auth_and_role(event, allowed_roles):
    """Verify JWT token and check if user role is permitted."""
    headers = event.get("headers", {})
    auth_header = headers.get("authorization", headers.get("Authorization", ""))
    
    if not auth_header.startswith("Bearer "):
        return False, response(401, {"error": "Authentication required. Missing or malformed token."})
        
    token = auth_header[7:]
    payload = verify_token(token)
    
    if not payload:
        return False, response(401, {"error": "Invalid or expired token."})
        
    user_role = payload.get("role", "viewer")
    if user_role not in allowed_roles:
        return False, response(403, {"error": f"Access denied. Required one of {allowed_roles}, got {user_role}."})
        
    return True, payload


def parse_path(path):
    """Parse the URL path into sub_route and resource_id."""
    parts = [p for p in path.split("/") if p]
    # /api/achievements-service/catalog/{id}
    # /api/achievements-service/awards/{id}
    # /api/achievements-service/{id}
    sub_route = None
    resource_id = None

    if len(parts) >= 3:
        if parts[2] in ("catalog", "awards"):
            sub_route = parts[2]
            if len(parts) >= 4:
                resource_id = parts[3]
        else:
            resource_id = parts[2]

    return sub_route, resource_id


def handler(event=None, context=None):
    """Lambda handler routing by HTTP method and sub-route."""
    _ensure_init()

    try:
        method = event.get("requestContext", {}).get("http", {}).get("method", "GET")
        path = event.get("rawPath", "")
        query_params = event.get("queryStringParameters") or {}
        body = {}

        if event.get("body"):
            try:
                body = json.loads(event["body"])
            except (json.JSONDecodeError, TypeError):
                return response(400, {"error": "Invalid JSON body"})

        sub_route, resource_id = parse_path(path)

        if sub_route == "catalog":
            return handle_catalog(method, event, body, resource_id)
        elif sub_route == "awards":
            return handle_awards(method, event, body, resource_id, query_params)
        else:
            return handle_legacy(method, event, body, resource_id, query_params)

    except Exception as e:
        logger.error("Handler error: %s", str(e))
        return response(500, {"error": "Internal server error", "message": str(e)})


# ──────────────────────────────────────────────
# Catalog handlers
# ──────────────────────────────────────────────

def handle_catalog(method, event, body, resource_id):
    """Route catalog requests."""
    if method == "GET":
        ok, err_resp = check_auth_and_role(event, ["admin", "manager", "contributor", "viewer"])
        if not ok:
            return err_resp
        items = get_all_catalog(PG_CONFIG)
        return response(200, items)

    elif method == "POST":
        ok, err_resp = check_auth_and_role(event, ["admin", "manager", "contributor"])
        if not ok:
            return err_resp
        if not body.get("title", "").strip():
            return response(400, {"error": "Validation failed", "details": ["title is required"]})
        item = create_catalog_item(PG_CONFIG, body)
        return response(201, item)

    elif method == "DELETE":
        if not resource_id:
            return response(400, {"error": "ID is required for delete"})
        ok, err_resp = check_auth_and_role(event, ["admin", "manager"])
        if not ok:
            return err_resp
        deleted = delete_catalog_item(PG_CONFIG, resource_id)
        if not deleted:
            return response(404, {"error": "Catalog item not found"})
        return response(204, None)

    else:
        return response(405, {"error": f"Method {method} not allowed for catalog"})


# ──────────────────────────────────────────────
# Awards handlers
# ──────────────────────────────────────────────

def handle_awards(method, event, body, resource_id, query_params):
    """Route award requests."""
    if method == "GET":
        ok, err_resp = check_auth_and_role(event, ["admin", "manager", "contributor", "viewer"])
        if not ok:
            return err_resp
        team_id = query_params.get("team_id")
        awards = get_all_awards(PG_CONFIG, team_id=team_id)
        return response(200, awards)

    elif method == "POST":
        ok, err_resp = check_auth_and_role(event, ["admin", "manager", "contributor"])
        if not ok:
            return err_resp
        errors = validate_award(body)
        if errors:
            return response(400, {"error": "Validation failed", "details": errors})
        award = create_award(PG_CONFIG, body)
        return response(201, award)

    elif method == "DELETE":
        if not resource_id:
            return response(400, {"error": "ID is required for delete"})
        ok, err_resp = check_auth_and_role(event, ["admin", "manager"])
        if not ok:
            return err_resp
        deleted = delete_award(PG_CONFIG, resource_id)
        if not deleted:
            return response(404, {"error": "Award not found"})
        return response(204, None)

    else:
        return response(405, {"error": f"Method {method} not allowed for awards"})


# ──────────────────────────────────────────────
# Legacy handlers (backward compatible)
# ──────────────────────────────────────────────

def handle_legacy(method, event, body, resource_id, query_params):
    """Handle legacy achievement CRUD (kept for dashboard compatibility)."""
    if method == "POST":
        ok, err_resp = check_auth_and_role(event, ["admin", "manager", "contributor"])
        if not ok: return err_resp
        return handle_create(body)
    elif method == "GET":
        ok, err_resp = check_auth_and_role(event, ["admin", "manager", "contributor", "viewer"])
        if not ok: return err_resp
        if resource_id:
            return handle_get_one(resource_id)
        return handle_get_all(query_params)
    elif method == "PUT":
        if not resource_id:
            return response(400, {"error": "ID is required for update"})
        ok, err_resp = check_auth_and_role(event, ["admin", "manager", "contributor"])
        if not ok: return err_resp
        return handle_update(resource_id, body)
    elif method == "DELETE":
        if not resource_id:
            return response(400, {"error": "ID is required for delete"})
        ok, err_resp = check_auth_and_role(event, ["admin", "manager"])
        if not ok: return err_resp
        return handle_delete(resource_id)
    else:
        return response(405, {"error": f"Method {method} not allowed"})


def handle_create(body):
    """Handle POST - create a new achievement."""
    errors = validate(body)
    if errors:
        return response(400, {"error": "Validation failed", "details": errors})

    achievement = create_achievement(PG_CONFIG, body)
    return response(201, achievement)


def handle_get_all(params):
    """Handle GET all achievements."""
    team_id = params.get("team_id")
    achievements = get_all_achievements(PG_CONFIG, team_id=team_id)
    return response(200, achievements)


def handle_get_one(resource_id):
    """Handle GET achievement by ID."""
    achievement = get_achievement_by_id(PG_CONFIG, resource_id)
    if not achievement:
        return response(404, {"error": "Achievement not found"})
    return response(200, achievement)


def handle_update(resource_id, body):
    """Handle PUT - update an achievement."""
    errors = validate(body)
    if errors:
        return response(400, {"error": "Validation failed", "details": errors})

    achievement = update_achievement(PG_CONFIG, resource_id, body)
    if not achievement:
        return response(404, {"error": "Achievement not found"})
    return response(200, achievement)


def handle_delete(resource_id):
    """Handle DELETE - remove an achievement."""
    deleted = delete_achievement(PG_CONFIG, resource_id)
    if not deleted:
        return response(404, {"error": "Achievement not found"})
    return response(204, None)


# ──────────────────────────────────────────────
# Validators
# ──────────────────────────────────────────────

def validate(data):
    """Validate legacy achievement data."""
    errors = []
    if not data.get("title", "").strip():
        errors.append("title is required")
    if not data.get("achievement_date", "").strip():
        errors.append("achievement_date is required")
    return errors


def validate_award(data):
    """Validate award data."""
    errors = []
    if not data.get("catalog_id", "").strip():
        errors.append("catalog_id is required")
    if not data.get("awarded_date", "").strip():
        errors.append("awarded_date is required")
    if not data.get("team_id") and not data.get("individual_id"):
        errors.append("Either team_id or individual_id is required")
    return errors


def extract_id(path):
    """Extract resource ID from URL path."""
    parts = [p for p in path.split("/") if p]
    if len(parts) >= 3 and parts[0] == "api":
        return parts[2]
    return None


def response(status_code, body):
    """Build a Lambda response object."""
    resp = {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
    }
    if body is not None:
        resp["body"] = json.dumps(body, default=str)
    return resp


if __name__ == "__main__":
    print(handler({"requestContext": {"http": {"method": "GET"}}, "rawPath": "/api/achievements-service"}, None))
