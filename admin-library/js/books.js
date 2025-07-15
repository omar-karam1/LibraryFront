
const bookModal = document.getElementById('book-modal');
const openModalBtn = document.getElementById('add-book-btn'); // زر فتح المودال
const closeModalBtns = bookModal.querySelectorAll('.close, .btn-secondary'); // أزرار الإغلاق


if (openModalBtn) {
    openModalBtn.onclick = () => {
        resetForm();  
        bookModal.style.display = 'flex'; 
    };
}


closeModalBtns.forEach(btn => {
    btn.onclick = () => {
        closeModal();
    };
});


window.onclick = (e) => {
    if (e.target === bookModal) {
        closeModal();
    }
};


function closeModal() {
    bookModal.style.display = 'none';
}


function resetForm() {
    const form = document.querySelector('#book-modal form');
    if (form) form.reset();
   
    const imagePreview = document.getElementById('book-image-preview');
    imagePreview.innerHTML = `<i class="fas fa-image" style="font-size: 24px; color: #ddd;"></i>`;
    const fileInfo = document.getElementById('book-file-info');
    fileInfo.textContent = 'لم يتم اختيار ملف';
}







async function loadCategories() {
    try {
        const response = await fetch('https://projectlibraryapi.runasp.net/api/Admin/all-categories');
        const data = await response.json();
        const categories = data["$values"] || [];  
        
        const categorySelect = document.getElementById('book-category');
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.categoryId;
            option.textContent = category.categoryName;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading categories:", error);
    }
}


