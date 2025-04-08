from flask_restful import Api
from src.app.resources.sound import SoundHandler


def initialize_routes(api: Api):
    # Sound
    api.add_resource(SoundHandler, "/sound")