class DevFile {
  final String name;
  final String path;
  final String content;

  DevFile({required this.name, required this.path, required this.content});

  Map<String, dynamic> toJson() => {
    'name': name,
    'path': path,
    'content': content,
  };

  factory DevFile.fromJson(Map<String, dynamic> json) =>
      DevFile(name: json['name'], path: json['path'], content: json['content']);
}
