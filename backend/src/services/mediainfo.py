from pydub.utils import mediainfo
import os
from pydub import AudioSegment

# Path to your audio file
track_path = "downloads/track.mp3"
output_dir = "src/data/"

# Use pydub's mediainfo to get the metadata about the audio
info = mediainfo(track_path)

# Check the number of channels
channels = info.get("channels")
print(f"The track has {channels} channels.")

# Load the audio file
audio = AudioSegment.from_mp3(track_path)

# Check if the audio has more than 1 channel (stereo)
if audio.channels > 1:
    # Split the stereo track into two mono tracks (left and right)
    left_channel = audio.split_to_mono()[0]
    right_channel = audio.split_to_mono()[1]

    # Save the mono tracks as separate files
    left_channel_path = os.path.join(output_dir, "left_channel.mp3")
    right_channel_path = os.path.join(output_dir, "right_channel.mp3")

    left_channel.export(left_channel_path, format="mp3")
    right_channel.export(right_channel_path, format="mp3")

    print(f"Stereo track split into two mono tracks:")
    print(f"Left channel saved to {left_channel_path}")
    print(f"Right channel saved to {right_channel_path}")
else:
    print("The audio is already mono.")
