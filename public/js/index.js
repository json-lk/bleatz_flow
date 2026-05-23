// Ensure this is initialized with your credentials before the DOM event fires
const supabaseUrl = 'https://xqihscjovjtgvvhbvcfn.supabase.co';
const supabaseKey = 'sb_publishable_vNYWCu6wtVZEOea1im3q5Q_mmzd6ka6';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. DATA CORE & PERSISTENT STATES
    // ==========================================
    let favoriteTracks = [{ id: "song-1", title: "Midnight City", artist: "M83" }];
    let uploadedTracks = [{ id: "up-1", title: "Sample Community Beat", artist: "Prod. Unknown" }];
    let isPlaying = false;
    let selectedFile = null;

    // ==========================================
    // 2. CENTRAL SELECTORS & DOM NODE MAPS
    // ==========================================
    // Navigation Triggers
    const btnListen = document.getElementById("listen");
    const btnContribute = document.getElementById("contribute");
    const btnSettings = document.getElementById("settings");
    const btnQuicky = document.getElementById("quicky");

    // Drawer Containers
    const secondLvContainer = document.getElementById("second-lv"); 
    const menuListen = document.getElementById("listen-s");
    const menuContribute = document.getElementById("contribute-s");
    const menuSettings = document.getElementById("settings-menu");
    const menuQuicky = document.getElementById("quicky-menu");
    const quickyAddableList = document.getElementById("quicky-addable-list");

    // View Canvas Target Interfaces
    const viewHome = document.getElementById("view-home");
    const viewBrowse = document.getElementById("view-browse");
    const viewPlaylists = document.getElementById("view-playlists");
    const viewUpload = document.getElementById("view-upload");
    const viewSettings = document.getElementById("view-settings");

    // Internal Submenu Navigation Selection Anchors
    const btnMyMusic = document.getElementById("my-music");
    const btnTopCharts = document.getElementById("top-charts");
    const btnManageUp = document.getElementById("manage-up");
    const btnGeneralSettings = document.getElementById("general-settings");

    // Modal Interaction Hub Nodes
    const manageModal = document.getElementById("manage-uploads-modal");
    const closeManageModal = document.getElementById("close-manage-modal");
    const userUploadsList = document.getElementById("user-uploads-list");

    // Unified File Form Stream Interfaces
    const uploadForm = document.getElementById("uploadForm");
    const audioFileInput = document.getElementById("audioFile");
    const dropZone = document.getElementById("dropZone");
    const dropZoneText = document.getElementById("dropZoneText");
    const progressBarContainer = document.getElementById("uploadProgressContainer");
    const progressBar = document.getElementById("uploadProgressBar");

    // Media Control Node Selectors
    const songRowPlayBtn = document.getElementById("playBtn");
    const mainPlayBtn = document.getElementById("mainPlayBtn");
    const heartBtn = document.querySelector(".heart-btn");
    const downloadBtn = document.getElementById("downloadBtn");
    const shareBtn = document.getElementById("shareBtn");

    // Structural Array Configurations
    const menuMap = [
        { trigger: btnListen, target: menuListen },
        { trigger: btnContribute, target: menuContribute },
        { trigger: btnSettings, target: menuSettings },
        { trigger: btnQuicky, target: menuQuicky }
    ];

    const viewPanels = [viewHome, viewBrowse, viewPlaylists, viewUpload, viewSettings];

    // ==========================================
    // 3. CORE WORKSPACE / VIEW CONTROLLER
    // ==========================================
    function switchActiveWorkspaceView(targetViewPanel) {
        viewPanels.forEach(panel => {
            if (panel) {
                if (panel === targetViewPanel) {
                    panel.classList.remove("hidden");
                } else {
                    panel.classList.add("hidden");
                }
            }
        });
    }

    function toggleSecondLevelView(activeTarget) {
        let anyMenuVisible = false;
        menuMap.forEach(item => {
            if (item.target === activeTarget) {
                item.target.classList.remove("hidden");
                anyMenuVisible = true;
            } else {
                item.target.classList.add("hidden");
            }
        });

        if (anyMenuVisible) {
            secondLvContainer.classList.add("active-open");
        } else {
            secondLvContainer.classList.remove("active-open");
        }
    }

    // Bind Primary Navigation Click Event Triggers
    menuMap.forEach(item => {
        if (item.trigger && item.target) {
            item.trigger.addEventListener("click", () => {
                if (!item.target.classList.contains("hidden")) {
                    toggleSecondLevelView(null);
                } else {
                    toggleSecondLevelView(item.target);
                    if (item.trigger === btnQuicky) buildQuickyAddables();
                }
            });
        }
    });

    // Wire Up Submenu Anchors to Switch Workspace Layout Panels Dynamically
    if (btnMyMusic) btnMyMusic.addEventListener("click", () => switchActiveWorkspaceView(viewHome));
    if (btnTopCharts) btnTopCharts.addEventListener("click", () => switchActiveWorkspaceView(viewBrowse));
    if (btnGeneralSettings) btnGeneralSettings.addEventListener("click", () => switchActiveWorkspaceView(viewSettings));
    
    // Ensure the main Contribute action switches straight to the upload view form block
    if (btnContribute) btnContribute.addEventListener("click", () => switchActiveWorkspaceView(viewUpload));

    // ==========================================
    // 4. QUICK ACCESS TRACK MANAGEMENT LOGIC
    // ==========================================
    function buildQuickyAddables() {
        if (!quickyAddableList) return;
        quickyAddableList.innerHTML = "";
        
        if (favoriteTracks.length === 0) {
            quickyAddableList.innerHTML = `<p class="empty-fallback">No tracks pinned yet.</p>`;
            return;
        }

        favoriteTracks.forEach(track => {
            const trackItem = document.createElement("div");
            trackItem.className = "quicky-shortcut-item";
            trackItem.innerHTML = `
                <div class="quicky-shortcut-meta">
                    <span class="quicky-shortcut-title">🎵 ${track.title}</span>
                    <span class="quicky-shortcut-artist">${track.artist}</span>
                </div>
                <button type="button" class="quicky-remove-btn" title="Remove Shortcut">✕</button>
            `;
            
            const removeBtn = trackItem.querySelector(".quicky-remove-btn");
            removeBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                favoriteTracks = favoriteTracks.filter(t => t.id !== track.id);
                buildQuickyAddables();
            });
            
            quickyAddableList.appendChild(trackItem);
        });
    }

    // ==========================================
    // 5. MANAGE UPLOADS TABLE WINDOW ENGINE
    // ==========================================
    if (btnManageUp) {
        btnManageUp.addEventListener("click", () => {
            renderUploadedTracks();
            if (manageModal) manageModal.classList.remove("hidden");
        });
    }

    if (closeManageModal) {
        closeManageModal.addEventListener("click", () => {
            manageModal.classList.add("hidden");
        });
    }

    if (manageModal) {
        manageModal.addEventListener("click", (e) => {
            if (e.target === manageModal) {
                manageModal.classList.add("hidden");
            }
        });
    }

    function renderUploadedTracks() {
        if (!userUploadsList) return;
        userUploadsList.innerHTML = "";
        
        if (uploadedTracks.length === 0) {
            userUploadsList.innerHTML = `<p class="empty-fallback" style="margin-top:20px;">You haven't uploaded any songs yet.</p>`;
            return;
        }

        uploadedTracks.forEach(track => {
            const itemRow = document.createElement("div");
            itemRow.className = "quicky-shortcut-item"; 
            itemRow.style.marginHeight = "auto";
            
            itemRow.innerHTML = `
                <div class="quicky-shortcut-meta" style="max-width: 75%;">
                    <span class="quicky-shortcut-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${track.title}</span>
                    <span class="quicky-shortcut-artist">${track.artist}</span>
                </div>
                <button type="button" class="quicky-remove-btn delete-upload-btn" data-id="${track.id}">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;

            const deleteButton = itemRow.querySelector(".delete-upload-btn");
            deleteButton.addEventListener("click", async () => {
                if (confirm(`Are you sure you want to delete "${track.title}" from storage?`)) {
                    // Extract filename out of track profile if tracking public paths
                    const fileName = track.storagePath || track.id;
                    
                    // Delete from Supabase Storage Bucket
                    const { error } = await supabase.storage
                        .from('audio-files')
                        .remove([fileName]);

                    if (error) {
                        alert(`Failed deleting target track: ${error.message}`);
                        return;
                    }

                    uploadedTracks = uploadedTracks.filter(t => t.id !== track.id);
                    console.log(`Removed storage asset entry: ${track.id}`);
                    renderUploadedTracks(); 
                }
            });

            userUploadsList.appendChild(itemRow);
        });
    }

    // ==========================================
    // 6. SUPABASE STORAGE DATA PIPE TRANSMITTER
    // ==========================================
    if (dropZone) dropZone.addEventListener("click", () => audioFileInput.click());

    if (audioFileInput) {
        audioFileInput.addEventListener("change", (e) => {
            if (e.target.files.length > 0) {
                handleFileSelection(e.target.files[0]);
            }
        });
    }

    if (dropZone) {
        dropZone.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropZone.style.borderColor = "#1db954";
        });

        dropZone.addEventListener("dragleave", () => {
            dropZone.style.borderColor = "#404040";
        });

        dropZone.addEventListener("drop", (e) => {
            e.preventDefault();
            dropZone.style.borderColor = "#404040";
            if (e.dataTransfer.files.length > 0) {
                handleFileSelection(e.dataTransfer.files[0]);
            }
        });
    }

    function handleFileSelection(file) {
        if (file.type !== "audio/mpeg" && file.type !== "audio/mp3") {
            alert("Invalid file format. Please drop a valid MP3 file.");
            return;
        }
        selectedFile = file;
        dropZoneText.innerText = `Selected: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`;
        dropZoneText.style.color = "#1db954";
    }

    if (uploadForm) {
        uploadForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            if (!selectedFile) {
                alert("Please select or drop an MP3 audio file first.");
                return;
            }

            const title = document.getElementById("trackTitle").value;
            const artist = document.getElementById("trackArtist").value;
            
            progressBarContainer.classList.remove("hidden");
            progressBar.style.width = "10%"; // Initial visual loading feedback

            try {
                console.log("🔒 Initiating pipeline transfer to Supabase Storage Bucket...");
                
                // Formulate a distinct storage name string to avoid naming conflicts
                const fileExtension = selectedFile.name.split('.').pop();
                const uniqueStorageName = `track-${Date.now()}.${fileExtension}`;

                // 1. Core Upload Call to Supabase bucket
                const { data, error } = await supabase.storage
                    .from('audio-files') // Make sure this matches your exact bucket name!
                    .upload(uniqueStorageName, selectedFile, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (error) throw error;
                
                progressBar.style.width = "70%"; // Complete transfer feedback

                // 2. Extract public URL delivery path 
                const { data: publicUrlData } = supabase.storage
                    .from('audio-files')
                    .getPublicUrl(uniqueStorageName);

                const permanentPublicUrl = publicUrlData.publicUrl;
                progressBar.style.width = "100%";
                
                console.log(`✅ File pipeline complete. Public streaming address generated: ${permanentPublicUrl}`);

                // Update runtime arrays tracking tracks
                uploadedTracks.push({
                    id: `up-${Date.now()}`,
                    title: title,
                    artist: artist,
                    storagePath: uniqueStorageName, // Saved so we can delete it later
                    url: permanentPublicUrl
                });

                alert("Track successfully uploaded and published to Supabase Storage!");
                
                // Hard reset form interfaces back to neutral defaults
                uploadForm.reset();
                dropZoneText.innerText = "Click or drag an MP3 file here";
                dropZoneText.style.color = "#b3b3b3";
                progressBarContainer.classList.add("hidden");
                selectedFile = null;

                // Re-render data tables automatically if modal tracking is open
                renderUploadedTracks();

            } catch (err) {
                console.error("Critical Storage Sync Interruption: ", err);
                alert(`Upload error context: ${err.message}`);
                progressBarContainer.classList.add("hidden");
            }
        });
    }

    // ==========================================
    // 7. CORE MEDIA HARDWARE EXECUTION LAYER
    // ==========================================
    function togglePlaybackState() {
        isPlaying = !isPlaying;
        
        const trackIcon = songRowPlayBtn ? songRowPlayBtn.querySelector("i") : null;
        const masterIcon = mainPlayBtn ? mainPlayBtn.querySelector("i") : null;

        if (isPlaying) {
            if (trackIcon) trackIcon.className = "fa-solid fa-circle-pause";
            if (masterIcon) masterIcon.className = "fa-solid fa-circle-pause";
            console.log("🔊 Audio Context Started: Playing 'Midnight City'...");
        } else {
            if (trackIcon) trackIcon.className = "fa-solid fa-circle-play";
            if (masterIcon) masterIcon.className = "fa-solid fa-circle-play";
            console.log("⏸️ Audio Context Paused.");
        }
    }

    if (songRowPlayBtn) songRowPlayBtn.addEventListener("click", togglePlaybackState);
    if (mainPlayBtn) mainPlayBtn.addEventListener("click", togglePlaybackState);

    if (heartBtn) {
        heartBtn.addEventListener("click", () => {
            const icon = heartBtn.querySelector("i");
            icon.classList.toggle("fa-regular");
            icon.classList.toggle("fa-solid");
            
            if (icon.classList.contains("fa-solid")) {
                heartBtn.style.color = "#1db954";
                console.log("❤️ Added to library favorites.");
            } else {
                heartBtn.style.color = "#b3b3b3";
                console.log("💔 Removed from library favorites.");
            }
        });
    }

    if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            alert("Starting track download: Midnight City - M83.mp3");
        });
    }

    if (shareBtn) {
        shareBtn.addEventListener("click", () => {
            navigator.clipboard.writeText(window.location.href).then(() => {
                alert("Share link successfully copied to clipboard!");
            });
        });
    }

    // Auxiliary Utility Secondary Triggers
    const shuffleBtn = document.querySelector(".fa-shuffle")?.parentElement;
    const repeatBtn = document.querySelector(".fa-repeat")?.parentElement;
    const skipBackBtn = document.querySelector(".fa-backward-step")?.parentElement;
    const skipForwardBtn = document.querySelector(".fa-forward-step")?.parentElement;

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

    if (skipBackBtn) skipBackBtn.addEventListener("click", () => console.log("⏮️ Re-winding track."));
    if (skipForwardBtn) skipForwardBtn.addEventListener("click", () => console.log("⏭️ Skipping forward."));
    
    // Initial run to clear default placeholders
    buildQuickyAddables();
});