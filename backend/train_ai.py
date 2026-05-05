import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeClassifier
import joblib
import os

def train_model():
    # 1. Create a dummy dataset
    # Features: [decibel_level, hour_of_day]
    # Labels: 0: Quiet, 1: Moderate, 2: Loud, 3: Danger
    
    data = []
    # Generate some synthetic data
    for _ in range(1000):
        db = np.random.uniform(30, 120)
        hour = np.random.randint(0, 24)
        
        # Simple logic for labels
        if db < 50:
            label = 0 # Quiet
        elif db < 75:
            label = 1 # Moderate
        elif db < 90:
            label = 2 # Loud
        else:
            label = 3 # Danger
            
        data.append([db, hour, label])
        
    df = pd.DataFrame(data, columns=['db_level', 'hour', 'label'])
    
    X = df[['db_level', 'hour']]
    y = df['label']
    
    # 2. Initialize and train the model
    model = DecisionTreeClassifier()
    model.fit(X, y)
    
    # 3. Save the model to a file
    model_path = 'noise_model.joblib'
    joblib.dump(model, model_path)
    print(f"Model trained and saved to {model_path}")

if __name__ == "__main__":
    train_model()
