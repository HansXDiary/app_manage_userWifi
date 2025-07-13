let users = JSON.parse(localStorage.getItem("wifi_users")) || {};
let globalTarif = parseInt(localStorage.getItem("wifi_tarif")) || 25;
document.getElementById("tarif").value = globalTarif;

document.getElementById("mode").addEventListener("change", () => {
  const mode = document.getElementById("mode").value;
  document.getElementById("time-group").style.display = mode === "limité" ? "block" : "none";
});

document.getElementById("tarif").addEventListener("input", () => {
  const value = parseInt(document.getElementById("tarif").value);
  if (!isNaN(value) && value > 0) {
    globalTarif = value;
    localStorage.setItem("wifi_tarif", globalTarif);
    updateTarifs();
  }
});

function addUser() {
  const name = document.getElementById("username").value.trim();
  const mode = document.getElementById("mode").value;
  const minutes = parseInt(document.getElementById("minutes").value.trim());

  if (!name) return alert("Nom requis.");
  if (mode === "limité" && (isNaN(minutes) || minutes <= 0)) return alert("Temps invalide.");

  const id = Date.now();
  const start = Date.now();
  const data = { id, name, mode, start, tarif: globalTarif };

  if (mode === "limité") {
    data.minutes = minutes;
    data.end = start + minutes * 60000;
  }

  users[id] = data;
  saveUsers();
  renderUsers();
  document.getElementById("username").value = "";
  document.getElementById("minutes").value = "";
    closeModal();
}

function renderUsers() {
  const limited = document.getElementById("limitedUsers");
  const unlimited = document.getElementById("unlimitedUsers");
  limited.innerHTML = "";
  unlimited.innerHTML = "";

  Object.values(users).forEach((user) => {
    const container = document.createElement("div");
    container.className = "user";
    container.id = `user-${user.id}`;

    let content = `<strong id="name-${user.id}">${user.name}</strong> (${user.mode})<br>`;
    content += `<span id="info-${user.id}"></span><br>`;
    content += `<strong id="tarif-${user.id}"></strong><br>`;
    content += `<div class="alert" id="alert-${user.id}"></div>`;
    content += `
      <button onclick="editUser(${user.id})" class="warning">Modifier</button>
      <button onclick="deleteUser(${user.id})" class="danger">Supprimer</button>
    `;
    if (user.mode === "illimité") {
      content += `<button onclick="endSession(${user.id})">Finir</button>`;
    }

    container.innerHTML = content;
    if (user.mode === "limité") {
      limited.appendChild(container);
      startCountdown(user);
    } else {
      unlimited.appendChild(container);
      startTimer(user);
    }
  });

  document.getElementById("userCount").textContent = Object.keys(users).length;
}

function startCountdown(user) {
  const interval = setInterval(() => {
    const now = Date.now();
    const remaining = user.end - now;
    const el = document.getElementById(`info-${user.id}`);
    const alertEl = document.getElementById(`alert-${user.id}`);
    const tarifEl = document.getElementById(`tarif-${user.id}`);

    if (!el) return clearInterval(interval);
    if (remaining <= 0) {
      el.textContent = "Temps restant : 00:00";
      alertEl.textContent = "⛔ Temps écoulé !";
      document.getElementById("alarmSound").play();
      clearInterval(interval);
    } else {
      const min = Math.floor(remaining / 60000);
      const sec = Math.floor((remaining % 60000) / 1000);
      el.textContent = `Temps restant : ${min.toString().padStart(2, "0")}:${sec
        .toString()
        .padStart(2, "0")}`;
      tarifEl.textContent = `Tarif : ${user.minutes * user.tarif} Ariary`;
    }
  }, 1000);
}

function startTimer(user) {
  const interval = setInterval(() => {
    const now = Date.now();
    const elapsed = now - user.start;
    const min = Math.floor(elapsed / 60000);
    const sec = Math.floor((elapsed % 60000) / 1000);
    const el = document.getElementById(`info-${user.id}`);
    const tarifEl = document.getElementById(`tarif-${user.id}`);
    if (!el) return clearInterval(interval);
    el.textContent = `Temps écoulé : ${min.toString().padStart(2, "0")}:${sec
      .toString()
      .padStart(2, "0")}`;
    tarifEl.textContent = `Tarif : ${min * user.tarif} Ariary`;
  }, 1000);
}

function editUser(id) {
  const user = users[id];
  const newName = prompt("Nom :", user.name);
  if (!newName) return;
  user.name = newName;

  if (user.mode === "limité") {
    const newMinutes = parseInt(prompt("Temps (minutes) :", user.minutes));
    if (!isNaN(newMinutes) && newMinutes > 0) {
      user.minutes = newMinutes;
      user.end = Date.now() + newMinutes * 60000;
    }
  }

  saveUsers();
  renderUsers();
}

function deleteUser(id) {
  if (confirm("Supprimer cet utilisateur ?")) {
    delete users[id];
    saveUsers();
    renderUsers();
  }
}

function endSession(id) {
  const user = users[id];
  const now = Date.now();
  const min = Math.ceil((now - user.start) / 60000);
  const price = min * user.tarif;
  alert(`Session terminée.\nDurée : ${min} min\nPrix : ${price} Ariary`);
  delete users[id];
  saveUsers();
  renderUsers();
}

function updateTarifs() {
  Object.values(users).forEach((user) => {
    user.tarif = globalTarif;
  });
  saveUsers();
  renderUsers();
}

function saveUsers() {
  localStorage.setItem("wifi_users", JSON.stringify(users));
}



// MODAL LOGIC
function openModal() {
  document.getElementById("modal").style.display = "block";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

// Gère l’affichage du champ de temps
document.getElementById("mode").addEventListener("change", () => {
  const mode = document.getElementById("mode").value;
  document.getElementById("time-group").style.display = mode === "limité" ? "block" : "none";
});

// Fermer si on clique en dehors
window.onclick = function(event) {
  const modal = document.getElementById("modal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
};


renderUsers();
