"""
Machine Learning module for fare prediction.
Uses RandomForestRegressor to predict commute costs.
"""
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import joblib
from pathlib import Path
import logging
from typing import Dict, List, Tuple, Optional
from app.config import FARE_DATASET_PATH

logger = logging.getLogger(__name__)

class FarePredictionModel:
    """ML model for predicting commute fares."""
    
    def __init__(self):
        self.model: Optional[RandomForestRegressor] = None
        self.feature_encoders: Dict[str, LabelEncoder] = {}
        self.feature_names: List[str] = []
        self.is_trained = False
        self.model_path = Path(__file__).parent / "fare_model.pkl"
        self.encoder_path = Path(__file__).parent / "encoders.pkl"
        
        self._load_or_train_model()
    
    def _load_or_train_model(self):
        """Load existing model or train new one."""
        if self.model_path.exists() and self.encoder_path.exists():
            try:
                self.model = joblib.load(self.model_path)
                self.feature_encoders = joblib.load(self.encoder_path)
                self.feature_names = list(getattr(self.model, "feature_names_in_", []))
                if not self.feature_names:
                    logger.warning("Cached model is missing feature metadata; retraining")
                    self._train_model()
                    return
                self.is_trained = True
                logger.info("Loaded trained model from cache")
                return
            except Exception as e:
                logger.warning(f"Could not load cached model: {e}")
        
        self._train_model()
    
    def _train_model(self):
        """Train the fare prediction model."""
        try:
            # Load dataset
            df = pd.read_csv(FARE_DATASET_PATH)
            logger.info(f"Loaded fare dataset with {len(df)} records")
            
            # Expected features - must exist in CSV
            self.feature_names = [
                "distance_km", "duration_min", "traffic_level", "time_of_day",
                "weather", "vehicle_type", "peak_hour", "transfer_count", "route_type"
            ]
            
            # Filter to only include columns that exist
            available_features = [f for f in self.feature_names if f in df.columns]
            logger.info(f"Using features: {available_features}")
            
            # Prepare data
            X = df[available_features].copy()
            y = df["estimated_fare"].copy() if "estimated_fare" in df.columns else df["fare"].copy()
            
            # Convert all object columns to string first
            for col in X.columns:
                if X[col].dtype == 'object':
                    X[col] = X[col].astype(str)
            
            # Convert peak_hour from yes/no to 1/0 if it exists
            if "peak_hour" in X.columns:
                X["peak_hour"] = (X["peak_hour"].astype(str).str.lower() == "yes").astype(int)
            
            # Identify categorical vs numeric columns
            categorical_cols = X.select_dtypes(include=['object']).columns.tolist()
            numeric_cols = X.select_dtypes(include=[np.number]).columns.tolist()
            
            # Handle missing values in numeric columns
            for col in numeric_cols:
                if X[col].isnull().any():
                    X[col] = X[col].fillna(X[col].median())
            
            # Handle missing values in categorical columns
            for col in categorical_cols:
                if X[col].isnull().any():
                    X[col] = X[col].fillna("unknown")
            
            # Encode categorical features BEFORE converting to float
            for feature in categorical_cols:
                if feature in X.columns:
                    try:
                        encoder = LabelEncoder()
                        # Convert to string and encode
                        encoded_values = encoder.fit_transform(X[feature].astype(str).values)
                        X[feature] = encoded_values
                        self.feature_encoders[feature] = encoder
                    except Exception as e:
                        logger.warning(f"Could not encode {feature}: {e}")
            
            # Final conversion to numeric - verify all columns are numeric
            X = X.astype(float)
            y = y.astype(float)
            
            logger.info(f"Training with shape: X={X.shape}, y={y.shape}")
            
            # Train model
            self.model = RandomForestRegressor(
                n_estimators=100,
                max_depth=15,
                random_state=42,
                n_jobs=-1
            )
            self.model.fit(X, y)
            
            # Update feature names to match actual training features
            self.feature_names = available_features
            
            # Save model
            joblib.dump(self.model, self.model_path)
            joblib.dump(self.feature_encoders, self.encoder_path)
            
            self.is_trained = True
            logger.info("Model trained and saved successfully")
            
        except Exception as e:
            logger.error(f"Error training model: {e}")
            # Don't raise - let the heuristic work instead
            self.is_trained = False
    
    def predict(self, features: Dict[str, any]) -> float:
        """Predict fare for given features."""
        if not self.is_trained or self.model is None:
            # Return a simple heuristic estimate
            return self._heuristic_estimate(features)
        
        try:
            # Create feature array
            feature_vector = []
            for feature_name in self.feature_names:
                value = features.get(feature_name, 0)
                
                # Convert peak_hour from bool/yes/no to 1/0
                if feature_name == "peak_hour":
                    value = self._to_binary(value)
                
                # Encode categorical features
                if feature_name in self.feature_encoders:
                    try:
                        encoded = self.feature_encoders[feature_name].transform([str(value)])
                        value = encoded[0]
                    except Exception:
                        # If value not in training set, use default encoding
                        value = 0
                
                feature_vector.append(float(value))
            
            # Predict with matching feature names to keep sklearn validation happy.
            prediction_input = pd.DataFrame([feature_vector], columns=self.feature_names)
            prediction = self.model.predict(prediction_input)[0]
            
            # Ensure non-negative fare
            return max(10, float(prediction))  # Minimum fare of ₹10
        
        except Exception as e:
            logger.warning(f"Error in prediction: {e}")
            return self._heuristic_estimate(features)
    
    def predict_batch(self, features_list: List[Dict]) -> List[float]:
        """Predict fares for multiple records."""
        return [self.predict(features) for features in features_list]
    
    def _heuristic_estimate(self, features: Dict) -> float:
        """Fallback heuristic estimation when model is unavailable."""
        distance = features.get("distance_km", 0)
        duration = features.get("duration_min", 0)
        traffic = features.get("traffic_level", 0)
        peak = features.get("peak_hour", 0)
        transfers = features.get("transfer_count", 0)
        
        # Base fare
        fare = 10.0
        
        # Distance-based fare (₹0.5 per km)
        fare += distance * 0.5
        
        # Duration adjustment (₹1 per 10 minutes)
        fare += (duration / 10) * 1.0
        
        # Traffic surcharge
        if traffic > 0:
            fare *= (1 + traffic * 0.1)
        
        # Peak hour surcharge
        if self._to_binary(peak):
            fare *= 1.2
        
        # Transfer cost (₹5 per transfer)
        fare += transfers * 5
        
        return max(0, fare)

    def _to_binary(self, value: any) -> int:
        """Normalize common boolean representations to 1 or 0."""
        if isinstance(value, bool):
            return int(value)
        if isinstance(value, (int, float)):
            return int(value > 0)
        return 1 if str(value).strip().lower() in {"yes", "true", "1", "y"} else 0
    
    def explain_prediction(self, features: Dict) -> Dict:
        """Explain feature importance for a prediction."""
        if not self.is_trained or self.model is None:
            return {}
        
        try:
            feature_vector = []
            for feature_name in self.feature_names:
                value = features.get(feature_name, 0)
                if feature_name in self.feature_encoders:
                    value = self.feature_encoders[feature_name].transform([str(value)])[0]
                feature_vector.append(value)
            
            importances = self.model.feature_importances_
            
            explanation = {}
            for feature_name, importance in zip(self.feature_names, importances):
                explanation[feature_name] = float(importance)
            
            return explanation
        except:
            return {}

# Global model instance
_fare_model: Optional[FarePredictionModel] = None

def get_fare_model() -> FarePredictionModel:
    """Get or create global fare prediction model."""
    global _fare_model
    if _fare_model is None:
        _fare_model = FarePredictionModel()
    return _fare_model
