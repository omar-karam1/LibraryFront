



document.addEventListener('DOMContentLoaded', () => {
    loadBooks();
    loadAuthors();
    loadBookAuthorLinks();

    document.querySelector('.btn-primary').addEventListener('click', linkBookToAuthor);
});

// تحميل قائمة الكتب
async function loadBooks() {
    try {
        const response = await fetch('https://projectlibraryapi.runasp.net/api/Book/allBooks');
        const data = await response.json();
        const books = data["$values"] || [];

        const bookSelect = document.getElementById('book-select');
        books.forEach(book => {
            const option = document.createElement('option');
            option.value = book.bookId;
            option.textContent = book.title;
            bookSelect.appendChild(option);
        });
    } catch (error) {
        console.error('فشل في تحميل الكتب:', error);
    }
}

// تحميل قائمة المؤلفين
async function loadAuthors() {
    try {
        const response = await fetch('https://projectlibraryapi.runasp.net/api/Book/GetAllAuthors');
        const data = await response.json();
        const authors = data["$values"] || [];

        const authorSelect = document.getElementById('author-select');
        authors.forEach(author => {
            const option = document.createElement('option');
            option.value = author.authorId;
            option.textContent = author.name;
            authorSelect.appendChild(option);
        });
    } catch (error) {
        console.error('فشل في تحميل المؤلفين:', error);
    }
}

// ربط كتاب بمؤلف
async function linkBookToAuthor() {
    const bookId = parseInt(document.getElementById('book-select').value);
    const authorId = parseInt(document.getElementById('author-select').value);

    if (!bookId || !authorId) {
        alert('يرجى اختيار كتاب ومؤلف أولاً.');
        return;
    }

    try {
        const response = await fetch('https://projectlibraryapi.runasp.net/api/Admin/AddAuthorsToBook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                bookId: bookId,
                authorIds: [authorId]
            })
        });

        if (!response.ok) throw new Error('فشل في الربط');

        alert('تم الربط بنجاح');
        loadBookAuthorLinks(); // إعادة تحميل الجدول (تأكد إنك معرفها)
    } catch (error) {
        console.error('خطأ في الربط:', error);
        alert('حدث خطأ أثناء عملية الربط');
    }
}


// تحميل الروابط الحالية بين الكتب والمؤلفين
async function loadBookAuthorLinks() {
    try {
        const response = await fetch('https://projectlibraryapi.runasp.net/api/Admin/all-links'); // غيّر هذا الرابط حسب API الحقيقي
        const data = await response.json();
        const links = data["$values"] || [];

        const tbody = document.querySelector('table tbody');
        tbody.innerHTML = '';

        links.forEach(link => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${link.bookTitle}</td>
                <td>${link.authorName}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="unlinkBookAuthor(${link.bookId}, ${link.authorId})">
                        <i class="fas fa-unlink"></i> إلغاء الربط
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('فشل في تحميل روابط الكتب والمؤلفين:', error);
    }
}

// إلغاء الربط بين كتاب ومؤلف
async function unlinkBookAuthor(bookId, authorId) {
    if (!confirm('هل أنت متأكد أنك تريد إلغاء الربط؟')) return;

    try {
        const response = await fetch(`https://projectlibraryapi.runasp.net/api/Admin/unlink?bookId=${bookId}&authorId=${authorId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('فشل في إلغاء الربط');

        alert('تم إلغاء الربط بنجاح');
        loadBookAuthorLinks();
    } catch (error) {
        console.error('خطأ في إلغاء الربط:', error);
        alert('حدث خطأ أثناء إلغاء الربط');
    }
}
