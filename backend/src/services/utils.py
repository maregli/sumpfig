import json


def melt_track_list(track_list: list[dict]) -> list[dict]:
    result = []
    c_title = ""
    c_artist = ""
    c_start = 0
    c_end = 0

    for track in track_list:
        if c_title == track["track_title"] and c_artist == track["artist"]:
            c_end = int(track["end"])
        else:
            if c_title != "":
                result.append(
                    {
                        "track_title": c_title,
                        "artist": c_artist,
                        "start": str(c_start),
                        "end": str(c_end),
                    }
                )
            c_title = track["track_title"]
            c_artist = track["artist"]
            c_start = int(track["start"])
            c_end = int(track["end"])

    result.append(
        {
            "track_title": c_title,
            "artist": c_artist,
            "start": str(c_start),
            "end": str(c_end),
        }
    )
    return result


data = json.load(open("src/data/track_setlist.json", "r"))
with open("src/data/track_setlist_melted.json", "w") as f:
    json.dump(melt_track_list(data), f, indent=4)
