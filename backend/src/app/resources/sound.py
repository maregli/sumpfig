"""Get label names, IDs and colors used in the project."""

from flask_restful import Resource
import wave

class SoundHandler(Resource):
    """This class handles the GET requests to handle the labels used for this project."""

    def __init__(self):
        self.data = [1,2,3,4]

    def get(self):
        return self.data
