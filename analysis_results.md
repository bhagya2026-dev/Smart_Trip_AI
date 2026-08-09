
# Smart Trip AI - Project Analysis

## Overview
Smart Trip AI is a comprehensive web application designed to simulate, track, and analyze vehicle and walking trips using AI-powered features. It gamifies the driving experience by evaluating safety and eco-friendliness, provides live navigation with HUD (Heads-Up Display) elements, detects pit stops, and calculates fuel efficiency.

## Technology Stack
- **Core Framework:** React 19, React DOM
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4, PostCSS
- **Maps & Geolocation:** Leaflet, React-Leaflet
- **Data Visualization:** Recharts
- **Database (In-Browser/Mocking):** Alasql
- **Icons:** Lucide React
- **Animations:** Canvas-Confetti
- **Linting:** Oxlint

## Project Architecture (Domain-Driven Design)
The project is structured into four main layers inside the `src` directory, closely resembling a Domain-Driven Design (DDD) approach:

### 1. `domain`
Contains the core business logic, state management, and analytics.
- **`analytics/`**: Includes `SafetyEcoScorer` which evaluates driving behavior (hard accelerations, hard brakes, smooth driving).
- **`models/`**: TypeScript interfaces and types (`TelemetryPoint`, `Trip`, `VehicleConfig`, `DrivingState`, `PitStop`).
- **`stateMachine/`**: Contains `DrivingStateProcessor` which manages transitions between different vehicle states (e.g., IDLE, MOVING, PARKING).

### 2. `data`
Manages data access, persistence, and external data sources (sensors).
- **`database/`**: Implements `LocalTripDatabase` using Alasql to store trip history locally in the browser.
- **`mock/`**: Contains mock data for simulations.
- **`sensors/`**: Includes `DeviceSensorProvider` and `TelemetrySimulator` to either read real device sensor data (GPS, Accelerometer, Gyroscope) or simulate them.

### 3. `services`
Encapsulates complex external operations and algorithms.
- **`aiAssistant.ts`**: Handles AI chat interactions during the trip.
- **`fuelEngine.ts`**: Calculates fuel consumption based on telemetry, vehicle config, and idle times.
- **`geocodingService.ts`**: Converts coordinates to addresses and vice versa.
- **`pedometerEngine.ts`**: Handles step counting and analytics for walking mode.
- **`pitStopDetector.ts`**: Analyzes telemetry to detect when and where a vehicle has made a pit stop.
- **`roadRouting.ts` & `sriLankaRoadNetwork.ts`**: Custom routing logic and map data specific to Sri Lanka.

### 4. `presentation`
Contains all the UI components, views, and styles.
- **`views/`**: The main pages of the application:
  - `HomeView`: The starting point, configuring the trip.
  - `DashboardView`: The main Live HUD during a trip, displaying map, telemetry, and metrics.
  - `TripHistoryView`: Lists past trips with details.
  - `FuelAnalyticsView`: Detailed breakdown of fuel consumption and costs.
  - `ProfileView`: User settings and vehicle configurations.
- **`components/`**: Reusable UI elements, such as:
  - `InteractiveRouteMap`, `LiveNavigationPanel`, `SpeedometerGForceHUD`, `RadialScoreGauge`, `PitStopTimeline`, `DestinationSearchBar`, `SmartTripAIChat`.

## Features and Mechanisms
- **Live Telemetry Simulation:** The app can simulate live driving, generating GPS coordinates, speed, acceleration, and G-forces.
- **Scoring System:** Drives are rated dynamically with a Safety Score and Eco Score based on real-time physics data (G-Force, hard braking).
- **Fuel Tracking & Friction:** Calculates live fuel usage and provides a "Fuel Friction Calculator" for cost analysis.
- **Pit Stop Detection:** Automatically registers stops, classifying them based on duration and location.
- **Smart Assistant:** Integrated AI chat to provide trip insights or assist the user.
- **Multi-Modal:** Supports both `VEHICLE` and `WALKING` modes, switching between engine telemetry and pedometer tracking.

## Completion Status
Based on the analysis, the project appears to be quite comprehensive and fully functional as a frontend simulation application. All core domain models, state machines, sensor simulators, and complex presentation views (HUDs, Maps, Analytics) are implemented.
