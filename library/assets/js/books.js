document.addEventListener('DOMContentLoaded', () => {
  const categoryList = document.querySelector('.categories-list');
  const booksGrid = document.getElementById('booksGrid');
  const loadingIndicator = document.getElementById('loadingIndicator');

  const categoriesApiUrl = 'https://projectlibraryapi.runasp.net/api/Admin/all-categories';
  const booksApiUrl = 'https://projectlibraryapi.runasp.net/api/Book/allBooks';
  const booksByCategoryApiUrl = 'https://projectlibraryapi.runasp.net/api/Book/by-category/';

  // عرض مؤشر التحميل
  loadingIndicator.style.display = 'flex';
  booksGrid.style.display = 'none';

  // دالة لعرض الكتب
function displayBooks(books) {
  booksGrid.innerHTML = ''; 
  if (books.length === 0) {
    booksGrid.innerHTML = '<p>لا توجد كتب حالياً.</p>';
    return;
  }

  books.forEach(book => {
    const bookLink = document.createElement('a');
    bookLink.href = `book-details.html?id=${book.bookId}`;
    bookLink.className = 'book-card';

    const img = document.createElement('img');
    img.src = `https://projectlibraryapi.runasp.net/${book.bookImage}`;
    img.alt = book.title;

    const bookInfo = document.createElement('div');
    bookInfo.className = 'book-info';

    const title = document.createElement('h3');
    title.textContent = book.title;

   
    const rating = document.createElement('div');
    const avg = Math.round(book.averageRating || 0);
    rating.className = 'book-rating';
    rating.innerHTML = `
      <span class="stars">
        ${'★'.repeat(avg)}${'☆'.repeat(5 - avg)}
      </span>
    `;

    bookInfo.appendChild(title);
    bookInfo.appendChild(rating); 
    bookLink.appendChild(img);
    bookLink.appendChild(bookInfo);
    booksGrid.appendChild(bookLink);
  });
}



  // دالة لتحميل كل الكتب
  function loadAllBooks() {
    loadingIndicator.style.display = 'flex';
    booksGrid.style.display = 'none';

    fetch(booksApiUrl)
      .then(response => response.json())
      .then(data => {

        
        const books = data.$values || [];
        loadingIndicator.style.display = 'none';
        booksGrid.style.display = 'grid';
        displayBooks(books);
      })
      .catch(error => {
        console.error('حدث خطأ أثناء تحميل الكتب:', error);
        loadingIndicator.style.display = 'none';
        booksGrid.style.display = 'block';
        booksGrid.innerHTML = '<p>حدث خطأ أثناء تحميل الكتب. حاول لاحقًا.</p>';
      });
  }

  // دالة لتحميل الكتب حسب التصنيف
  function loadBooksByCategory(categoryId) {
    loadingIndicator.style.display = 'flex';
    booksGrid.style.display = 'none';

    fetch(`${booksByCategoryApiUrl}${categoryId}`)
      .then(response => response.json())
      .then(data => {
        const books = data.$values || [];
        loadingIndicator.style.display = 'none';
        booksGrid.style.display = 'grid';
        displayBooks(books);
      })
      .catch(error => {
        console.error('حدث خطأ أثناء تحميل الكتب:', error);
        loadingIndicator.style.display = 'none';
        booksGrid.style.display = 'block';
        booksGrid.innerHTML = '<p>حدث خطأ أثناء تحميل الكتب. حاول لاحقًا.</p>';
      });
  }

  // تحميل التصنيفات وإضافة "الكل"
  fetch(categoriesApiUrl)
    .then(response => response.json())
    .then(data => {
      const categories = data.$values || [];

      // أضف عنصر "الكل"
      const allItem = document.createElement('li');
      allItem.classList.add('category-item');

      const allLink = document.createElement('a');
      allLink.href = '#';
      allLink.textContent = 'الكل';
      allLink.addEventListener('click', (e) => {
        e.preventDefault();
        loadAllBooks();
      });

      allItem.appendChild(allLink);
      categoryList.appendChild(allItem);

      // أضف باقي التصنيفات
      categories.forEach(category => {
        const categoryItem = document.createElement('li');
        categoryItem.classList.add('category-item');

        const categoryLink = document.createElement('a');
        categoryLink.href = '#';
        categoryLink.textContent = category.categoryName;
        categoryLink.addEventListener('click', (e) => {
          e.preventDefault();
          loadBooksByCategory(category.categoryId);
        });

        categoryItem.appendChild(categoryLink);
        categoryList.appendChild(categoryItem);
      });

      // تحميل كل الكتب افتراضياً عند أول فتح للصفحة
      loadAllBooks();
    })
    .catch(error => {
      console.error('حدث خطأ أثناء تحميل التصنيفات:', error);
      categoryList.innerHTML = '<p>حدث خطأ أثناء تحميل التصنيفات. حاول لاحقًا.</p>';
    });
});
