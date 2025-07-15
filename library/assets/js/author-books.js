  document.addEventListener('DOMContentLoaded', async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authorId = urlParams.get('authorId');
      const container = document.getElementById('booksContainer');

      if (authorId) {
        try {
          const response = await fetch(`https://projectlibraryapi.runasp.net/api/Book/by-author/${authorId}`);
          
          if (!response.ok) {
            throw new Error('فشل في جلب البيانات: ' + response.status);
          }
          
          const responseData = await response.json();

          if (responseData && responseData.$values && responseData.$values.length > 0) {
            container.innerHTML = ''; // مسح أي محتوى موجود
            
            responseData.$values.forEach(book => {
              const bookLink = document.createElement('a');
              bookLink.href = `book-details.html?id=${book.bookId}`;
              bookLink.className = 'book-card';

              let bookImageUrl = book.bookImage
                ? (book.bookImage.startsWith('/') 
                    ? 'http://localhost:5013' + book.bookImage 
                    : book.bookImage)
                : 'https://via.placeholder.com/300x450?text=غلاف+الكتاب';

              const bookTitle = book.title || 'عنوان غير متاح';
              const avg = Math.round(book.averageRating || 0);

              bookLink.innerHTML = `
                <img src="${bookImageUrl}" alt="${bookTitle}" class="book-img">
                <div class="book-info">
                  <h3>${bookTitle}</h3>
                  <div class="book-rating">
                    <span class="stars">
                      ${'★'.repeat(avg)}${'☆'.repeat(5 - avg)}
                    </span>
                  </div>
                </div>
              `;
              
              container.appendChild(bookLink);
            });
          } else {
            container.innerHTML = '<p>لا توجد كتب لهذا المؤلف.</p>';
          }
        } catch (error) {
          console.error('حدث خطأ:', error);
          container.innerHTML = '<p style="color: red;">حدث خطأ أثناء تحميل الكتب. يرجى المحاولة لاحقاً.</p>';
        }
      } else {
        container.innerHTML = '<p>لم يتم تحديد مؤلف.</p>';
      }
    });