import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/trip_provider.dart';
import 'providers/theme_provider.dart';
import 'presentation/views/app_scaffold.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => TripProvider()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
      ],
      child: const SmartTripApp(),
    ),
  );
}

class SmartTripApp extends StatelessWidget {
  const SmartTripApp({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = context.watch<ThemeProvider>();
    
    return MaterialApp(
      title: 'Smart Trip AI',
      debugShowCheckedModeBanner: false,
      themeMode: themeProvider.themeMode,
      theme: ThemeData(
        brightness: Brightness.light,
        scaffoldBackgroundColor: Colors.white,
        colorScheme: const ColorScheme.light(
          primary: Colors.black,
          surface: Colors.white,
          onSurface: Colors.black,
        ),
        dividerColor: const Color(0xFFDDDDDD),
        fontFamily: 'Inter',
        useMaterial3: true,
      ),
      darkTheme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: Colors.black,
        colorScheme: const ColorScheme.dark(
          primary: Colors.white,
          surface: Colors.black,
          onSurface: Colors.white,
        ),
        dividerColor: const Color(0xFF333333),
        fontFamily: 'Inter',
        useMaterial3: true,
      ),
      home: const AppScaffold(),
    );
  }
}
