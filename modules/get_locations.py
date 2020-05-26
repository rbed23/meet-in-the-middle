import json
import subprocess
import geocoder

def get_current_loc(dev_location =None):
    if not dev_location:
        loc = subprocess.run(["curl", "ipinfo.io"], capture_output=True)
        returned_loc = json.loads(loc.stdout)
        print(json.dumps(returned_loc, indent=2))
        returned_loc = returned_loc['loc'].split(",")
        print(json.dumps(geocoder.ip('me').json, indent=2))
        return {"lat": float(returned_loc[0]), "lon": float(returned_loc[1])}
    else:
        return {"lat": float(dev_location[0]), "lon": float(dev_location[1])}

    