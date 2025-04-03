
const WEATHER_API_URL = "http://localhost:5000/api/weather"; // API endpoint for weather data
const USERS_API_URL = "http://localhost:5000/api/users"; // API endpoint for user data

let selectedCityId = null;


 // Handle form submission to add a new city
async function addCity() {
    const cityName = document.getElementById("newCityName").value;  // Get the new city name from the form
    if (!cityName.trim()) {
        alert("Please enter a valid city name.");
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        alert("You need to log in to add a city.");
        window.location.href = "login.html";
        return;
    }

    try {
        const res = await fetch(`${WEATHER_API_URL}/addcity`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ city: cityName })
        });

        const data = await res.json();

        if (res.ok) {
            alert("City added successfully!");
            loadFavoriteCities(); // Reload the cities list after adding the new city
        } else {
            alert(data.message || "Failed to add city.");
        }
    } catch (error) {
        console.error("Error adding city:", error);
        alert("An error occurred while adding the city.");
    }
}

// Attach event listener to the form submit button for adding a new city
document.getElementById("addCityForm")?.addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent default form submission
    addCity();  // Call the function to add the city
});


// Weather-related functions
async function loadFavoriteCities() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You need to log in!");
        window.location.href = "login.html";
        return;
    }

    try {
        const res = await fetch(`${WEATHER_API_URL}/favoriteCities`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        const data = await res.json();

        if (data.length === 0) {
            alert("No favorite cities found.");
            return;
        }

        const citySelect = document.getElementById("citySelect");
        data.forEach(city => {
            const option = document.createElement("option");
            option.value = city.id;
            option.textContent = city.city;
            citySelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading cities:", error);
    }
}

function showCityOptions() {
    const citySelect = document.getElementById("citySelect");
    selectedCityId = citySelect.value;
    if (selectedCityId) {
        document.getElementById("cityOptions").style.display = "block";
        document.getElementById("weatherInfo").style.display = "none";
    }
}

async function showWeatherData() {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`${WEATHER_API_URL}/favoritecitylookup/${selectedCityId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        const data = await res.json();

        if (res.ok) {
            const weatherDiv = document.getElementById("weatherInfo");
            weatherDiv.style.display = "block";
            weatherDiv.innerHTML = `
                <p><strong>Temperature:</strong> ${data.weather.temperature}°C</p>
                <p><strong>Description:</strong> ${data.weather.description}</p>
                <p><strong>Humidity:</strong> ${data.weather.humidity}%</p>
                <p><strong>Wind Speed:</strong> ${data.weather.windSpeed} m/s</p>
                <img src="${data.weather.icon}" alt="weather icon" />
            `;
        } else {
            alert("Failed to fetch weather data.");
        }
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

async function editCity() {
    const newCityName = prompt("Edit city name:");
    if (!newCityName) return;

    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`${WEATHER_API_URL}/updatecity/${selectedCityId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ city: newCityName }),
        });

        const data = await res.json();

        if (res.ok) {
            alert("City updated successfully!");
            loadFavoriteCities(); // Reload the cities list
        } else {
            alert(data.message || "Failed to update city.");
        }
    } catch (error) {
        console.error("Error editing city:", error);
    }
}

async function deleteCity() {
    const token = localStorage.getItem("token");

    const confirmDelete = confirm("Are you sure you want to delete this city?");
    if (!confirmDelete) return;

    try {
        const res = await fetch(`${WEATHER_API_URL}/deletecity/${selectedCityId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        const data = await res.json();

        if (res.ok) {
            alert("City deleted successfully!");
            loadFavoriteCities(); // Reload the cities list
        } else {
            alert(data.message || "Failed to delete city.");
        }
    } catch (error) {
        console.error("Error deleting city:", error);
    }
}

window.onload = loadFavoriteCities; // Load cities when the page loads

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

    if (!validateRegisterInputs(name, email, password, phone, address)) return;

    try {
        const res = await fetch(`${USERS_API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, phone, address }),
        });

        const data = await res.json();

        if (res.ok) {
            alert(" A verification code has been sent to your email.");
            localStorage.setItem("userEmail", email);
            window.location.href = "verify.html";
        } else {
            alert("❌ " + data.message);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

//  التحقق من OTP
async function verifyOTP() {
    const email = localStorage.getItem("userEmail");
    const otp = document.getElementById("otp").value;

    try {
        const res = await fetch(`${USERS_API_URL}/verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp })
        });

        const data = await res.json();

        if (res.ok) {
            document.getElementById("message").innerText = "Verified successfully!";
            setTimeout(() => window.location.href = "login.html", 2000);
        } else {
            document.getElementById("message").innerText = "❌ " + data.message;
        }
    } catch (error) {
        console.error("Error verifying OTP:", error);
    }
}

// //  إعادة إرسال OTP
// async function resendOTP() {
//     const email = localStorage.getItem("userEmail");

//     try {
//         const res = await fetch(`${API_URL}/resend-otp`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ email })
//         });

//         const data = await res.json();
//         document.getElementById("message").innerText = data.message;
//     } catch (error) {
//         console.error("Error resending OTP:", error);
//     }
// }


// Login 
async function login() {
    const emailOrName = document.getElementById("loginEmailOrName").value;
    const password = document.getElementById("loginPassword").value;

    if (!emailOrName || !password) {
        alert("Please enter your email/username and password.");
        return;
    }

    try {
        const res = await fetch(`${USERS_API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ emailOrName, password }),
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem("token", data.token);
            window.location.href = "profile.html"; // Redirect to profile
        } else {
            alert(data.message || "Invalid login credentials");
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("An error occurred while logging in. Please try again.");
    }
}

// forget password send-otp to email
async function forgotPassword() {
    const email = document.getElementById("forgotEmail").value;

    if (!email.trim()) {
        alert("Please enter your email!");
        return;
    }

    try {
        const res = await fetch(`${USERS_API_URL}/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await res.json();

        if (res.ok) {
            alert("A verification code has been sent to your email.");
            localStorage.setItem("resetEmail", email);
            window.location.href = "reset-password.html"; 
        } else {
            alert("❌ " + data.message);
        }
    } catch (error) {
        console.error("Error sending OTP:", error);
    }
}

// reset password suing otp
async function resetPassword() {
    const email = localStorage.getItem("resetEmail");
    const otp = document.getElementById("resetOTP").value;
    const newPassword = document.getElementById("resetPassword").value;

    if (!otp.trim() || newPassword.length < 6) {
        alert("Please enter a valid OTP and a new password with at least 6 characters.");
        return;
    }

    try {
        const res = await fetch(`${USERS_API_URL}/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp, newPassword })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Your password has been reset successfully!");
            localStorage.removeItem("resetEmail"); 
            window.location.href = "login.html"; // 
        } else {
            alert("❌ " + data.message);
        }
    } catch (error) {
        console.error("Error resetting password:", error);
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

    const res = await fetch(`${USERS_API_URL}/profile`, {
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

    const res = await fetch(`${USERS_API_URL}/profile`, {
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
        
        await fetch(`${USERS_API_URL}/logout`, {
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
        const res = await fetch(`${USERS_API_URL}/profile`, {
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

