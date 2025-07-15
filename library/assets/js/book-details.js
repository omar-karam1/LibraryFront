document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get('id');

  const bookDetailsDiv = document.getElementById('book-details');
  const bookActionsDiv = document.getElementById('book-actions');
  const reviewsListDiv = document.getElementById('reviews-list');
  const similarBooksGrid = document.getElementById('similar-books-grid'); // قسم الكتب المشابهة

  if (!bookId) {
    bookDetailsDiv.innerHTML = "<p class='error-message'>لم يتم العثور على معرف الكتاب.</p>";
    return;
  }

  // جلب تفاصيل الكتاب
  fetch(`https://projectlibraryapi.runasp.net/api/Book/details/${bookId}`)
    .then(res => {
      if (!res.ok) throw new Error('فشل في جلب بيانات الكتاب');
      return res.json();
    })
    .then(book => {
      const author = book.authors?.$values?.[0];
      const bookImage = book.bookImage 
        ? `https://projectlibraryapi.runasp.net${book.bookImage}`
        : 'https://via.placeholder.com/300x450?text=غلاف+الكتاب';
      const authorImage = author?.authorImage
        ? `https://projectlibraryapi.runasp.net${author.authorImage}`
        : 'https://via.placeholder.com/150x150?text=صورة+المؤلف';

      bookDetailsDiv.innerHTML = `
        <img src="${bookImage}" alt="${book.title}">
        <div>
          <h2>${book.title || 'عنوان غير متاح'}</h2>
          <div class="rating">${'★'.repeat(Math.round(book.averageRating || 0))} ${book.averageRating ? `(${book.averageRating.toFixed(1)})` : ''}</div>
          <p>${book.bookDescription || 'لا يوجد وصف متاح للكتاب.'}</p>
          ${author ? `
            <div class="author-section">
              <img src="${authorImage}" alt="${author.name}">
              <h3>عن المؤلف: ${author.name || 'غير معروف'}</h3>
              <p>${author.aboutAuthor || 'لا توجد نبذة متاحة عن المؤلف.'}</p>
            </div>
          ` : '<p class="empty-message">لا توجد معلومات عن المؤلف.</p>'}
        </div>
      `;

      bookActionsDiv.innerHTML = `
        <button class="btn" id="readBtn">
          <i class="fas fa-book-open"></i> قراءة
        </button>
        <button class="btn" id="downloadBtn">
          <i class="fas fa-download"></i> تحميل
        </button>
      `;

      document.getElementById('readBtn').addEventListener('click', () => {
        if (book.bookFile) {
          window.open(`http://localhost:5013${book.bookFile}`, '_blank');
        } else {
          alert('الكتاب غير متاح للقراءة حالياً');
        }
      });

      document.getElementById('downloadBtn').addEventListener('click', () => {
        if (book.bookFile) {
          const a = document.createElement('a');
          a.href = `http://localhost:5013${book.bookFile}`;
          a.download = (book.title || 'كتاب') + '.pdf';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else {
          alert('الكتاب غير متاح للتحميل حالياً');
        }
      });

      // جلب المراجعات
      fetch(`https://projectlibraryapi.runasp.net/api/Book/reviews/${bookId}`)
        .then(res => {
          if (!res.ok) throw new Error('فشل في جلب المراجعات');
          return res.json();
        })
        .then(reviewData => {
          const reviews = reviewData.$values || [];
          if (reviews.length === 0) {
            reviewsListDiv.innerHTML = "<p class='empty-message'>لا توجد مراجعات بعد.</p>";
            return;
          }

          reviewsListDiv.innerHTML = reviews.map(review => `
            <div class="review">
              <strong>${review.userName || 'مستخدم مجهول'}</strong> - 
              <span class="rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
              <p>${review.reviewText || 'لا توجد تفاصيل.'}</p>
              <small>${review.createdDate ? new Date(review.createdDate).toLocaleDateString('ar-EG') : 'تاريخ غير معروف'}</small>
            </div>
          `).join('');
        })
        .catch(err => {
          console.error(err);
          reviewsListDiv.innerHTML = `<p class="error-message">حدث خطأ أثناء تحميل المراجعات: ${err.message}</p>`;
        });

      // جلب الكتب المشابهة بناءً على فئة الكتاب
      fetch(`https://projectlibraryapi.runasp.net/api/Book/by-category/${book.categoryId}`)
        .then(res => {
          if (!res.ok) throw new Error('فشل في جلب الكتب المشابهة');
          return res.json();
        })
        .then(data => {
          const books = data.$values || [];
          if (books.length === 0) {
            similarBooksGrid.innerHTML = '<p>لا توجد كتب مشابهة حالياً.</p>';
            return;
          }

       
          similarBooksGrid.innerHTML = ''; 
          books.forEach(book => {
            const bookLink = document.createElement('a');
            bookLink.href = `book-details.html?id=${book.bookId}`;
            bookLink.className = 'book-card';

            const img = document.createElement('img');
            img.src = `https://projectlibraryapi.runasp.net/${book.bookImage}`;
            img.alt = book.title;

            const bookInfo = document.createElement('div');
            bookInfo.className = 'book-info';

            const title = document.createElement('h4');
            title.textContent = book.title;

            // ⭐ التقييم (نجوم فقط)
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

            similarBooksGrid.appendChild(bookLink);
          });
        })
        .catch(error => {
          console.error('حدث خطأ أثناء تحميل الكتب المشابهة:', error);
          similarBooksGrid.innerHTML = '<p>حدث خطأ أثناء تحميل الكتب المشابهة. حاول لاحقًا.</p>';
        });
    })
    .catch(err => {
      console.error(err);
      bookDetailsDiv.innerHTML = `<p class="error-message">حدث خطأ أثناء تحميل بيانات الكتاب: ${err.message}</p>`;
    });
});
