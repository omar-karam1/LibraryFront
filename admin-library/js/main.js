// تهيئة القائمة الجانبية
document.addEventListener('DOMContentLoaded', function() {
    // تبديل أقسام المحتوى
    const navItems = document.querySelectorAll('.nav-menu ul li');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // إزالة النشاط من جميع العناصر
            navItems.forEach(i => i.classList.remove('active'));
            // إضافة النشاط للعنصر الحالي
            this.classList.add('active');
            
            // إخفاء جميع أقسام المحتوى
            const sections = document.querySelectorAll('.content-section');
            sections.forEach(section => section.classList.remove('active'));
            
            // إظهار القسم المحدد
            const sectionId = this.getAttribute('data-section') + '-section';
            document.getElementById(sectionId).classList.add('active');
        });
    });
    
    // إدارة النوافذ المنبثقة
    const modals = {
        'book': {
            openBtn: document.getElementById('add-book-btn'),
            modal: document.getElementById('book-modal'),
            closeBtn: document.querySelector('#book-modal .close'),
            closeModalBtn: document.querySelector('#book-modal .close-modal')
        },
        'category': {
            openBtn: document.getElementById('add-category-btn'),
            modal: document.getElementById('category-modal'),
            closeBtn: document.querySelector('#category-modal .close'),
            closeModalBtn: document.querySelector('#category-modal .close-modal')
        },
        'author': {
            openBtn: document.getElementById('add-author-btn'),
            modal: document.getElementById('author-modal'),
            closeBtn: document.querySelector('#author-modal .close'),
            closeModalBtn: document.querySelector('#author-modal .close-modal')
        }
    };
    
    // فتح وإغلاق النوافذ المنبثقة
    for (const [key, value] of Object.entries(modals)) {
        if (value.openBtn) {
            value.openBtn.addEventListener('click', () => {
                value.modal.style.display = 'block';
            });
        }
        
        if (value.closeBtn) {
            value.closeBtn.addEventListener('click', () => {
                value.modal.style.display = 'none';
            });
        }
        
        if (value.closeModalBtn) {
            value.closeModalBtn.addEventListener('click', () => {
                value.modal.style.display = 'none';
            });
        }
    }
    
    // إغلاق النافذة عند النقر خارجها
    window.addEventListener('click', function(event) {
        for (const modal of Object.values(modals)) {
            if (event.target === modal.modal) {
                modal.modal.style.display = 'none';
            }
        }
    });
    
    // معاينة الصور قبل الرفع
    document.getElementById('book-image').addEventListener('change', function(e) {
        const preview = document.getElementById('book-image-preview');
        preview.innerHTML = '';
        
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                preview.appendChild(img);
            }
            
            reader.readAsDataURL(this.files[0]);
        }
    });
    
    document.getElementById('author-image').addEventListener('change', function(e) {
        const preview = document.getElementById('author-image-preview');
        preview.innerHTML = '';
        
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                preview.appendChild(img);
            }
            
            reader.readAsDataURL(this.files[0]);
        }
    });
    
    // عرض معلومات ملف الكتاب
    document.getElementById('book-file').addEventListener('change', function(e) {
        const fileInfo = document.getElementById('book-file-info');
        
        if (this.files && this.files[0]) {
            const file = this.files[0];
            fileInfo.innerHTML = `
                <strong>اسم الملف:</strong> ${file.name}<br>
                <strong>النوع:</strong> ${file.type}<br>
                <strong>الحجم:</strong> ${(file.size / 1024 / 1024).toFixed(2)} MB
            `;
        } else {
            fileInfo.innerHTML = '';
        }
    });
    
    // تحميل البيانات الأولية
    loadStats();
});

// تحميل الإحصائيات
function loadStats() {
    // هذه البيانات ستأتي من API في التطبيق الحقيقي
    setTimeout(() => {
        document.getElementById('total-books').textContent = '125';
        document.getElementById('total-categories').textContent = '15';
        document.getElementById('total-authors').textContent = '42';
    }, 500);
}

// عرض رسالة نجاح
function showSuccess(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-success';
    alert.textContent = message;
    
    const contentSection = document.querySelector('.content-section.active');
    if (contentSection) {
        contentSection.insertBefore(alert, contentSection.firstChild);
        
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
}

// عرض رسالة خطأ
function showError(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger';
    alert.textContent = message;
    
    const contentSection = document.querySelector('.content-section.active');
    if (contentSection) {
        contentSection.insertBefore(alert, contentSection.firstChild);
        
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
}