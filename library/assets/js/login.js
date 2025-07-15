const form = document.getElementById('loginForm');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      console.log("Sending login request for:", username);

      try {
        const response = await fetch('https://projectlibraryapi.runasp.net/api/User/Login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: username,
            password: password
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.log("Error:", errorData);
          throw new Error(errorData.message || 'فشل في تسجيل الدخول');
        }

        const data = await response.json();
        console.log('تم تسجيل الدخول بنجاح!');
        console.log('Token:', data.token);

        // حفظ التوكن في localStorage
        localStorage.setItem('authToken', data.token);

        // بعد النجاح، إعادة التوجيه إلى صفحة الكتب
        window.location.href = 'books.html';

      } catch (error) {
        console.error('Error:', error);
        alert(`خطأ: ${error.message}`);
      }
    });