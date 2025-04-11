from flask_restful import Api
from src.app.resources.soundcloud import SoundCloudMetadataHandler


def initialize_routes(api: Api):
    """Initialize the routes for the API."""

    # SoundCloud
    # SoundCloud Metadata
    api.add_resource(
        SoundCloudMetadataHandler,
        "/soundcloud/metadata",
        endpoint="soundcloud_metadata",
    )
