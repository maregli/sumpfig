"""SoundCloud API handlers using soundcloud-v2 library."""

import logging
from datetime import datetime

from flask import request
from flask_restful import Resource
from soundcloud import SoundCloud

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize SoundCloud client
# The soundcloud-v2 library handles client_id automatically
sc = SoundCloud()


def safe_get_attr(obj, attr, default=None):
    """Safely get an attribute from an object, returning default if not found."""
    try:
        value = getattr(obj, attr, default)
        # Convert datetime objects to ISO format strings for JSON serialization
        if isinstance(value, datetime):
            return value.isoformat()
        return value
    except (AttributeError, TypeError):
        return default


class SoundCloudMetadataHandler(Resource):
    """Handle track metadata requests using soundcloud-v2."""

    def post(self):
        """
        Extract metadata from a given SoundCloud track URL.

        Request body:
        {
            "url": "https://soundcloud.com/artist/track"
        }
        """
        try:
            # Get the JSON data from the request body
            data = request.get_json()

            # Extract the URL from the JSON
            url = data.get("url")

            if not url:
                return {"error": "Missing 'url' in request body"}, 400

            if not url.startswith("https://soundcloud.com/"):
                return {"error": "Invalid SoundCloud URL"}, 400

            logger.info(f"Fetching track metadata for: {url}")

            # Fetch track using soundcloud-v2
            track = sc.resolve(url)

            if not track:
                return {"error": "Track not found or unavailable"}, 404

            # Format response to match the previous C# service response
            user_obj = safe_get_attr(track, "user")

            response = {
                "id": safe_get_attr(track, "id"),
                "title": safe_get_attr(track, "title"),
                "artist": safe_get_attr(track, "artist")
                or safe_get_attr(user_obj, "username"),
                "artist_name": safe_get_attr(user_obj, "full_name")
                or safe_get_attr(user_obj, "username"),
                "duration": safe_get_attr(track, "duration")
                or safe_get_attr(track, "full_duration", 0),
                "duration_seconds": (
                    safe_get_attr(track, "duration")
                    or safe_get_attr(track, "full_duration", 0)
                )
                / 1000.0,
                "genre": safe_get_attr(track, "genre"),
                "likes_count": safe_get_attr(track, "likes_count", 0),
                "playback_count": safe_get_attr(track, "playback_count", 0),
                "permalink_url": safe_get_attr(track, "permalink_url") or url,
                "artwork_url": safe_get_attr(track, "artwork_url"),
                "description": safe_get_attr(track, "description"),
                "created_at": safe_get_attr(track, "created_at"),
                "release_date": safe_get_attr(track, "release_date"),
                "downloadable": safe_get_attr(track, "downloadable", False),
                "streamable": safe_get_attr(track, "streamable", True),
                "user": {
                    "id": safe_get_attr(user_obj, "id"),
                    "username": safe_get_attr(user_obj, "username"),
                    "full_name": safe_get_attr(user_obj, "full_name"),
                    "permalink_url": safe_get_attr(user_obj, "permalink_url"),
                    "avatar_url": safe_get_attr(user_obj, "avatar_url"),
                }
                if user_obj
                else None,
            }

            return response, 200

        except AttributeError as e:
            logger.error(f"Track object missing expected attributes: {str(e)}")
            return {"error": "Invalid track data format"}, 500
        except Exception as e:
            logger.error(f"Error fetching track metadata: {str(e)}")
            return {"error": f"Error processing request: {str(e)}"}, 500


