// 🔥 FIREBASE IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔥 CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDDmVFcY64J0LscmoXAYRXqa5dwt6OcvwE",
  authDomain: "smart-notice-board-47338.firebaseapp.com",
  projectId: "smart-notice-board-47338",
  storageBucket: "smart-notice-board-47338.appspot.com",
  messagingSenderId: "1030934735505",
  appId: "1:1030934735505:web:897aca8c8a9278c77aed30"
};

// INIT
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentRole = "";

// ================= ERROR UI =================
function showError(msg) {
  let el = document.getElementById("errorMsg");

  if (!el) {
    el = document.createElement("p");
    el.id = "errorMsg";
    el.style.color = "#f87171";
    el.style.textAlign = "center";
    el.style.marginTop = "10px";
    document.querySelector(".login-card").appendChild(el);
  }

  el.innerText = msg;
}

function clearError() {
  const el = document.getElementById("errorMsg");
  if (el) el.innerText = "";
}

// ================= LOGIN =================
document.getElementById("loginBtn").onclick = async () => {
  clearError();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const selectedRole = document.getElementById("role").value;

  const btn = document.getElementById("loginBtn");
  btn.innerText = "Logging...";
  btn.disabled = true;

  if (!email || !password) {
    showError("Please fill all fields ❌");
    btn.innerText = "Login";
    btn.disabled = false;
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);

    const userDoc = await getDoc(doc(db, "users", email));

    if (!userDoc.exists()) {
      showError("User role not found ❌");
      return;
    }

    const dbRole = userDoc.data().role;

    if (dbRole !== selectedRole) {
      showError("Wrong role selected ❌");
      await signOut(auth);
      return;
    }

    currentRole = dbRole;

    document.getElementById("login-page").style.display = "none";
    document.getElementById("dashboard").style.display = "flex";

    if (dbRole === "student") {
      document.getElementById("addBtn").style.display = "none";
    }

  } catch (error) {
    if (
      error.code === "auth/user-not-found" ||
      error.code === "auth/wrong-password" ||
      error.code === "auth/invalid-credential"
    ) {
      showError("Invalid email or password ❌");
    } else if (error.code === "auth/invalid-email") {
      showError("Invalid email format ❌");
    } else {
      showError("Login failed ❌");
    }
  }

  btn.innerText = "Login";
  btn.disabled = false;
};

// ================= FORGOT PASSWORD =================
document.getElementById("forgotPassword").onclick = async () => {
  clearError();

  const email = document.getElementById("email").value.trim();

  if (!email) {
    showError("Enter email first ❌");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    showError("Reset link sent to email 📩");
  } catch {
    showError("Failed to send reset email ❌");
  }
};

// ================= LOGOUT =================
document.getElementById("logoutBtn").onclick = async () => {
  await signOut(auth);
  location.reload();
};

// ================= NAVIGATION =================
document.getElementById("noticeBtn").onclick = () => {
  setActive("noticeBtn");
  showSection("notices-section");
};

document.getElementById("addBtn").onclick = () => {
  setActive("addBtn");
  showSection("add-section");
};

function setActive(id) {
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.remove("active");
  });
  document.getElementById(id).classList.add("active");
}

function showSection(id) {
  document.getElementById("notices-section").style.display = "none";
  document.getElementById("add-section").style.display = "none";
  document.getElementById(id).style.display = "block";
}

// ================= ADD NOTICE =================
window.addNotice = async function () {
  const title = document.getElementById("titleInput").value.trim();
  const content = document.getElementById("contentInput").value.trim();

  if (!title || !content) {
    alert("Fill all fields");
    return;
  }

  await addDoc(collection(db, "notices"), {
    title,
    content,
    time: new Date().toLocaleString()
  });

  document.getElementById("titleInput").value = "";
  document.getElementById("contentInput").value = "";
};

// ================= LOAD NOTICES =================
onSnapshot(collection(db, "notices"), (snapshot) => {
  const container = document.getElementById("notices-section");
  container.innerHTML = "";

  snapshot.forEach(docItem => {
    const data = docItem.data();

    const div = document.createElement("div");
    div.className = "notice";

    div.innerHTML = `
      <h3>${data.title}</h3>
      <p>${data.content}</p>
      <small>${data.time}</small>
      ${currentRole === "teacher" ? `
        <br><br>
        <button onclick="deleteNotice('${docItem.id}')">Delete</button>
      ` : ""}
    `;

    container.appendChild(div);
  });
});

// ================= DELETE =================
window.deleteNotice = async function (id) {
  await deleteDoc(doc(db, "notices", id));
};

// ================= ROLE UI =================
document.getElementById("role").onchange = function () {
  const role = this.value;
  document.body.className = role + "-theme";

  document.getElementById("login-title").innerHTML =
    role === "teacher" ? "👨‍🏫 Teacher Login" : "🎓 Student Login";
};

// ================= SNOW EFFECT =================
const canvas = document.getElementById("snow");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let snowflakes = Array.from({ length: 80 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  size: Math.random() * 2 + 0.5,
  speedY: Math.random() * 0.7 + 0.2,
  speedX: Math.random() * 0.3 - 0.15,
  opacity: Math.random() * 0.5 + 0.2
}));

function drawSnow() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  snowflakes.forEach(f => {
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${f.opacity})`;
    ctx.fill();

    f.y += f.speedY;
    f.x += f.speedX;

    if (f.y > canvas.height) {
      f.y = 0;
      f.x = Math.random() * canvas.width;
    }
  });

  requestAnimationFrame(drawSnow);
}

drawSnow();
