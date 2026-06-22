import { useEffect, useState } from 'react';
import { api, type ArticleDto } from '../../services/api';
import { asset } from '../../shared/lib/assets';

export function ArticlesView() {
  const [articles, setArticles] = useState<ArticleDto[]>([]);
  useEffect(() => { api.getArticles().then(setArticles); }, []);
  return (
    <section className="page">
      <div className="section-card">
        <div className="section-heading">
          <h2>مجله فروشگاه</h2>
          <span>اخبار و راهنمای خرید</span>
        </div>
        <div className="article-grid">
          {articles.map((article, index) => (
            <article className="article-card" key={article.id}>
              <img src={article.coverImageUrl?.startsWith('http') ? article.coverImageUrl : asset(`img/post-thumbnail/${(index % 5) + 1}.png`)} alt={article.title} />
              <div>
                <h3>{article.title}</h3>
                <p>{article.summary}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
