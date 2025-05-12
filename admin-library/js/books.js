// فتح وإغلاق نافذة إضافة الكتاب
const bookModal = document.getElementById('book-modal');
const openModalBtn = document.getElementById('add-book-btn'); // زر فتح المودال
const closeModalBtns = bookModal.querySelectorAll('.close, .btn-secondary'); // أزرار الإغلاق

// عرض النافذة عند الضغط على زر إضافة كتاب
if (openModalBtn) {
    openModalBtn.onclick = () => {
        resetForm();  // إعادة تعيين الحقول عند الفتح
        bookModal.style.display = 'flex';  // إظهار المودال
    };
}

// إغلاق النافذة عند الضغط على زر الإغلاق
closeModalBtns.forEach(btn => {
    btn.onclick = () => {
        closeModal();
    };
});

// إغلاق النافذة عند الضغط خارجها
window.onclick = (e) => {
    if (e.target === bookModal) {
        closeModal();
    }
};

// دالة إغلاق المودال
function closeModal() {
    bookModal.style.display = 'none';
}

// دالة إعادة تعيين النموذج
function resetForm() {
    const form = document.querySelector('#book-modal form');
    if (form) form.reset();
    // إعادة تعيين عرض المعاينة
    const imagePreview = document.getElementById('book-image-preview');
    imagePreview.innerHTML = `<i class="fas fa-image" style="font-size: 24px; color: #ddd;"></i>`;
    const fileInfo = document.getElementById('book-file-info');
    fileInfo.textContent = 'لم يتم اختيار ملف';
}






// دالة لجلب التصنيفات
async function loadCategories() {
    try {
        const response = await fetch('http://localhost:5013/api/Admin/all-categories');
        const data = await response.json();
        const categories = data["$values"] || [];  // التحقق من وجود البيانات
        
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

// دالة لتحميل الكتب
function loadBooks() {
    fetch('http://localhost:5013/api/Book/allBooks')
    .then(res => {
        if (!res.ok) {
            throw new Error('فشل في جلب البيانات');
        }
        return res.json(); // تحويل الاستجابة إلى JSON
    })
    .then(data => {
        const books = data["$values"];
        const tableBody = document.querySelector('#books-table tbody');
        tableBody.innerHTML = ''; // مسح محتوى الجدول قبل إضافة البيانات الجديدة

        // عرض البيانات في الجدول
        books.forEach(book => {
            const row = document.createElement('tr');
            row.setAttribute('data-book-id', book.bookId); // إضافة معرف الكتاب إلى الصف
            
            // إضافة الأعمدة في الصف
            row.innerHTML = `
                <td><img src="http://localhost:5013${book.bookImage || '/default-book-image.jpg'}" alt="غلاف الكتاب" class="book-cover"></td>
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

// دالة لجلب اسم التصنيف بناءً على ID
function getCategoryName(categoryId) {
    const categorySelect = document.getElementById('book-category');
    const selectedOption = Array.from(categorySelect.options).find(option => option.value == categoryId);
    return selectedOption ? selectedOption.textContent : 'غير محدد';
}

// دالة للحصول على ID التصنيف من الاسم
function getCategoryIdFromName(categoryName) {
    const categorySelect = document.getElementById('book-category');
    const selectedOption = Array.from(categorySelect.options).find(option => option.textContent == categoryName);
    return selectedOption ? selectedOption.value : null;
}

// دالة لاختيار ملف الكتاب وعرض اسمه بعد رفعه
document.getElementById('book-file').addEventListener('change', function(event) {
  const fileInput = event.target;
  const fileInfo = document.getElementById('book-file-info'); // العنصر الذي يعرض اسم الملف
  const fileName = fileInput.files[0] ? fileInput.files[0].name : 'لم يتم اختيار ملف'; // التحقق إذا كان هناك ملف مختار

  fileInfo.textContent = fileName; // تحديث النص المعروض في العنصر
});

// دالة لاختيار صورة الغلاف وعرض اسم الصورة أو معاينة لها بعد رفعها
document.getElementById('book-image').addEventListener('change', function(event) {
  const fileInput = event.target;
  const imagePreview = document.getElementById('book-image-preview');
  const fileInfo = document.createElement('span');
  const file = fileInput.files[0];
  
  if (file) {
      // عرض معاينة للصورة
      const reader = new FileReader();
      reader.onload = function(e) {
          imagePreview.innerHTML = `<img src="${e.target.result}" alt="صورة الغلاف" class="preview-image">`;
      };
      reader.readAsDataURL(file);

      // عرض اسم الملف
      fileInfo.textContent = file.name;
      imagePreview.appendChild(fileInfo);
  } else {
      // في حال لم يتم اختيار صورة، عرض الأيقونة
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
        const response = await fetch('http://localhost:5013/api/Admin/upload-book', {
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



// دالة التعديل
function editBook(bookId) {
    const row = document.querySelector(`#books-table tr[data-book-id="${bookId}"]`);
    
    // تعبئة النموذج ببيانات الكتاب
    document.getElementById('book-title').value = row.cells[1].textContent;
    
    const categoryId = row.querySelector('td:nth-child(3)').textContent; // أخذ التصنيف من العمود
    document.getElementById('book-category').value = getCategoryIdFromName(categoryId); // تحديد التصنيف بناءً على الـ ID

    // تعبئة باقي البيانات (السعر، الوصف، ... )
    const updateBtn = document.getElementById('book-update-btn');
    updateBtn.onclick = () => {
        const updatedBook = {
            title: document.getElementById('book-title').value,
            categoryId: document.getElementById('book-category').value,
            isFree: document.getElementById('book-is-free').checked,
            description: document.getElementById('book-description').value
        };

        fetch(`http://localhost:5013/api/Admin/update-book/${bookId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedBook),
        })
        .then(res => res.json())
        .then(data => {
            alert('تم تعديل الكتاب بنجاح');
            bookModal.style.display = 'none'; // إغلاق النافذة
            loadBooks(); // إعادة تحميل الكتب
        })
        .catch(err => {
            console.error('حدث خطأ في التعديل:', err);
            alert('حدث خطأ أثناء تعديل الكتاب');
        });
    };
}

// دالة الحذف
function deleteBook(bookId) {
    if (confirm('هل أنت متأكد أنك تريد حذف هذا الكتاب؟')) {
        fetch(`http://localhost:5013/api/Admin/delete-book/${bookId}`, {
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