class SoundCloudPlaylistHandler(Resource):
    """Handle playlist requests using soundcloud-v2."""

    def post(self):
        """
        Extract playlist metadata from a SoundCloud playlist URL.

        Request body:
        {
            "url": "https://soundcloud.com/artist/sets/playlist",
            "loadTracks": true  // optional, defaults to true
        }
        """
        try:
            data = request.get_json()
            url = data.get("url")
            load_tracks = data.get("loadTracks", True)

            if not url:
                return {"error": "Missing 'url' in request body"}, 400

            if not url.startswith("https://soundcloud.com/"):
                return {"error": "Invalid SoundCloud URL"}, 400

            logger.info(f"Fetching playlist metadata for: {url}")

            # Fetch playlist using soundcloud-v2
            playlist = sc.resolve(url)

            if not playlist:
                return {"error": "Playlist not found or unavailable"}, 404

            # Format response
            user_obj = safe_get_attr(playlist, "user")
            tracks_list = safe_get_attr(playlist, "tracks", [])

            response = {
                "id": safe_get_attr(playlist, "id"),
                "title": safe_get_attr(playlist, "title"),
                "description": safe_get_attr(playlist, "description"),
                "duration": safe_get_attr(playlist, "duration", 0),
                "track_count": safe_get_attr(playlist, "track_count")
                or len(tracks_list),
                "artwork_url": safe_get_attr(playlist, "artwork_url"),
                "permalink_url": safe_get_attr(playlist, "permalink_url") or url,
                "created_at": safe_get_attr(playlist, "created_at"),
                "user": {
                    "id": safe_get_attr(user_obj, "id"),
                    "username": safe_get_attr(user_obj, "username"),
                    "full_name": safe_get_attr(user_obj, "full_name"),
                    "permalink_url": safe_get_attr(user_obj, "permalink_url"),
                    "avatar_url": safe_get_attr(user_obj, "avatar_url"),
                }
                if user_obj
                else None,
            }

            # Add tracks if requested
            if load_tracks and tracks_list:
                response["tracks"] = [
                    {
                        "id": safe_get_attr(track, "id"),
                        "title": safe_get_attr(track, "title"),
                        "duration": safe_get_attr(track, "duration")
                        or safe_get_attr(track, "full_duration", 0),
                        "permalink_url": safe_get_attr(track, "permalink_url"),
                        "artwork_url": safe_get_attr(track, "artwork_url"),
                    }
                    for track in tracks_list
                ]
            else:
                response["tracks"] = []

            return response, 200

        except Exception as e:
            logger.error(f"Error fetching playlist metadata: {str(e)}")
            return {"error": f"Error processing request: {str(e)}"}, 500


class SoundCloudSearchHandler(Resource):
    """Handle search requests using soundcloud-v2."""

    def post(self):
        """
        Search for tracks on SoundCloud.

        Request body:
        {
            "query": "search term",
            "limit": 20  // optional, defaults to 20
        }
        """
        try:
            data = request.get_json()
            query = data.get("query")
            limit = data.get("limit", 20)

            if not query:
                return {"error": "Missing 'query' in request body"}, 400

            logger.info(f"Searching SoundCloud for: {query}")

            # Search tracks using soundcloud-v2
            search_results = sc.search_tracks(query, limit=limit)

            if not search_results:
                return [], 200

            # Format response
            tracks = []
            for track in search_results:
                user_obj = safe_get_attr(track, "user")
                tracks.append(
                    {
                        "id": safe_get_attr(track, "id"),
                        "title": safe_get_attr(track, "title"),
                        "duration": safe_get_attr(track, "duration")
                        or safe_get_attr(track, "full_duration", 0),
                        "genre": safe_get_attr(track, "genre"),
                        "likes_count": safe_get_attr(track, "likes_count", 0),
                        "playback_count": safe_get_attr(track, "playback_count", 0),
                        "permalink_url": safe_get_attr(track, "permalink_url"),
                        "artwork_url": safe_get_attr(track, "artwork_url"),
                        "user": {
                            "username": safe_get_attr(user_obj, "username"),
                            "full_name": safe_get_attr(user_obj, "full_name"),
                        }
                        if user_obj
                        else None,
                    }
                )

            return tracks, 200

        except Exception as e:
            logger.error(f"Error searching tracks: {str(e)}")
            return {"error": f"Error processing request: {str(e)}"}, 500
