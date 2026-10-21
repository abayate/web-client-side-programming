# apod.py
import requests
from IPython.display import display, Image

def get_apod(api_key):
    response = requests.get(f'https://api.nasa.gov/planetary/apod?api_key={api_key}')
    if response.status_code == 200:
        data = response.json()
        return data['title'], data['url'], data['explanation'], data.get('media_type', 'image')
    else:
        return "Could not fetch APOD data", "", "", ""

def display_apod(api_key):
    title, url, explanation, media_type = get_apod(api_key)
    if title == "Could not fetch APOD data":
        print(title)
    else:
        print(f"Title: {title}\nURL: {url}\nExplanation: {explanation}")
        # fixed: some days the APOD is a video, which Image() cannot show
        if media_type == "image":
            display(Image(url=url, embed=True))
        else:
            print(f"(Today's APOD is a {media_type}, open the URL above to watch it.)")
