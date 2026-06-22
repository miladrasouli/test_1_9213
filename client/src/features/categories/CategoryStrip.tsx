import type { CategoryDto } from '../../services/api';
import { useShopStore } from '../../store/shopStore';
import { asset } from '../../shared/lib/assets';

export function CategoryStrip({ categories }: { categories: CategoryDto[] }) {
  const icons = [
    asset('img/category/notebook-computer.png'),
    asset('img/category/hanbok.png'),
    asset('img/category/sofa.png'),
    asset('img/category/school-material.png'),
    asset('img/category/repair-tools.png'),
  ];
  return (
    <section className="category-strip">
      {categories.map((category, index) => (
        <button key={category.id} onClick={() => useShopStore.getState().setFilters({ categoryId: category.id })}>
          <img src={icons[index % icons.length]} alt="" />
          <span>{category.name}</span>
        </button>
      ))}
    </section>
  );
}
