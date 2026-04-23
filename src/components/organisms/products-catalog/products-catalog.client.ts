import { loadProductsList, type ProductSort } from '@/services/products';
import type { Product } from '@/types';
import { getProductThumbnail } from '@/repositories/catalog';

export interface ProductsCatalogInitOptions {
  base: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): (...args: Parameters<T>) => void {
  let t: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

/** Wires search, filters, pagination, and grid for the products catalog. */
export function initProductsCatalog(options: ProductsCatalogInitOptions): void {
  const { base } = options;

  const productsGrid = document.getElementById('productsGrid');
  const noResults = document.getElementById('noResults');
  const resultsCount = document.getElementById('resultsCount');
  const pagination = document.getElementById('pagination');
  const searchInput = document.getElementById('searchInput') as HTMLInputElement | null;
  const sortFilter = document.getElementById('sortFilter') as HTMLSelectElement | null;
  const prevPage = document.getElementById('prevPage') as HTMLButtonElement | null;
  const nextPage = document.getElementById('nextPage') as HTMLButtonElement | null;
  const pageNumbers = document.getElementById('pageNumbers');
  const loadError = document.getElementById('productsLoadError');

  if (!productsGrid || !noResults || !resultsCount || !pagination || !pageNumbers) return;

  const grid = productsGrid;
  const noResEl = noResults;
  const resultsEl = resultsCount;
  const pagEl = pagination;
  const pageNumsEl = pageNumbers;

  let currentCategory = '';
  let currentSubcategory = '';
  let currentPage = 1;
  const itemsPerPage = 9;
  let sortValue: ProductSort = '';
  let lastTotal = 0;

  const setLoading = (loading: boolean) => {
    grid.setAttribute('aria-busy', loading ? 'true' : 'false');
    grid.classList.toggle('opacity-60', loading);
    grid.classList.toggle('pointer-events-none', loading);
  };

  const showError = (message: string | null) => {
    if (!loadError) return;
    if (!message) {
      loadError.classList.add('hidden');
      loadError.textContent = '';
      return;
    }
    loadError.textContent = message;
    loadError.classList.remove('hidden');
  };

  function renderCards(products: Product[]) {
    grid.innerHTML = products
      .map((product) => {
        const thumb = getProductThumbnail(product);
        const tags = [...product.tag_visible, ...product.tag_hidden].join(' ').toLowerCase();
        const hotPill = (product.top_item ?? product.hot_item)
          ? '<span class="pointer-events-none absolute right-1.5 top-1.5 z-10 inline-flex items-center rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-semibold leading-none text-white shadow-sm">Top seller</span>'
          : '';
        const routeKey = product.item_code || product.folder_name;
        return `<a href="${base}/products/${encodeURIComponent(routeKey)}" class="group block origin-center rounded-md transition-transform duration-200 ease-out hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
  <div class="product-card"
       data-name="${escapeHtml(product.item_name.toLowerCase())}"
       data-code="${escapeHtml((product.item_code || '').toLowerCase())}"
       data-category="${escapeHtml(product.category_main)}"
       data-subcategory="${escapeHtml(product.category_sub)}"
       data-tags="${escapeHtml(tags)}"
       data-description="${escapeHtml(product.item_description.toLowerCase())}"
       data-hot-item="${(product.top_item ?? product.hot_item) ? 'true' : 'false'}">
    <div class="relative aspect-square w-full overflow-hidden rounded-md border border-border bg-muted">
      ${hotPill}
      <img src="${escapeHtml(thumb)}" alt="${escapeHtml(product.item_name)}" class="h-full w-full object-cover transition-opacity duration-200 group-hover:opacity-90" loading="lazy" />
    </div>
    <p class="mt-2 px-0.5 text-center text-[11px] font-normal leading-snug text-muted-foreground line-clamp-3 group-hover:text-foreground transition-colors">${escapeHtml(product.item_name)}</p>
  </div>
</a>`;
      })
      .join('');
  }

  function updatePaginationControls(totalPages: number) {
    if (!prevPage || !nextPage) return;

    prevPage.disabled = currentPage === 1;
    nextPage.disabled = currentPage === totalPages;

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    let paginationHTML = '';

    if (startPage > 1) {
      paginationHTML += `<button type="button" class="px-3 py-2 text-sm border rounded-md hover:bg-gray-50" data-go-page="1">1</button>`;
      if (startPage > 2) {
        paginationHTML += `<span class="px-2 py-2 text-sm">...</span>`;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      const isActive = i === currentPage;
      paginationHTML += `<button type="button" class="px-3 py-2 text-sm border rounded-md ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-50'}" data-go-page="${i}">${i}</button>`;
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationHTML += `<span class="px-2 py-2 text-sm">...</span>`;
      }
      paginationHTML += `<button type="button" class="px-3 py-2 text-sm border rounded-md hover:bg-gray-50" data-go-page="${totalPages}">${totalPages}</button>`;
    }

    pageNumsEl.innerHTML = paginationHTML;
  }

  async function refresh() {
    showError(null);
    setLoading(true);
    try {
      const q = searchInput?.value?.trim() ?? '';
      const result = await loadProductsList({
        q,
        category: currentCategory,
        subcategory: currentSubcategory,
        sort: sortValue,
        page: currentPage,
        pageSize: itemsPerPage,
      });

      renderCards(result.items);
      currentPage = result.page;
      const total = result.total;
      lastTotal = total;
      const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
      syncUrlState();

      if (total === 0) {
        noResEl.classList.remove('hidden');
        pagEl.classList.add('hidden');
        resultsEl.textContent = 'No products found';
        return;
      }

      noResEl.classList.add('hidden');

      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = Math.min(startIndex + result.items.length, total);

      if (totalPages > 1) {
        resultsEl.textContent = `Showing ${startIndex + 1}-${endIndex} of ${total} products (Page ${currentPage} of ${totalPages})`;
        pagEl.classList.remove('hidden');
        updatePaginationControls(totalPages);
      } else {
        resultsEl.textContent = `Showing ${total} product${total === 1 ? '' : 's'}`;
        pagEl.classList.add('hidden');
      }
    } catch (e) {
      console.error(e);
      showError('Could not load products. Please try again.');
      grid.innerHTML = '';
    } finally {
      setLoading(false);
    }
  }

  const debouncedRefresh = debounce(() => {
    currentPage = 1;
    void refresh();
  }, 300);

  function syncUrlState() {
    const url = new URL(window.location.href);
    const setOrDelete = (key: string, value: string) => {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    };
    setOrDelete('q', searchInput?.value?.trim() ?? '');
    setOrDelete('category', currentCategory);
    setOrDelete('subcategory', currentSubcategory);
    setOrDelete('sort', sortValue);
    setOrDelete('page', currentPage > 1 ? String(currentPage) : '');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }

  function selectCategory(categoryId: string, subcategoryId = '') {
    if (categoryId === '' || categoryId === 'hot-products') {
      currentCategory = categoryId;
      currentSubcategory = '';

      document.querySelectorAll('.category-item').forEach((item) => {
        const el = item as HTMLElement;
        const itemCategory = el.getAttribute('data-category') ?? '';
        if (itemCategory === categoryId && (categoryId === '' || categoryId === 'hot-products')) {
          el.classList.add('bg-primary/20', 'text-primary');
          el.classList.remove('hover:bg-gray-100');
        } else {
          el.classList.remove('bg-primary/20', 'text-primary');
          el.classList.add('hover:bg-gray-100');
        }
      });

      document.querySelectorAll('.subcategory-item').forEach((item) => {
        const el = item as HTMLElement;
        el.classList.remove('bg-primary/20', 'text-primary');
        el.classList.add('hover:bg-gray-50', 'text-gray-500');
      });

      document.querySelectorAll('.subcategory-list').forEach((list) => {
        list.classList.add('hidden');
        const parentCategory = list.getAttribute('data-parent');
        const arrow = document.querySelector(`[data-category="${parentCategory}"] .category-arrow`);
        if (arrow) arrow.classList.remove('rotate-90');
      });

      currentPage = 1;
      void refresh();
      return;
    }

    if (!subcategoryId) {
      document.querySelectorAll('.category-item').forEach((item) => {
        const el = item as HTMLElement;
        el.classList.remove('bg-primary/20', 'text-primary');
        el.classList.add('hover:bg-gray-100');
      });

      document.querySelectorAll('.subcategory-list').forEach((list) => {
        const parentCategory = list.getAttribute('data-parent');
        const arrow = document.querySelector(`[data-category="${parentCategory}"] .category-arrow`);

        if (parentCategory === categoryId) {
          const isHidden = list.classList.contains('hidden');
          if (isHidden) {
            list.classList.remove('hidden');
            if (arrow) arrow.classList.add('rotate-90');
          } else {
            list.classList.add('hidden');
            if (arrow) arrow.classList.remove('rotate-90');
          }
        } else {
          list.classList.add('hidden');
          if (arrow) arrow.classList.remove('rotate-90');
        }
      });
      return;
    }

    currentCategory = categoryId;
    currentSubcategory = subcategoryId;

    document.querySelectorAll('.category-item').forEach((item) => {
      const el = item as HTMLElement;
      el.classList.remove('bg-primary/20', 'text-primary');
      el.classList.add('hover:bg-gray-100');
    });

    document.querySelectorAll('.subcategory-item').forEach((item) => {
      const el = item as HTMLElement;
      const itemCategory = el.getAttribute('data-category') ?? '';
      const itemSubcategory = el.getAttribute('data-subcategory') ?? '';
      if (itemCategory === categoryId && itemSubcategory === subcategoryId) {
        el.classList.add('bg-primary/20', 'text-primary');
        el.classList.remove('hover:bg-gray-50', 'text-gray-500');
      } else {
        el.classList.remove('bg-primary/20', 'text-primary');
        el.classList.add('hover:bg-gray-50', 'text-gray-500');
      }
    });

    document.querySelectorAll('.subcategory-list').forEach((list) => {
      const parentCategory = list.getAttribute('data-parent');
      const arrow = document.querySelector(`[data-category="${parentCategory}"] .category-arrow`);

      if (parentCategory === categoryId) {
        list.classList.remove('hidden');
        if (arrow) arrow.classList.add('rotate-90');
      } else {
        list.classList.add('hidden');
        if (arrow) arrow.classList.remove('rotate-90');
      }
    });

    currentPage = 1;
    void refresh();
  }

  function changePage(direction: number) {
    const totalPages = Math.max(1, Math.ceil(lastTotal / itemsPerPage));
    const newPage = currentPage + direction;
    if (newPage >= 1 && newPage <= totalPages) {
      currentPage = newPage;
      void refresh();
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function goToPage(pageNumber: number) {
    const totalPages = Math.max(1, Math.ceil(lastTotal / itemsPerPage));
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      currentPage = pageNumber;
      void refresh();
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function sortProducts() {
    sortValue = (sortFilter?.value ?? '') as ProductSort;
    currentPage = 1;
    void refresh();
  }

  function clearFilters() {
    if (searchInput) searchInput.value = '';
    if (sortFilter) sortFilter.value = '';
    sortValue = '';
    currentPage = 1;
    selectCategory('', '');
  }

  function toggleMobileFilters() {
    const sidebar = document.getElementById('filterSidebar');
    const toggleIcon = document.getElementById('filterToggleIcon');
    if (!sidebar || !toggleIcon) return;

    if (sidebar.classList.contains('hidden')) {
      sidebar.classList.remove('hidden');
      sidebar.classList.add('block');
      toggleIcon.classList.add('rotate-180');
    } else {
      sidebar.classList.add('hidden');
      sidebar.classList.remove('block');
      toggleIcon.classList.remove('rotate-180');
    }
  }

  searchInput?.addEventListener('input', () => {
    debouncedRefresh();
  });

  sortFilter?.addEventListener('change', () => sortProducts());

  prevPage?.addEventListener('click', () => changePage(-1));
  nextPage?.addEventListener('click', () => changePage(1));

  pageNumsEl.addEventListener('click', (e) => {
    const t = (e.target as HTMLElement).closest('[data-go-page]');
    if (!t) return;
    const p = parseInt(t.getAttribute('data-go-page') || '1', 10);
    goToPage(p);
  });

  document.querySelectorAll('.category-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-category') ?? '';
      const sub = btn.getAttribute('data-subcategory') ?? '';
      selectCategory(cat, sub);
    });
  });

  document.querySelectorAll('.subcategory-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-category') ?? '';
      const sub = btn.getAttribute('data-subcategory') ?? '';
      selectCategory(cat, sub);
    });
  });

  document.getElementById('mobileFilterToggle')?.addEventListener('click', toggleMobileFilters);

  document.querySelectorAll('[data-clear-filters]').forEach((el) => {
    el.addEventListener('click', () => clearFilters());
  });

  const params = new URLSearchParams(window.location.search);
  const urlQ = params.get('q')?.trim() ?? '';
  const urlSort = (params.get('sort')?.trim() ?? '') as ProductSort;
  const urlPage = Number(params.get('page') ?? '1');
  const urlCategory = params.get('category')?.trim() ?? '';
  const urlSubcategory = params.get('subcategory')?.trim() ?? '';
  if (searchInput && urlQ) searchInput.value = urlQ;
  if (sortFilter && urlSort) sortFilter.value = urlSort;
  sortValue = urlSort;
  currentPage = Number.isFinite(urlPage) && urlPage > 0 ? Math.floor(urlPage) : 1;
  if (urlCategory !== '' && urlSubcategory !== '') {
    selectCategory(urlCategory, urlSubcategory);
  } else if (urlCategory !== '') {
    selectCategory(urlCategory, '');
  } else {
    selectCategory('', '');
  }
}
