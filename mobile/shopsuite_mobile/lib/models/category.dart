class Category {
  const Category({
    required this.id,
    this.parentId,
    required this.name,
    required this.slug,
    this.description,
  });

  final String id;
  final String? parentId;
  final String name;
  final String slug;
  final String? description;

  factory Category.fromJson(Map<String, dynamic> json) => Category(
        id: json['id'] as String,
        parentId: json['parentId'] as String?,
        name: json['name'] as String,
        slug: json['slug'] as String,
        description: json['description'] as String?,
      );
}
