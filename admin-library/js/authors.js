const authorModal = document.getElementById('author-modal');
const openModalBtn = document.getElementById('add-author-btn');
const closeModalBtns = authorModal.querySelectorAll('.close, .close-modal');
const form = authorModal.querySelector('form');
const nameInput = document.getElementById('author-name');
const aboutInput = document.getElementById('author-about');
const imageInput = document.getElementById('author-image');
const authorIdInput = document.getElementById('author-id');
const imagePreview = document.getElementById('author-image-preview');

// Show modal
openModalBtn.onclick = () => {
    resetForm();
    authorModal.style.display = 'flex';
};

// Close modal
closeModalBtns.forEach(btn => {
    btn.onclick = () => {
        authorModal.style.display = 'none';
    };
});

window.onclick = (e) => {
    if (e.target === authorModal) {
        authorModal.style.display = 'none';
    }
};

// Load authors from API
function loadAuthors() {
    fetch('https://projectlibraryapi.runasp.net/api/Book/GetAllAuthors')
        .then(res => res.json())
        .then(data => {
            const authors = data["$values"];
            const tableBody = document.querySelector('#Author-table tbody');
            tableBody.innerHTML = '';

            authors.forEach(author => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><img src="https://projectlibraryapi.runasp.net/${author.authorImage}" alt="صورة المؤلف" class="book-cover"></td>
                    <td>${author.name}</td>
                    <td>${author.bookCount || 0}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="editAuthor(${author.authorId})"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="deleteAuthor(${author.authorId})"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(err => {
            console.error(err);
            alert('حدث خطأ في تحميل المؤلفين');
        });
}

// Reset form
function resetForm() {
    form.reset();
    imagePreview.innerHTML = '<i class="fas fa-user" style="font-size: 24px; color: #ddd;"></i>';
    authorIdInput.value = '';
}

// Preview image
imageInput.onchange = () => {
    const file = imageInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            imagePreview.innerHTML = `<img src="${e.target.result}" class="book-cover">`;
        };
        reader.readAsDataURL(file);
    }
};








// Add or Update Author
form.onsubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', nameInput.value);
    formData.append('aboutAuthor', aboutInput.value);
    if (imageInput.files[0]) {
        formData.append('authorImage', imageInput.files[0]);
    }

    const isEdit = !!authorIdInput.value;
    const url = isEdit
        ? `https://projectlibraryapi.runasp.net/api/Admin/update-author/${authorIdInput.value}`
        : `https://projectlibraryapi.runasp.net/api/Admin/AddAddAuthor`;
    const method = isEdit ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        body: formData
    })
        .then(res => {
            if (!res.ok) throw new Error('فشل الحفظ');
            return res.text();
        })
        .then(() => {
            alert(isEdit ? 'تم التحديث بنجاح' : 'تمت الإضافة بنجاح');
            loadAuthors();
            authorModal.style.display = 'none';
            resetForm();
        })
        .catch(err => {
            console.error(err);
            alert('فشل في الحفظ');
        });
};


// Edit Author
function editAuthor(authorId) {
    fetch(`https://projectlibraryapi.runasp.net/api/Admin/AuthorByID?id=${authorId}`)
        .then(res => {
            if (!res.ok) throw new Error('فشل تحميل بيانات المؤلف');
            return res.json();  // تحويل الاستجابة إلى JSON
        })
        .then(author => {
            if (author) {
                nameInput.value = author.name || '';
                aboutInput.value = author.aboutAuthor || '';
                authorIdInput.value = author.authorId || '';

                if (author.authorImage) {
                    const fullImageUrl = `https://projectlibraryapi.runasp.net/api/${author.authorImage}`;  // تأكد من أن الصورة تتضمن المسار الكامل
                    imagePreview.innerHTML = `<img src="${fullImageUrl}" class="book-cover" onerror="this.src='fallback.jpg'">`;
                } else {
                    imagePreview.innerHTML = '<i class="fas fa-user" style="font-size: 24px; color: #ddd;"></i>';
                }

                authorModal.style.display = 'flex';
            } else {
                alert('بيانات المؤلف غير صحيحة');
            }
        })
        .catch(err => {
            console.error(err);
            alert('فشل تحميل بيانات المؤلف');
        });
}



// دالة حذف المؤلف
function deleteAuthor(authorId) {
    if (confirm('هل أنت متأكد أنك تريد حذف هذا المؤلف؟')) {
        fetch(`https://projectlibraryapi.runasp.net/api/Admin/delete-author/${authorId}`, {
            method: 'DELETE',
        })
        .then(res => {
            if (res.ok) {
                alert('تم حذف المؤلف بنجاح');
                loadAuthors(); // إعادة تحميل المؤلفين بعد الحذف
            } else {
                alert('حدث خطأ أثناء حذف المؤلف');
            }
        })
        .catch(err => {
            console.error('حدث خطأ في الحذف:', err);
            alert('حدث خطأ أثناء حذف المؤلف');
        });
    }
}


// تحميل المؤلفين عند تحميل الصفحة
window.onload = loadAuthors;