function loadBooks() {
    fetch('https://projectlibraryapi.runasp.net/api/Book/allBooks')
    .then(res => {
        if (!res.ok) {
            throw new Error('فشل في جلب البيانات');
        }
        return res.json(); 
    })
    .then(data => {
        const books = data["$values"];
        const tableBody = document.querySelector('#books-table tbody');
        tableBody.innerHTML = ''; 
      
        books.forEach(book => {
            const row = document.createElement('tr');
            row.setAttribute('data-book-id', book.bookId); 
            
       
            row.innerHTML = `
                <td><img src="https://projectlibraryapi.runasp.net${book.bookImage || '/default-book-image.jpg'}" alt="غلاف الكتاب" class="book-cover"></td>
                <td>${book.title}</td>
                <td>${getCategoryName(book.categoryId)}</td>
                <td>${book.isFree ?  'مدفوع' : 'مجاني' }</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editBook(${book.bookId})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="deleteBook(${book.bookId})"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    })
    .catch(err => {
        console.error('خطأ:', err);
        alert('حدث خطأ أثناء تحميل البيانات');
    });
}


function getCategoryName(categoryId) {
    const categorySelect = document.getElementById('book-category');
    const selectedOption = Array.from(categorySelect.options).find(option => option.value == categoryId);
    return selectedOption ? selectedOption.textContent : 'غير محدد';
}


function getCategoryIdFromName(categoryName) {
    const categorySelect = document.getElementById('book-category');
    const selectedOption = Array.from(categorySelect.options).find(option => option.textContent == categoryName);
    return selectedOption ? selectedOption.value : null;
}


document.getElementById('book-file').addEventListener('change', function(event) {
  const fileInput = event.target;
  const fileInfo = document.getElementById('book-file-info');
  const fileName = fileInput.files[0] ? fileInput.files[0].name : 'لم يتم اختيار ملف'; 

  fileInfo.textContent = fileName; 
});


document.getElementById('book-image').addEventListener('change', function(event) {
  const fileInput = event.target;
  const imagePreview = document.getElementById('book-image-preview');
  const fileInfo = document.createElement('span');
  const file = fileInput.files[0];
  
  if (file) {
     
      const reader = new FileReader();
      reader.onload = function(e) {
          imagePreview.innerHTML = `<img src="${e.target.result}" alt="صورة الغلاف" class="preview-image">`;
      };
      reader.readAsDataURL(file);

   
      fileInfo.textContent = file.name;
      imagePreview.appendChild(fileInfo);
  } else {
     
      imagePreview.innerHTML = `<i class="fas fa-image" style="font-size: 24px; color: #ddd;"></i>`;
  }
});

// دالة لحفظ الكتاب
async function saveBook(event) {
    event.preventDefault();  // منع إرسال النموذج بشكل تقليدي

    const formData = new FormData();  // إنشاء كائن FormData

    // إضافة الحقول النصية إلى FormData
    formData.append('Title', document.getElementById('book-title').value);
    formData.append('CategoryId', document.getElementById('book-category').value);
    formData.append('Price', document.getElementById('book-price').value);
    formData.append('IsFree', document.getElementById('book-is-free').checked ? 'true' : 'false');
    formData.append('BookDescription', document.getElementById('book-description').value);

    // إضافة صورة الغلاف إذا كانت موجودة
    const BookImage = document.getElementById('book-image').files[0];
    if (BookImage) {
        formData.append('BookImage', BookImage);
    }

    // إضافة ملف الكتاب إذا كان موجودًا
    const bookFile = document.getElementById('book-file').files[0];
    if (bookFile) {
        formData.append('BookFile', bookFile);
    }

    try {
        // إرسال الطلب باستخدام fetch
        const response = await fetch('https://projectlibraryapi.runasp.net/api/Admin/upload-book', {
            method: 'POST',
            body: formData
        });

        // في حالة النجاح
        if (response.ok) {
            loadBooks();  // إعادة تحميل الكتب بعد الحفظ
            closeModal();  // إغلاق المودال
        } else {
            // في حالة حدوث خطأ من الخادم
            console.error('حدث خطأ أثناء حفظ الكتاب:', await response.text());
        }
    } catch (error) {
        console.error('حدث خطأ أثناء الاتصال بالخادم:', error);
    }
}



// Edit Book
function editBook(bookId) {
    fetch(`https://projectlibraryapi.runasp.net/api/Admin/book-by-id/${bookId}`)
        .then(res => {
            if (!res.ok) throw new Error('فشل تحميل بيانات الكتاب');
            return res.json();
        })
        .then(book => {
            if (book) {
                // تعبئة الحقول بالنموذج
                document.getElementById('book-title').value = book.title || '';
                document.getElementById('book-description').value = book.description || '';
                document.getElementById('book-is-free').checked = book.isFree || false;
                document.getElementById('book-category').value = book.categoryId || '';

                // عرض صورة الغلاف إن وجدت
                if (book.coverImage) {
                    const fullImageUrl = `https://projectlibraryapi.runasp.net/api/${book.coverImage}`;
                    imagePreview.innerHTML = `<img src="${fullImageUrl}" class="book-cover" onerror="this.src='fallback.jpg'">`;
                } else {
                    imagePreview.innerHTML = '<i class="fas fa-book" style="font-size: 24px; color: #ddd;"></i>';
                }

                // زر التحديث
                const updateBtn = document.getElementById('book-update-btn');
                updateBtn.onclick = () => {
                    const updatedBook = {
                        title: document.getElementById('book-title').value,
                        categoryId: document.getElementById('book-category').value,
                        isFree: document.getElementById('book-is-free').checked,
                        description: document.getElementById('book-description').value
                    };

                    fetch(`https://projectlibraryapi.runasp.net/api/Admin/update-book/${bookId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updatedBook),
                    })
                    .then(res => {
                        if (!res.ok) throw new Error('فشل في تحديث بيانات الكتاب');
                        return res.json();
                    })
                    .then(data => {
                        alert('تم تعديل الكتاب بنجاح');
                        bookModal.style.display = 'none'; // إغلاق المودال
                        loadBooks(); // إعادة تحميل الجدول
                    })
                    .catch(err => {
                        console.error('خطأ أثناء التحديث:', err);
                        alert('حدث خطأ أثناء تعديل الكتاب');
                    });
                };

                // عرض نافذة التعديل
                bookModal.style.display = 'flex';
            } else {
                alert('بيانات الكتاب غير صحيحة');
            }
        })
        .catch(err => {
            console.error(err);
            alert('فشل تحميل بيانات الكتاب');
        });
}







// دالة الحذف
function deleteBook(bookId) {
    if (confirm('هل أنت متأكد أنك تريد حذف هذا الكتاب؟')) {
        fetch(`https://projectlibraryapi.runasp.net/api/Admin/delete-book/${bookId}`, {
            method: 'DELETE',
        })
        .then(res => {
            if (res.ok) {
                alert('تم حذف الكتاب بنجاح');
                loadBooks(); // إعادة تحميل الكتب بعد الحذف
            } else {
                alert('حدث خطأ أثناء حذف الكتاب');
            }
        })
        .catch(err => {
            console.error('حدث خطأ في الحذف:', err);
            alert('حدث خطأ أثناء حذف الكتاب');
        });
    }
}

// استدعاء الدوال عند تحميل الصفحة
window.onload = () => {
    loadBooks();
    loadCategories();
};
