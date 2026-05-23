const STORAGE_KEYS = {
    favorites: "beatz_flow_favorites",
    uploads: "beatz_flow_uploads",
    auth: "beatz_flow_auth",
    users: "beatz_flow_users"
};

const DEFAULT_FAVORITES = [{ id: "song-1", title: "Midnight City", artist: "M83" }];
const DEFAULT_UPLOADS = [{ id: "up-1", title: "Sample Community Beat", artist: "Prod. Unknown", filename: "sample-community-beat.mp3" }];

function loadJson(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
}

function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

(() => {
    let favoriteTracks = loadJson(STORAGE_KEYS.favorites, [...DEFAULT_FAVORITES]);
    let uploadedTracks = loadJson(STORAGE_KEYS.uploads, [...DEFAULT_UPLOADS]);
    let selectedFile = null;
    let isPlaying = false;

    const elements = {
        btnListen: document.getElementById("listen"),
        btnContribute: document.getElementById("contribute"),
        btnSettings: document.getElementById("settings"),
        btnQuicky: document.getElementById("quicky"),
        btnAuthTrigger: document.getElementById("auth-trigger-btn"),
        authModal: document.getElementById("auth-modal"),
        closeAuthModal: document.getElementById("close-auth-modal"),
        tabLogin: document.getElementById("tab-login"),
        tabSignup: document.getElementById("tab-signup"),
        secondLvContainer: document.getElementById("second-lv"),
        menuListen: document.getElementById("listen-s"),
        menuContribute: document.getElementById("contribute-s"),
        menuSettings: document.getElementById("settings-menu"),
        menuQuicky: document.getElementById("quicky-menu"),
        quickyAddableList: document.getElementById("quicky-addable-list"),
        viewHome: document.getElementById("view-home"),
        viewBrowse: document.getElementById("view-browse"),
        viewPlaylists: document.getElementById("view-playlists"),
        viewUpload: document.getElementById("view-upload"),
        viewSettings: document.getElementById("view-settings"),
        btnMyMusic: document.getElementById("my-music"),
        btnTopCharts: document.getElementById("top-charts"),
        btnManageUp: document.getElementById("manage-up"),
        btnGeneralSettings: document.getElementById("general-settings"),
        manageModal: document.getElementById("manage-uploads-modal"),
        closeManageModal: document.getElementById("close-manage-modal"),
        userUploadsList: document.getElementById("user-uploads-list"),
        uploadForm: document.getElementById("uploadForm"),
        audioFileInput: document.getElementById("audioFile"),
        dropZone: document.getElementById("dropZone"),
        dropZoneText: document.getElementById("dropZoneText"),
        progressBarContainer: document.getElementById("uploadProgressContainer"),
        progressBar: document.getElementById("uploadProgressBar"),
        songRowPlayBtn: document.getElementById("playBtn"),
        mainPlayBtn: document.getElementById("mainPlayBtn"),
        heartBtn: document.querySelector(".heart-btn"),
        downloadBtn: document.getElementById("downloadBtn"),
        shareBtn: document.getElementById("shareBtn"),
        clearCacheBtn: document.querySelector(".purge-cache-btn"),
        loginForm: document.getElementById("login-form"),
        signupForm: document.getElementById("signup-form")
    };

    const viewPanels = [elements.viewHome, elements.viewBrowse, elements.viewPlaylists, elements.viewUpload, elements.viewSettings];

    function showAlert(message) {
        window.alert(message);
    }

    function saveFavorites() {
        saveJson(STORAGE_KEYS.favorites, favoriteTracks);
    }

    function saveUploads() {
        saveJson(STORAGE_KEYS.uploads, uploadedTracks);
    }

    function saveAuth(user) {
        saveJson(STORAGE_KEYS.auth, user);
        updateAccountButton();
    }

    function loadUsers() {
        return loadJson(STORAGE_KEYS.users, []);
    }

    function saveUsers(users) {
        saveJson(STORAGE_KEYS.users, users);
    }

    function switchActiveWorkspaceView(targetViewPanel) {
        viewPanels.forEach((panel) => {
            if (!panel) return;
            panel.classList.toggle("hidden", panel !== targetViewPanel);
        });
    }

    function toggleSecondLevelView(activeTarget) {
        const targets = [elements.menuListen, elements.menuContribute, elements.menuSettings, elements.menuQuicky];
        const anyVisible = targets.some((target) => target === activeTarget);

        targets.forEach((target) => {
            if (!target) return;
            target.classList.toggle("hidden", target !== activeTarget);
        });

        if (elements.secondLvContainer) {
            elements.secondLvContainer.classList.toggle("active-open", anyVisible);
        }
    }

    function showLoginTab() {
        if (elements.authModal) elements.authModal.setAttribute("data-view", "login");
        if (elements.tabLogin) elements.tabLogin.classList.add("active");
        if (elements.tabSignup) elements.tabSignup.classList.remove("active");
    }

    function showSignupTab() {
        if (elements.authModal) elements.authModal.setAttribute("data-view", "signup");
        if (elements.tabSignup) elements.tabSignup.classList.add("active");
        if (elements.tabLogin) elements.tabLogin.classList.remove("active");
    }

    function openAuthModal() {
        if (!elements.authModal) return;
        elements.authModal.classList.remove("hidden");
        showLoginTab();
    }

    function closeAuthModal() {
        if (!elements.authModal) return;
        elements.authModal.classList.add("hidden");
    }

    function buildQuickyAddables() {
        if (!elements.quickyAddableList) return;
        elements.quickyAddableList.innerHTML = "";

        if (!favoriteTracks.length) {
            elements.quickyAddableList.innerHTML = '<p class="empty-fallback">No tracks pinned yet.</p>';
            return;
        }

        favoriteTracks.forEach((track) => {
            const item = document.createElement("div");
            item.className = "quicky-shortcut-item";
            item.innerHTML = `
                <div class="quicky-shortcut-meta">
                    <span class="quicky-shortcut-title">🎵 ${track.title}</span>
                    <span class="quicky-shortcut-artist">${track.artist}</span>
                </div>
                <button type="button" class="quicky-remove-btn" title="Remove Shortcut">✕</button>
            `;

            item.querySelector(".quicky-remove-btn").addEventListener("click", (event) => {
                event.stopPropagation();
                favoriteTracks = favoriteTracks.filter((entry) => entry.id !== track.id);
                saveFavorites();
                buildQuickyAddables();
            });

            elements.quickyAddableList.appendChild(item);
        });
    }

    function renderUploadedTracks() {
        if (!elements.userUploadsList) return;
        elements.userUploadsList.innerHTML = "";

        if (!uploadedTracks.length) {
            elements.userUploadsList.innerHTML = '<p class="empty-fallback" style="margin-top:20px;">You haven\'t uploaded any songs yet.</p>';
            return;
        }

        uploadedTracks.forEach((track) => {
            const item = document.createElement("div");
            item.className = "quicky-shortcut-item";
            item.innerHTML = `
                <div class="quicky-shortcut-meta" style="max-width: 75%;">
                    <span class="quicky-shortcut-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${track.title}</span>
                    <span class="quicky-shortcut-artist">${track.artist}</span>
                </div>
                <button type="button" class="quicky-remove-btn delete-upload-btn" data-id="${track.id}">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;

            item.querySelector(".delete-upload-btn").addEventListener("click", () => {
                if (!confirm(`Are you sure you want to delete "${track.title}"?`)) return;
                uploadedTracks = uploadedTracks.filter((entry) => entry.id !== track.id);
                saveUploads();
                renderUploadedTracks();
            });

            elements.userUploadsList.appendChild(item);
        });
    }

    function updateAccountButton() {
        if (!elements.btnAuthTrigger) return;
        const user = loadJson(STORAGE_KEYS.auth, null);
        elements.btnAuthTrigger.title = user?.username ? `Signed in as ${user.username}` : "Account Options";
        elements.btnAuthTrigger.style.backgroundColor = user?.username ? "#1db954" : "#282828";
    }

    function handleFileSelection(file) {
        if (!file) return;
        if (!/^audio\/(mpeg|mp3)$/.test(file.type)) {
            showAlert("Invalid file format. Please upload a valid MP3 file.");
            return;
        }

        selectedFile = file;
        if (elements.dropZoneText) {
            elements.dropZoneText.innerText = `Selected: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`;
            elements.dropZoneText.style.color = "#1db954";
        }
    }

    function togglePlayback() {
        isPlaying = !isPlaying;
        const iconClass = isPlaying ? "fa-solid fa-circle-pause" : "fa-solid fa-circle-play";

        if (elements.songRowPlayBtn?.querySelector("i")) {
            elements.songRowPlayBtn.querySelector("i").className = iconClass;
        }
        if (elements.mainPlayBtn?.querySelector("i")) {
            elements.mainPlayBtn.querySelector("i").className = iconClass;
        }
    }

    async function loginWithRemote(email, password) {
        try {
            const response = await fetch(`${window.location.origin}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                return { success: false, error: errorBody.error || "Login failed." };
            }

            const data = await response.json();
            return {
                success: true,
                username: data.username || email.split("@")[0],
                email: data.user || email
            };
        } catch {
            return { success: false, error: "Live login service is unavailable. Please use a saved account." };
        }
    }

    async function handleLoginSubmit(event) {
        event.preventDefault();
        const email = document.getElementById("login-email")?.value.trim();
        const password = document.getElementById("login-password")?.value;

        if (!email || !password) {
            showAlert("Email and password are required.");
            return;
        }

        const users = loadUsers();
        const storedUser = users.find((user) => user.email === email && user.password === password);

        if (storedUser) {
            saveAuth(storedUser);
            closeAuthModal();
            showAlert(`Welcome back, ${storedUser.username}!`);
            return;
        }

        const remoteUser = await loginWithRemote(email, password);
        if (remoteUser.success) {
            saveAuth(remoteUser);
            closeAuthModal();
            showAlert(`Welcome back, ${remoteUser.username}!`);
            return;
        }

        showAlert(remoteUser.error || "Sign in failed. Please check your credentials.");
    }

    function handleSignupSubmit(event) {
        event.preventDefault();
        const username = document.getElementById("signup-username")?.value.trim();
        const email = document.getElementById("signup-email")?.value.trim();
        const password = document.getElementById("signup-password")?.value;

        if (!username || !email || !password) {
            showAlert("All fields are required.");
            return;
        }

        const users = loadUsers();
        if (users.some((user) => user.email === email)) {
            showAlert("An account with that email already exists.");
            return;
        }

        const newUser = { username, email, password };
        users.push(newUser);
        saveUsers(users);
        saveAuth(newUser);
        closeAuthModal();
        showAlert(`Account created for ${username}. You are now signed in.`);
    }

    if (elements.btnListen) {
        elements.btnListen.addEventListener("click", () => {
            toggleSecondLevelView(elements.menuListen);
        });
    }

    if (elements.btnContribute) {
        elements.btnContribute.addEventListener("click", () => {
            switchActiveWorkspaceView(elements.viewUpload);
            toggleSecondLevelView(null);
        });
    }

    if (elements.btnSettings) {
        elements.btnSettings.addEventListener("click", () => {
            switchActiveWorkspaceView(elements.viewSettings);
            toggleSecondLevelView(elements.menuSettings);
        });
    }

    if (elements.btnQuicky) {
        elements.btnQuicky.addEventListener("click", () => {
            toggleSecondLevelView(elements.menuQuicky);
            buildQuickyAddables();
        });
    }

    if (elements.btnMyMusic) {
        elements.btnMyMusic.addEventListener("click", () => {
            switchActiveWorkspaceView(elements.viewHome);
            toggleSecondLevelView(null);
        });
    }

    if (elements.btnTopCharts) {
        elements.btnTopCharts.addEventListener("click", () => {
            switchActiveWorkspaceView(elements.viewBrowse);
            toggleSecondLevelView(null);
        });
    }

    if (elements.btnGeneralSettings) {
        elements.btnGeneralSettings.addEventListener("click", () => {
            switchActiveWorkspaceView(elements.viewSettings);
            toggleSecondLevelView(null);
        });
    }

    if (elements.btnManageUp) {
        elements.btnManageUp.addEventListener("click", () => {
            renderUploadedTracks();
            if (elements.manageModal) elements.manageModal.classList.remove("hidden");
        });
    }

    if (elements.closeManageModal) {
        elements.closeManageModal.addEventListener("click", () => {
            if (elements.manageModal) elements.manageModal.classList.add("hidden");
        });
    }

    if (elements.manageModal) {
        elements.manageModal.addEventListener("click", (event) => {
            if (event.target === elements.manageModal) elements.manageModal.classList.add("hidden");
        });
    }

    if (elements.btnAuthTrigger) {
        elements.btnAuthTrigger.addEventListener("click", openAuthModal);
    }

    if (elements.closeAuthModal) {
        elements.closeAuthModal.addEventListener("click", closeAuthModal);
    }

    if (elements.authModal) {
        elements.authModal.addEventListener("click", (event) => {
            if (event.target === elements.authModal) closeAuthModal();
        });
    }

    if (elements.tabLogin) {
        elements.tabLogin.addEventListener("click", showLoginTab);
    }

    if (elements.tabSignup) {
        elements.tabSignup.addEventListener("click", showSignupTab);
    }

    if (elements.dropZone && elements.audioFileInput) {
        elements.dropZone.addEventListener("click", () => elements.audioFileInput.click());

        elements.audioFileInput.addEventListener("change", (event) => {
            if (event.target.files.length > 0) handleFileSelection(event.target.files[0]);
        });

        elements.dropZone.addEventListener("dragover", (event) => {
            event.preventDefault();
            elements.dropZone.style.borderColor = "#1db954";
        });

        elements.dropZone.addEventListener("dragleave", () => {
            elements.dropZone.style.borderColor = "#404040";
        });

        elements.dropZone.addEventListener("drop", (event) => {
            event.preventDefault();
            elements.dropZone.style.borderColor = "#404040";
            if (event.dataTransfer.files.length > 0) handleFileSelection(event.dataTransfer.files[0]);
        });
    }

    if (elements.uploadForm) {
        elements.uploadForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            if (!selectedFile) {
                showAlert("Please select or drop an MP3 audio file first.");
                return;
            }

            const title = document.getElementById("trackTitle")?.value.trim();
            const artist = document.getElementById("trackArtist")?.value.trim();

            if (!title || !artist) {
                showAlert("Please provide both a title and artist name.");
                return;
            }

            if (elements.progressBarContainer) elements.progressBarContainer.classList.remove("hidden");
            if (elements.progressBar) elements.progressBar.style.width = "10%";

            let progressStep = 1;
            const progressTimer = setInterval(() => {
                progressStep += 1;
                if (elements.progressBar) {
                    elements.progressBar.style.width = `${Math.min(100, (progressStep / 4) * 100)}%`;
                }
                if (progressStep >= 4) clearInterval(progressTimer);
            }, 250);

            await new Promise((resolve) => setTimeout(resolve, 850));
            clearInterval(progressTimer);

            uploadedTracks.unshift({
                id: `up-${Date.now()}`,
                title,
                artist,
                filename: selectedFile.name
            });
            saveUploads();

            if (elements.progressBar) elements.progressBar.style.width = "100%";
            showAlert("Track successfully uploaded to your local library!");
            elements.uploadForm.reset();
            selectedFile = null;

            if (elements.dropZoneText) {
                elements.dropZoneText.innerText = "Click or drag an MP3 audio track container here";
                elements.dropZoneText.style.color = "#b3b3b3";
            }

            if (elements.progressBarContainer) elements.progressBarContainer.classList.add("hidden");
            renderUploadedTracks();
        });
    }

    if (elements.songRowPlayBtn) {
        elements.songRowPlayBtn.addEventListener("click", togglePlayback);
    }

    if (elements.mainPlayBtn) {
        elements.mainPlayBtn.addEventListener("click", togglePlayback);
    }

    if (elements.heartBtn) {
        elements.heartBtn.addEventListener("click", () => {
            const icon = elements.heartBtn.querySelector("i");
            icon.classList.toggle("fa-regular");
            icon.classList.toggle("fa-solid");
            elements.heartBtn.style.color = icon.classList.contains("fa-solid") ? "#1db954" : "#b3b3b3";
        });
    }

    if (elements.downloadBtn) {
        elements.downloadBtn.addEventListener("click", () => {
            showAlert("Starting track download: Midnight City - M83.mp3");
        });
    }

    if (elements.shareBtn) {
        elements.shareBtn.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(window.location.href);
                showAlert("Share link successfully copied to clipboard!");
            } catch {
                window.prompt("Copy this share link:", window.location.href);
            }
        });
    }

    if (elements.clearCacheBtn) {
        elements.clearCacheBtn.addEventListener("click", () => {
            localStorage.removeItem(STORAGE_KEYS.favorites);
            localStorage.removeItem(STORAGE_KEYS.uploads);
            localStorage.removeItem(STORAGE_KEYS.auth);
            favoriteTracks = [...DEFAULT_FAVORITES];
            uploadedTracks = [...DEFAULT_UPLOADS];
            saveFavorites();
            saveUploads();
            buildQuickyAddables();
            renderUploadedTracks();
            updateAccountButton();
            showAlert("Local cache has been cleared.");
        });
    }

    if (elements.loginForm) {
        elements.loginForm.addEventListener("submit", handleLoginSubmit);
    }

    if (elements.signupForm) {
        elements.signupForm.addEventListener("submit", handleSignupSubmit);
    }

    const shuffleBtn = document.querySelector(".fa-shuffle")?.parentElement;
    const repeatBtn = document.querySelector(".fa-repeat")?.parentElement;

    if (shuffleBtn) {
        shuffleBtn.addEventListener("click", () => {
            shuffleBtn.classList.toggle("active-mode");
            shuffleBtn.style.color = shuffleBtn.classList.contains("active-mode") ? "#1db954" : "#b3b3b3";
        });
    }

    if (repeatBtn) {
        repeatBtn.addEventListener("click", () => {
            repeatBtn.classList.toggle("active-mode");
            repeatBtn.style.color = repeatBtn.classList.contains("active-mode") ? "#1db954" : "#b3b3b3";
        });
    }

    buildQuickyAddables();
    renderUploadedTracks();
    updateAccountButton();
    switchActiveWorkspaceView(elements.viewHome);
    toggleSecondLevelView(null);
})();