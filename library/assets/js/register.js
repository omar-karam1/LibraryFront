document.getElementById("registerForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  // إخفاء الأخطاء السابقة
  document.querySelectorAll(".error-message").forEach(el => {
    el.textContent = "";
    el.style.display = "none";
  });

  const name = document.getElementById("name").value.trim();
  const userName = document.getElementById("userName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const birthDate = document.getElementById("birthDate").value;
  const agreeTerms = document.getElementById("agreeTerms").checked;

  let isValid = true;

  // تحقق من تفريغ الحقول
  if (!name) {
    document.getElementById("nameError").textContent = "الاسم مطلوب";
    document.getElementById("nameError").style.display = "block";
    isValid = false;
  }

  if (!userName) {
    document.getElementById("userNameError").textContent = "اسم المستخدم مطلوب";
    document.getElementById("userNameError").style.display = "block";
    isValid = false;
  }

  if (!email) {
    document.getElementById("emailError").textContent = "البريد الإلكتروني مطلوب";
    document.getElementById("emailError").style.display = "block";
    isValid = false;
  }

  if (!birthDate) {
    document.getElementById("birthDateError").textContent = "تاريخ الميلاد مطلوب";
    document.getElementById("birthDateError").style.display = "block";
    isValid = false;
  }

  if (!agreeTerms) {
    alert("يجب الموافقة على الشروط والأحكام.");
    isValid = false;
  }

  // تحقق من قوة كلمة المرور
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;"'<>,.?/~\\-]).{9,}$/;
  if (!passwordRegex.test(password)) {
    document.getElementById("passwordError").textContent =
      "كلمة المرور يجب أن تكون على الأقل 9 أحرف وتحتوي على أحرف وأرقام وعلامة خاصة";
    document.getElementById("passwordError").style.display = "block";
    isValid = false;
  }

  // تحقق من تطابق كلمة المرور
  if (password !== confirmPassword) {
    document.getElementById("confirmPasswordError").textContent = "كلمتا المرور غير متطابقتين";
    document.getElementById("confirmPasswordError").style.display = "block";
    isValid = false;
  }

  if (!isValid) return;

  // تحقق من تميز اسم المستخدم والبريد
  try {
    const [userNameRes, emailRes] = await Promise.all([
      fetch(`https://projectlibraryapi.runasp.net/api/User/IsUserNameUnique?userName=${encodeURIComponent(userName)}`),
      fetch(`https://projectlibraryapi.runasp.net/api/User/IsEmailUnique?email=${encodeURIComponent(email)}`)
    ]);

    const isUserNameUnique = await userNameRes.json();
    const isEmailUnique = await emailRes.json();

    if (!isUserNameUnique) {
      document.getElementById("userNameError").textContent = "اسم المستخدم مستخدم من قبل";
      document.getElementById("userNameError").style.display = "block";
      return;
    }

    if (!isEmailUnique) {
      document.getElementById("emailError").textContent = "البريد الإلكتروني مستخدم من قبل";
      document.getElementById("emailError").style.display = "block";
      return;
    }
  } catch (error) {
    alert("فشل في التحقق من البريد أو اسم المستخدم");
    console.error(error);
    return;
  }

  // إعداد وإرسال البيانات إلى الـ API
  const userData = {
    name,
    userName,
    email,
    password,
    birthDate
  };

  const registerBtn = document.getElementById("registerBtn");
  const registerText = document.getElementById("registerText");
  const registerSpinner = document.getElementById("registerSpinner");

  registerBtn.disabled = true;
  registerText.textContent = "جاري الإنشاء...";
  registerSpinner.classList.remove("d-none");

  try {
    const response = await fetch("https://projectlibraryapi.runasp.net/api/User/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    });

    const result = await response.json();

    if (response.ok) {
      alert("تم إنشاء الحساب بنجاح!");
      window.location.href = "login.html";
    } else {
      alert(result.message || "فشل في إنشاء الحساب.");
    }
  } catch (error) {
    alert("حدث خطأ أثناء الاتصال بالخادم.");
    console.error(error);
  } finally {
    registerBtn.disabled = false;
    registerText.textContent = "إنشاء حساب";
    registerSpinner.classList.add("d-none");
  }
});