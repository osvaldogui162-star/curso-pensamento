from __future__ import annotations

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from app.config.settings import settings
from app.infrastructure.database.supabase_client import init_supabase_client
from app.presentation.routes.auth_routes import auth_bp
from app.presentation.routes.course_routes import course_bp
from app.presentation.routes.pdf_routes import pdf_bp
from app.presentation.routes.health_routes import health_bp
from app.presentation.routes.admin_course_routes import admin_course_bp
from app.presentation.routes.payment_routes import payment_bp
from app.presentation.routes.admin_payment_routes import admin_payment_bp


def create_app() -> Flask:
    """Factory principal da aplicação Flask.

    Responsabilidade única: construir e configurar a app (composition root).
    """

    app = Flask(__name__)

    # Configurações básicas
    app.config["SECRET_KEY"] = settings.secret_key
    app.config["JWT_SECRET_KEY"] = settings.jwt_secret_key
    app.config["JSON_SORT_KEYS"] = False

    # Extensões
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    JWTManager(app)

    # Inicializa cliente Supabase (mantido em módulo singleton)
    init_supabase_client()

    # Blueprints (camada de apresentação)
    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(course_bp, url_prefix="/api")
    app.register_blueprint(pdf_bp, url_prefix="/api")
    app.register_blueprint(admin_course_bp, url_prefix="/api/admin")
    app.register_blueprint(payment_bp, url_prefix="/api")
    app.register_blueprint(admin_payment_bp, url_prefix="/api/admin")

    # Tratadores de erro genéricos
    from app.shared.exceptions import DomainError

    @app.errorhandler(DomainError)
    def handle_domain_error(exc: DomainError):  # type: ignore[override]
        return (
            jsonify(
                {
                    "error": exc.code,
                    "message": exc.message,
                    "details": exc.details,
                }
            ),
            exc.http_status,
        )

    @app.errorhandler(404)
    def handle_not_found(_):  # type: ignore[override]
        return jsonify({"error": "not_found", "message": "Recurso não encontrado"}), 404

    @app.errorhandler(405)
    def handle_method_not_allowed(_):  # type: ignore[override]
        return (
            jsonify(
                {
                    "error": "method_not_allowed",
                    "message": "Método não permitido para este endpoint",
                }
            ),
            405,
        )

    @app.errorhandler(500)
    def handle_server_error(_):  # type: ignore[override]
        return (
            jsonify(
                {"error": "internal_error", "message": "Erro interno do servidor"}
            ),
            500,
        )

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=settings.debug)

