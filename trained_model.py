import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib

def main():
    print("--- ARES ML Module: Fall Detection ---")
    
    # 1. Generate Synthetic Data (Prototyping Phase)
    print("[1/5] Generating synthetic accelerometer data (X, Y, Z axes)...")
    np.random.seed(42)

    # Simulating Normal activity (walking, sitting) - low variance
    normal_data = np.random.normal(loc=0.5, scale=0.2, size=(800, 3))
    normal_labels = np.zeros(800) # Class 0: Normal

    # Simulating Fall events - high variance, sudden spikes
    fall_data = np.random.normal(loc=2.0, scale=1.5, size=(200, 3))
    fall_labels = np.ones(200) # Class 1: Fall/Impact

    # Combine into a DataFrame
    X = np.vstack((normal_data, fall_data))
    y = np.concatenate((normal_labels, fall_labels))
    df = pd.DataFrame(X, columns=['Accel_X', 'Accel_Y', 'Accel_Z'])
    df['Label'] = y

    # 2. Split Data
    print("[2/5] Splitting data into training and testing sets...")
    X_train, X_test, y_train, y_test = train_test_split(
        df[['Accel_X', 'Accel_Y', 'Accel_Z']], 
        df['Label'], 
        test_size=0.2, 
        random_state=42
    )

    # 3. Train Model
    print("[3/5] Training Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # 4. Evaluate Model
    print("[4/5] Evaluating model performance...")
    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)
    
    print(f"\nModel Accuracy: {accuracy * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, predictions, target_names=['Normal', 'Fall']))

    # 5. Save Model
    print("[5/5] Exporting trained model to ares_fall_detector.pkl...")
    joblib.dump(model, 'ares_fall_detector.pkl')
    print("Done! Ready for mobile integration.")

if __name__ == "__main__":
    main()
