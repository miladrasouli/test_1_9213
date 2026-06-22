class AppConfig {
  // Android emulator maps host localhost to 10.0.2.2.
  static const String androidEmulatorBaseUrl = 'http://10.0.2.2:5010/api';
  static const String iosSimulatorBaseUrl = 'http://localhost:5010/api';
  static const String windowsBaseUrl = 'http://localhost:5010/api';

  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: androidEmulatorBaseUrl,
  );

  static const String sampleUserId = 'cccccccc-cccc-cccc-cccc-ccccccccccc2';
}
