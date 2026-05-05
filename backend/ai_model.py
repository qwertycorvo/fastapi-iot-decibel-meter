class NoiseAI:
    def __init__(self):
        # In a real scenario, these "weights" would be learned during training.
        # For this example, we'll use predefined thresholds to simulate a model.
        self.thresholds = {
            "quiet": 50,
            "moderate": 75,
            "loud": 90
        }

    def predict(self, db_level: float, hour: int):
        """
        Simulates an AI prediction.
        Takes decibel level and hour of the day (0-23).
        Returns a classification and a confidence score.
        """
        # Logic: Night time (22:00 - 06:00) is more sensitive to noise.
        is_night = hour >= 22 or hour <= 6
        effective_db = db_level + (10 if is_night else 0)
        
        if effective_db < self.thresholds["quiet"]:
            category = "Quiet"
            confidence = 0.95
        elif effective_db < self.thresholds["moderate"]:
            category = "Moderate"
            confidence = 0.85
        elif effective_db < self.thresholds["loud"]:
            category = "Loud"
            confidence = 0.80
        else:
            category = "Hazardous"
            confidence = 0.90
            
        return {
            "category": category,
            "confidence": confidence,
            "is_night_mode": is_night,
            "effective_db": effective_db
        }

# Initialize the model instance
noise_model = NoiseAI()
