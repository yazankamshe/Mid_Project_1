const API_URL = "http://localhost:5000/api/users";


function validateRegisterInputs(name, email, password, phone, address) {
    let isValid = true;

    document.getElementById("errorName").innerText = "";
    document.getElementById("errorEmail").innerText = "";
    document.getElementById("errorPassword").innerText = "";
    document.getElementById("errorPhone").innerText = "";
    document.getElementById("errorAddress").innerText = "";

    if (!name.trim()) {
        document.getElementById("errorName").innerText = "Name required!";
        isValid = false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        document.getElementById("errorEmail").innerText = "Please enter a valid email address!";
        isValid = false;
    }

    if (password.length < 6) {
        document.getElementById("errorPassword").innerText = "The password must contain at least 6 characters!";
        isValid = false;
    }

    const phonePattern = /^[0-9]+$/;
    if (!phonePattern.test(phone)) {
        document.getElementById("errorPhone").innerText = "The phone number must contain only numbers!";
        isValid = false;
    }

    if (!address.trim()) {
        document.getElementById("errorAddress").innerText = "Address required!"
;
        isValid = false;
    }

    return isValid;
}


// Register
async function register() {
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;
    const phone = document.getElementById("regPhone").value;
    const address = document.getElementById("regAddress").value;

    // التحقق من صحة الإدخال
    if (!validateRegisterInputs(name, email, password, phone, address)) {
        return;
    }

    try {
        const res = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, phone, address }),
        });

        const data = await res.json();

        if (res.ok) {
            alert("Registration successful!");
            window.location.href = "login.html"; 
        } else {
            alert(data.message || "Registration failed! Try again.");
        }
    } catch (error) {
        alert("An error occurred while connecting to the server!");
    }
}
// Login 
async function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "profile.html"; // Redirect to profile
    } else {
        alert("Invalid login credentials");
    }
}


//  Fetch User Profile
async function loadProfile() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Not authorized!");
        window.location.href = "index.html";
        return;
    }

    const res = await fetch(`${API_URL}/profile`, {
        method: "GET",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await res.json();

    if (data.id) {
        document.getElementById("userName").innerText = data.name;
        document.getElementById("userEmail").innerText = data.email;
        document.getElementById("userPhone").innerText = data.phone; // New field
        document.getElementById("userAddress").innerText = data.address; // New field
    } else {
        alert("Session expired! Login again.");
        logout();
    }
}
// update
async function updateUserProfile() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Not authorized!");
        window.location.href = "index.html";
        return;
    }

    const name = document.getElementById("updateName").value;
    const phone = document.getElementById("updatePhone").value;
    const address = document.getElementById("updateAddress").value;

    const res = await fetch(`${API_URL}/profile`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ name, phone, address }),
    });

    const data = await res.json();

    if (res.ok) {
        alert("Profile updated successfully!");
        window.location.href = "profile.html"; 
    } else {
        alert(data.message || "Failed to update profile!");
    }
}

// 
document.getElementById("updateProfileForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    updateUserProfile();
});



async function logout() {
    try {
        
        await fetch(`${API_URL}/logout`, {
            method: "POST",
            credentials: "include", 
        });

        // Remove token from localStorage
        localStorage.removeItem("token");

      
        window.location.href = "index.html";
    } catch (error) {
        console.error("Error during logout:", error);
    }
}

async function deleteUserAccount() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Not authorized!");
        return;
    }

    const confirmDelete = confirm("Are you sure you want to delete your account? This action cannot be undone!");
    if (!confirmDelete) return;

    try {
        const res = await fetch(`${API_URL}/profile`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        const data = await res.json();

        if (res.ok) {
            alert("Your account has been deleted successfully.");
            localStorage.removeItem("token"); // Remove token
            window.location.href = "index.html"; // Redirect to home page
        } else {
            alert(data.message || "Failed to delete account.");
        }
    } catch (error) {
        alert("Error deleting account.");
        console.error(error);
    }
}

// Attach event listener to the delete button
document.getElementById("deleteAccountBtn")?.addEventListener("click", deleteUserAccount);


// ✅ Auto Load Profile
if (window.location.pathname.includes("profile.html")) {
    loadProfile();
}

