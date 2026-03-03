from __future__ import annotations

from flask import Blueprint, jsonify


health_bp = Blueprint("health", __name__)


@health_bp.get("/health")
def health():
    """Endpoint simples de verificação da API."""
    return jsonify({"status": "ok", "service": "pensamento-critico-backend"})

