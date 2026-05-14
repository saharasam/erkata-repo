import 'dev_file.dart';

class ProjectData {
  final String name;
  final List<DevFile> files;
  final DateTime lastSync;

  ProjectData({
    required this.name,
    required this.files,
    required this.lastSync,
  });

  Map<String, dynamic> toJson() => {
    'name': name,
    'files': files.map((f) => f.toJson()).toList(),
    'lastSync': lastSync.toIso8601String(),
  };

  factory ProjectData.fromJson(Map<String, dynamic> json) => ProjectData(
    name: json['name'],
    files: (json['files'] as List).map((f) => DevFile.fromJson(f)).toList(),
    lastSync: DateTime.parse(json['lastSync']),
  );
}

class ServerConfig {
  final String ip;
  final int port;

  ServerConfig({required this.ip, required this.port});

  Map<String, dynamic> toJson() => {'ip': ip, 'port': port};
  factory ServerConfig.fromJson(Map<String, dynamic> json) =>
      ServerConfig(ip: json['ip'], port: json['port']);

  @override
  String toString() => "$ip:$port";
}
