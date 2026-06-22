class Article {
  const Article({
    required this.id,
    required this.title,
    required this.slug,
    required this.summary,
    required this.body,
    required this.coverImageUrl,
    required this.publishedAt,
  });

  final String id;
  final String title;
  final String slug;
  final String summary;
  final String body;
  final String coverImageUrl;
  final DateTime publishedAt;

  factory Article.fromJson(Map<String, dynamic> json) => Article(
        id: json['id'] as String,
        title: json['title'] as String,
        slug: json['slug'] as String,
        summary: json['summary'] as String,
        body: json['body'] as String,
        coverImageUrl: json['coverImageUrl'] as String,
        publishedAt: DateTime.parse(json['publishedAt'] as String),
      );
}
