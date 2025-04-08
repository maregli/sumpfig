from flask import Flask
from flask_restful import Api
from flask_cors import CORS
from src.app.routes import initialize_routes

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})
    api = Api(app)
    initialize_routes(api)

    @app.route("/version")
    def version():
        import os
        return f"Job ID: {os.getenv('JOB_ID', 'unknown')}\nCommit ID: {os.getenv('COMMIT_ID', 'unknown')}"

    return app
