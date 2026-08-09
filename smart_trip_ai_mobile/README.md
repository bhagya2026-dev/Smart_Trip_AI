# SmartTrip AI - Driver Telematics Mobile App

SmartTrip AI is a modern, high-contrast Flutter application focused on live driving telematics, safety scores, eco-efficiency, and simulated GPS telemetry. 

## Features
- **Live Interactive HUD:** Tracks your route with a live interactive FlutterMap powered by OpenStreetMap, showing distance covered, ETA, and pit stops.
- **Dynamic Speedometer & G-Force Meter:** Real-time feedback on your driving physics.
- **Instagram-Style Profile:** Sleek 3-column grid showcasing your past trips with detailed stats (Distance, Speed, Duration).
- **Conversational AI Assistant Placeholder:** Query driving metrics via natural language.
- **Global Light/Dark Theme:** Switch seamlessly between sleek dark mode and bright light mode.

## Setup Instructions

### Prerequisites
1. **Flutter SDK:** You must have Flutter installed on your PC. 
   - [Download Flutter](https://docs.flutter.dev/get-started/install)
   - Ensure the `flutter` command is available in your system path.
2. **Dart SDK:** Included with Flutter.
3. **Google Chrome:** Required to run the application in the web browser.

### How to Run

1. **Clone the Repository**
   ```bash
   git clone <your-repository-url>
   cd smart_trip_ai_mobile
   ```

2. **Install Dependencies**
   Run the following command to download all necessary packages:
   ```bash
   flutter pub get
   ```

3. **Run the Application on Web**
   Start a local web server to view the app in your browser:
   ```bash
   flutter run -d web-server --web-port 8080
   ```

4. **View the App**
   Open Google Chrome (or your preferred browser) and navigate to:
   ```
   http://localhost:8080
   ```

## Development Notes
- This app uses `provider` for state management (e.g., simulated driving state, theme toggling).
- The map relies on `flutter_map` and `latlong2`. No Google Maps API key is required as it uses free OpenStreetMap tiles!
- To simulate a trip, go to the Home screen or Live HUD, and click **START TRIP NOW**. The app will animate the speedometer and adjust distances in real-time.
