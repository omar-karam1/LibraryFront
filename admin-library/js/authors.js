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
    fetch('http://localhost:5013/api/Book/GetAllAuthors')
        .then(res => res.json())
        .then(data => {
            const authors = data["$values"];
            const tableBody = document.querySelector('#Author-table tbody');
            tableBody.innerHTML = '';

            authors.forEach(author => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><img src="http://localhost:5013${author.authorImage}" alt="صورة المؤلف" class="book-cover"></td>
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



// function addAuthor() {
//     const name = document.getElementById('author-name').value.trim();
//     const about = document.getElementById('author-about').value.trim();
//     const image = document.getElementById('author-image').files[0];

//     if (!name) {
//         alert("يرجى إدخال اسم المؤلف");
//         return;
//     }

//     const formData = new FormData();
//     formData.append('name', name);
//     formData.append('aboutAuthor', about);
//     if (image) {
//         formData.append('authorImage', image);
//     }

//     fetch('http://localhost:5013/api/Admin/AddAddAuthor', {
//         method: 'POST',
//         body: formData
//     })
//     .then(res => {
//         if (!res.ok) throw new Error("فشل في إضافة المؤلف");
//         return res.json();
//     })
//     .then(data => {
//         alert("تمت إضافة المؤلف بنجاح");
//         document.getElementById('author-modal').style.display = 'none';
//         loadAuthors(); // إعادة تحميل المؤلفين
//     })
//     .catch(err => {
//         console.error(err);
//         alert("حدث خطأ أثناء الإضافة");
//     });
// }






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
        ? `http://localhost:5013/api/Admin/update-author/${authorIdInput.value}`
        : `http://localhost:5013/api/Admin/AddAddAuthor`;
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
    fetch(`http://localhost:5013/api/Admin/AuthorByID?id=${authorId}`)
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
                    const fullImageUrl = `http://localhost:5013${author.authorImage}`;  // تأكد من أن الصورة تتضمن المسار الكامل
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




// Delete Author
function deleteAuthor(authorId) {
    if (confirm('هل أنت متأكد من حذف هذا المؤلف؟')) {
        fetch(`http://localhost:5013/api/Admin/delete-author/${authorId}`, {
            method: 'DELETE'
        })
            .then(res => {
                if (!res.ok) throw new Error('فشل الحذف');
                loadAuthors();
            })
            .catch(err => {
                console.error(err);
                alert('حدث خطأ أثناء الحذف');
            });
    }
}

// تحميل المؤلفين عند تحميل الصفحة
window.onload = loadAuthors;
