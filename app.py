import os
import random

from flask import Flask, render_template
from flask_googlemaps import GoogleMaps, Map
from dotenv import load_dotenv

from modules import get_locations

load_dotenv(verbose=True)

app = Flask(__name__, template_folder='my-view-templates/')
app.config.from_object(os.environ['APP_SETTINGS'])

# initialize extensions
GoogleMaps(app)


@app.route("/")
def mapview():
    # creating a map in the view
    current_loc = get_locations.get_current_loc()

    ryans_map = Map(
        zoom=13,
        identifier="rbed23",
        lat=current_loc["lat"],
        lng=current_loc['lon'],
        markers=[
            {
                "lat": current_loc['lat'],
                "lng":current_loc['lon'],
                "infobox": "<b>YOU</b>"
            }
                ]
    )

    return render_template('index.html', ryan=ryans_map)


@app.route("/here")
def here_map():
    current_loc = get_locations.get_current_loc()

    return render_template(
        'hereMapIndex.html',
        hereApiKey=os.getenv('HERE_API_KEY'),
        coords=current_loc)


@app.route("/gmaps")
def gmaps_map():
    return render_template(
        'gmapsIndex.html',
        gmapsApiKey=os.getenv('GOOGLEMAPS_KEY'),
        coords=get_locations.get_current_loc(),
        ipGeoKey=os.getenv('IPGEOLOC_KEY'))

@app.route("/gmaps/addMe/<name>", methods=["GET"])
def returnSomething(name):
    coords = get_locations.get_current_loc()
    coords["lat"] += random.uniform(-0.02, 0.02)
    coords["lng"] += random.uniform(-0.02, 0.02)
    
    return {"coords": coords,
            "name": name}



if __name__ == "__main__":
    app.run(debug=True)