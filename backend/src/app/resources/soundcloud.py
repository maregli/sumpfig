"""Get label names, IDs and colors used in the project."""

from flask import request
from flask_restful import Resource
from src.app.services.soundcloud_scraper import extract_track_data


class SoundCloudMetadataHandler(Resource):

    def post(self):
        """Extract metadata from a given SoundCloud track URL."""
        try:
            # Get the JSON data from the request body
            data = request.get_json()

            # Extract the URL from the JSON
            url = data.get("url")

            if not url:
                return {"error": "Missing 'url' in request body"}, 400

            if not url.startswith("https://soundcloud.com/"):
                return {"error": "Invalid SoundCloud URL"}, 400

            # Call your scraper function
            track_data = extract_track_data(url)
            print(track_data)
            return track_data, 200

        except Exception as e:
            return {"error": str(e)}, 500
