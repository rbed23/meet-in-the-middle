import json
import os
import subprocess

import geocoder
from dotenv import load_dotenv

load_dotenv()

def get_current_loc(dev_location =None):
    if not dev_location:
        # loc = subprocess.run(["curl", "ipinfo.io"], capture_output=True)
        # returned_loc = returned_loc['loc'].split(",")
        # return {"lat": float(returned_loc[0]), "lng": float(returned_loc[1])}

        ipgeoloc_key = os.getenv('IPGEOLOC_KEY')
        loc = subprocess.run([
            "curl",
            f"https://api.ipgeolocation.io/ipgeo?apiKey={ipgeoloc_key}"],
            capture_output=True)
        returned_loc = json.loads(loc.stdout)
        # print(json.dumps(returned_loc, indent=2))

        # for comparison
        # print(json.dumps(geocoder.ip('me').json, indent=2))
        return {"lat": float(returned_loc['latitude']), "lng": float(returned_loc['longitude'])}
    else:
        return {"lat": float(dev_location[0]), "lng": float(dev_location[1])}

    