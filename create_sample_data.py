import requests
import json
from datetime import datetime

# Create sample raffle for testing
def create_sample_raffle():
    base_url = "https://ventana-proyecto.preview.emergentagent.com/api"
    
    # Login as admin
    login_response = requests.post(f"{base_url}/auth/login", json={
        "email": "vimaro16+5@gmail.com",
        "password": "admin123"
    })
    
    if login_response.status_code != 200:
        print("Could not login as admin")
        return False
    
    token = login_response.json()['token']
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    
    # Create a sample raffle
    raffle_data = {
        "title": "Test Raffle for Features",
        "description": "This is a test raffle to validate new features like sharing and top buyer functionality.",
        "image_url": "https://images.pexels.com/photos/6612233/pexels-photo-6612233.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "video_url": None,
        "slot_price": 5.0
    }
    
    response = requests.post(f"{base_url}/raffles", json=raffle_data, headers=headers)
    
    if response.status_code == 200:
        raffle_id = response.json()['id']
        print(f"✅ Created sample raffle with ID: {raffle_id}")
        return raffle_id
    else:
        print(f"❌ Failed to create raffle: {response.text}")
        return False

if __name__ == "__main__":
    create_sample_raffle()