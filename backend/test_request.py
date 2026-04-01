import urllib.request, json
import requests

def post(url, payload):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(url, data=data, headers={'Content-Type':'application/json'})
    with urllib.request.urlopen(req, timeout=10) as resp:
        return resp.status, resp.read().decode()

def post_image(url, image_path, field_name="file"):
    with open(image_path, "rb") as f:
        files = {"image": f}  # Flask expects 'image' as the field name
        response = requests.post(url, files=files)
        return response.status_code, response.text

payload = {"magnitude":5.2,"depth":10,"duration":15,"buildingAge":20,"material":"Concrete","floors":2,"soilType":"Hard"}

print('POST -> Flask (5000)')
try:
    s, r = post('http://localhost:5000/predict-data', payload)
    print('status:', s)
    print('body:', r)
except Exception as e:
    print('Flask request failed:', e)

if __name__ == "__main__":
    # Example usage for image upload
    image_path = "path/to/image.jpg"  # <-- Update this path to your test image
    url = "http://localhost:5000/predict-image"  # Correct endpoint for image prediction
    status, body = post_image(url, image_path)
    print("status:", status)
    print("body:", body)
