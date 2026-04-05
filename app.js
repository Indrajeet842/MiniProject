// 🔥 Firebase Config
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_ID"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();

// 🔐 LOGIN
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(user => {
      checkRole(email);
    })
    .catch(err => alert(err.message));
}

// 👤 ROLE CHECK
function checkRole(email) {
  document.getElementById("login-box").style.display = "none";
  document.getElementById("notice-section").style.display = "block";

  // Teacher
  if (email === "teacher@gmail.com") {
    document.getElementById("admin-panel").style.display = "block";
  }
}

// 🚪 LOGOUT
function logout() {
  auth.signOut();
  location.reload();
}

// ➕ ADD NOTICE
function addNotice() {
  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;

  db.collection("notices").add({
    title,
    content,
    time: new Date()
  });
}

// 📥 DISPLAY NOTICES
db.collection("notices")
  .orderBy("time", "desc")
  .onSnapshot(snapshot => {
    const list = document.getElementById("notice-list");
    list.innerHTML = "";

    snapshot.forEach(doc => {
      const data = doc.data();

      list.innerHTML += `
        <div class="notice">
          <h3>${data.title}</h3>
          <p>${data.content}</p>
          ${auth.currentUser?.email === "teacher@gmail.com" 
            ? `<button onclick="deleteNotice('${doc.id}')">Delete</button>` 
            : ""}
        </div>
      `;
    });
  });

// ❌ DELETE
function deleteNotice(id) {
  db.collection("notices").doc(id).delete();
}