"""SoundCloud Scraper
This script extracts track information from a SoundCloud page using web scraping techniques.
It fetches the page content, parses the HTML to find the relevant data, and returns a dictionary
with the track details.
Dependencies:
- requests: For making HTTP requests to fetch the page content.
- BeautifulSoup: For parsing HTML and extracting data.
- json: For handling JSON data.
- re: For regular expression operations.
- logging: For logging errors and information.
"""

import json
import re
import logging

import requests
from bs4 import BeautifulSoup

# Set up logging
logging.basicConfig(level=logging.INFO)


def extract_track_data(url):
    """
    Extracts track data from a SoundCloud page.
    Args:
        url (str): The URL of the SoundCloud track.
    Returns:
        dict: A dictionary containing track information or error details.
    """
    track_details = {
        "title": "",
        "artist": "",
        "album": "",
        "release_date": "",
        "publish_date": "",
        "genre": "",
        "likes": "",
        "playbacks": "",
        "permalink": "",
        "artwork_url": "",
    }

    try:
        # Step 1: Fetch the page
        response = requests.get(url, timeout=10)
        response.raise_for_status()
    except requests.Timeout:
        logging.error("Request timed out.")
        return track_details
    except requests.RequestException as e:
        logging.error("Request failed: %s", e)
        track_details["error"] = f"Failed to fetch track data: {str(e)}"
        return track_details

    try:
        # Step 2: Parse HTML content
        soup = BeautifulSoup(response.text, "html.parser")

        # Step 3: Extract hydration JSON from <script>
        script_tag = soup.find("script", string=re.compile(r"window\.__sc_hydration"))
        if not script_tag:
            logging.error("Could not find hydration script.")
            track_details["error"] = "Could not find hydration script."
            return track_details

        script_text = script_tag.string
        json_match = re.search(r"window\.__sc_hydration\s*=\s*(\[.*\]);", script_text)
        if not json_match:
            logging.error("Could not parse hydration JSON.")
            track_details["error"] = "Could not parse hydration JSON."
            return track_details

        hydration_data = json.loads(json_match.group(1))

        # Step 4: Extract track & user info
        track_data = next(
            (
                item["data"]
                for item in hydration_data
                if item.get("hydratable") == "sound"
            ),
            None,
        )
        if not track_data:
            logging.error("Track data not found in hydration data.")
            track_details["error"] = "Track data not found."
            return track_details

        user_data = track_data.get("user", {})

        # Step 5: Extract Publish date
        time_tag = soup.select_one(
            'article[itemtype="http://schema.org/MusicRecording"] time[pubdate]'
        )
        publish_date = time_tag.string.strip() if time_tag else None

        # Step 6: Format and return track info
        track_info = {
            "title": track_data.get("title"),
            "artist": user_data.get("username"),
            "album": track_data.get("publisher_metadata", {}).get("album_title"),
            "release_date": track_data.get("release_date"),
            "publish_date": publish_date,
            "genre": track_data.get("genre"),
            "likes": track_data.get("likes_count"),
            "playbacks": track_data.get("playback_count"),
            "permalink": track_data.get("permalink_url"),
            "artwork_url": track_data.get("artwork_url"),
        }

        return track_info

    except Exception as e:
        # General exception handling for any unexpected errors
        logging.error("Error extracting track data: %s", e)
        track_info["error"] = f"Error extracting track data: {str(e)}"
        return track_info
