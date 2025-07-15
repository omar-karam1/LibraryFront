document.addEventListener('DOMContentLoaded', function() {

  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function() {
      navLinks.classList.toggle('active');
    });
  }

  

  const booksApiUrl = 'https://projectlibraryapi.runasp.net/api/Book/allBooks';
  const booksGrid = document.getElementById('featured-books-grid');

  fetch(booksApiUrl)
    .then(response => response.json())
    .then(data => {
      const allBooks = data.$values || [];
      
      if (allBooks.length === 0) {
        booksGrid.innerHTML = '<p>لا توجد كتب حالياً.</p>';
        return;
      }

      
      const shuffled = allBooks.sort(() => 0.5 - Math.random());
      const selectedBooks = shuffled.slice(0, 12);

      // عرض الكتب المختارة
      displayBooks(selectedBooks);
    })
    .catch(error => {
      console.error('حدث خطأ أثناء تحميل الكتب:', error);
      booksGrid.innerHTML = '<p>حدث خطأ أثناء تحميل الكتب. حاول لاحقًا.</p>';
    });

  function displayBooks(books) {
    booksGrid.innerHTML = ''; 
    if (books.length === 0) {
      booksGrid.innerHTML = '<p>لا توجد كتب حالياً.</p>';
      return;
    }

    books.forEach((book, index) => {
      const bookLink = document.createElement('a');
      bookLink.href = `book-details.html?id=${book.bookId}`;
      bookLink.className = 'book-card';
      bookLink.style.animationDelay = `${0.1 * index}s`; 

      const img = document.createElement('img');
      img.src = `https://projectlibraryapi.runasp.net${book.bookImage}`;
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

   
    const bookCards = document.querySelectorAll('.book-card');
    const footerColumns = document.querySelectorAll('.footer-column');
    const allAnimateElements = [...bookCards, ...footerColumns];
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    allAnimateElements.forEach(element => {
      observer.observe(element);
    });
    
   
    allAnimateElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom >= 0) {
        el.classList.add('animate');
        observer.unobserve(el);
      }
    });
  }

  // زر الانتقال لأعلى الصفحة
  const scrollToTopBtn = document.getElementById('scrollToTop');
  
  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
      scrollToTopBtn.classList.add('active');
    } else {
      scrollToTopBtn.classList.remove('active');
    }
  });
  
  scrollToTopBtn.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
});
