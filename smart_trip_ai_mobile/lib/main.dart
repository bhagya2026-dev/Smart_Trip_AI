import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/trip_provider.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => TripProvider()),
      ],
      child: const SmartTripApp(),
    ),
  );
}

class SmartTripApp extends StatelessWidget {
  const SmartTripApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Smart Trip AI',
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0B1117),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF3B82F6),
          secondary: Color(0xFF10B981),
          surface: Color(0xFF16202A),
        ),
        fontFamily: 'Inter',
        useMaterial3: true,
      ),
      home: const DummyHomeView(),
    );
  }
}

class DummyHomeView extends StatelessWidget {
  const DummyHomeView({super.key});

  @override
  Widget build(BuildContext context) {
    final tripProvider = context.watch<TripProvider>();
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Smart Trip AI'),
        backgroundColor: const Color(0xFF16202A),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Driving State: \${tripProvider.drivingState.name}'),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                if (tripProvider.isSimulating) {
                  tripProvider.stopSimulation();
                } else {
                  tripProvider.startSimulation();
                }
              },
              child: Text(tripProvider.isSimulating ? 'Stop Simulation' : 'Start Simulation'),
            ),
          ],
        ),
      ),
    );
  }
}
