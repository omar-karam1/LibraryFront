// فتح النافذة عند الضغط على زر "إضافة تصنيف"
document.getElementById("add-category-btn").addEventListener("click", () => {
    document.getElementById("category-modal").style.display = "block";
});

// غلق النافذة عند الضغط على X أو زر إلغاء
document.querySelector(".close").addEventListener("click", closeModal);
document.querySelector(".close-modal").addEventListener("click", closeModal);

function closeModal() {
    document.getElementById("category-modal").style.display = "none";
    document.getElementById("category-name").value = "";
}


    
// إرسال التصنيف الجديد إلى الـ API عند الضغط على "حفظ"
document.querySelector("#category-modal form").addEventListener("submit", function (e) {
    e.preventDefault();
    const categoryName = document.getElementById("category-name").value.trim();

    if (categoryName === "") {
        alert("يرجى إدخال اسم التصنيف");
        return;
    }

    fetch(`https://projectlibraryapi.runasp.net/api/Admin/AddNewCategorie?categoryName=${encodeURIComponent(categoryName)}`, {
        method: 'POST'
    })
    .then(res => {
        if (res.ok) {
            closeModal();
            location.reload(); // تحديث الصفحة لإظهار التصنيف الجديد
        } else {
            alert("فشل في إضافة التصنيف.");
        }
    })
    .catch(error => {
        console.error("خطأ أثناء إضافة التصنيف:", error);
        alert("تم الحفظ");
    });
});






    document.addEventListener("DOMContentLoaded", function () {
        const tableBody = document.querySelector("tbody");
    
        fetch("https://projectlibraryapi.runasp.net/api/Admin/all-categories")
            .then(res => res.json())
            .then(data => {
                // إفراغ الجدول الحالي
                tableBody.innerHTML = "";
    
                data.$values.forEach((category, index) => {
                    const row = document.createElement("tr");
    
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${category.categoryName}</td>
                        <td>—</td> <!-- يمكنك استبدال هذا بعدد الكتب إذا كانت متوفرة -->
                        <td>
                            <div class="action-btns">
                                <button class="btn btn-sm btn-primary" onclick="editCategory(${category.categoryId}, '${category.categoryName}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteCategory(${category.categoryId})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
            })
            .catch(error => {
                console.error("حدث خطأ أثناء جلب التصنيفات:", error);
            });
    });
    
    // دالة لحذف التصنيف
    function deleteCategory(categoryId) {
        if (confirm("هل أنت متأكد أنك تريد حذف هذا التصنيف؟")) {
            fetch(`https://projectlibraryapi.runasp.net/api/Admin/delete-category/${categoryId}`, {
                method: 'DELETE'
            })
            .then(res => {
                if (res.ok) {
                    location.reload(); // تحديث الصفحة بعد الحذف
                } else {
                    alert("فشل في حذف التصنيف.");
                }
            });
        }
    }
    
    // دالة لتعديل التصنيف
    function editCategory(categoryId, currentName) {
        const newName = prompt("أدخل اسم التصنيف الجديد:", currentName);
        if (newName && newName !== currentName) {
            fetch(`https://projectlibraryapi.runasp.net/api/Admin/update-category?CategoryID=${categoryId}&NewCategory=${encodeURIComponent(newName)}`, {
                method: 'PUT'
            })
            .then(res => {
                if (res.ok) {
                    location.reload();
                } else {
                    alert("فشل في تعديل التصنيف.");
                }
            });
        }
    }
    
