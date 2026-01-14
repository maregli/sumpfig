import os

from flask import Flask
from flask_cors import CORS
from flask_restful import Api

from src.app.routes import initialize_routes


def create_app():
    app = Flask(__name__)

    # Get allowed origins from environment variable, default to localhost for development
    allowed_origins = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000").split(
        ","
    )

    CORS(
        app,
        resources={
            r"/*": {
                "origins": allowed_origins,
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
            }
        },
        supports_credentials=True,
    )

    api = Api(app)
    initialize_routes(api)

    @app.route("/version")
    def version():
        import os

        return f"Job ID: {os.getenv('JOB_ID', 'unknown')}\nCommit ID: {os.getenv('COMMIT_ID', 'unknown')}"

    return app
