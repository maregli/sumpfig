import os
import json
import asyncio

# from concurrent.futures import ThreadPoolExecutor
from pydub import AudioSegment
from shazamio import Shazam
import yt_dlp

# Ensure the path exists
output_dir = "downloads"
os.makedirs(output_dir, exist_ok=True)

# Download track using yt-dlp
ydl_opts = {
    "format": "http_mp3_1_0",
    "outtmpl": os.path.join(output_dir, "track.mp3"),
    "postprocessors": [
        {
            "key": "FFmpegExtractAudio",
            "preferredcodec": "mp3",
            "preferredquality": "192",
        }
    ],
}

URLS = ["https://soundcloud.com/scheppertsound/very-slow-dreams-wav"]
with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    error_code = ydl.download(URLS)


# Split the track into 1-minute chunks
def split_audio(input_path, output_dir):
    track = AudioSegment.from_mp3(input_path)
    chunk_length_ms = 60 * 1000  # 1 minute in milliseconds
    segments = []

    for start_ms in range(0, len(track), chunk_length_ms):
        # end_ms = min(start_ms + chunk_length_ms, len(track))
        # segment = track[start_ms:end_ms]
        chunk_filename = f"{output_dir}/segment_{start_ms // 1000}.mp3"
        # segment.export(chunk_filename, format="mp3")
        segments.append(chunk_filename)

    return segments


# Shazam recognition for each audio segment
async def recognize_segment(shazam, segment_path):
    out = await shazam.recognize(segment_path)
    return {
        "path": segment_path,
        "track_title": out.get("track", {}).get("title", "Unknown"),
        "artist": out.get("track", {}).get("subtitle", "Unknown"),
    }


# Main function to process the audio and recognize segments
async def main():
    track_path = os.path.join(output_dir, "track.mp3")
    shazam = Shazam()

    track_list = []

    # Split the track into 1-minute chunks
    segments = split_audio(track_path, output_dir)

    for s in segments:
        print(f"Processing {s}...")
        result = await recognize_segment(shazam, s)
        result["start"] = s.split("_")[-1].split(".")[0]
        result["end"] = str(int(result["start"]) + 60)
        print(f"Recognized: {result['track_title']} by {result['artist']}")
        track_list.append(result)

    # Remove the downloaded segments
    for segment in segments:
        os.remove(segment)
        print(f"Removed {segment}")

    with open("src/data/track_setlist.json", "w") as f:
        json.dump(track_list, f, indent=4)
    print("Track setlist saved to src/data/track_setlist.json")


# Run the async main function
loop = asyncio.get_event_loop()
loop.run_until_complete(main())
loop.close()
