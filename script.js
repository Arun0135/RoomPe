
// ==========================================================================
// 🚀 PREMIUM LOADER ENGINE (With Animation Fix)
// ==========================================================================
function hideAppLoader() {
    let loader = document.getElementById('roompe-global-loader');
    
    // 🚨 SMART LOGIC: Loader hatne se pehle hi Dashboard ko ready kar lo taaki Gray screen na aaye
    let activeScreen = document.querySelector('.screen:not(.hidden)');
    if (!activeScreen) {
        let dash = document.getElementById('screen-dashboard');
        let nav = document.getElementById('global-nav');
        
        if (dash) {
            dash.classList.remove('hidden');
            dash.classList.add('screen-enter'); // Ye wahi CSS magic hai jo slide-up karega
        }
        if (nav) nav.classList.remove('hidden');
    }

    if(loader) {
        setTimeout(() => {
            loader.classList.add('hide-loader'); 
            
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500); 
        }, 800); 
    }
}

window.addEventListener('load', hideAppLoader);
// 🚨 SMART TRIGGER: Page ka saara CSS/Images load hone par hi ye trigger hoga
window.addEventListener('load', hideAppLoader);
// ==========================================================================
// 🔔 CUSTOM ROOMPE POPUP ENGINE
// ==========================================================================

function showPopup(type, title, message, actionCallback = null) {
  const overlay = document.getElementById('roompe-popup-overlay');
  const box = document.getElementById('roompe-popup-box');
  const iconBox = document.getElementById('roompe-popup-icon');
  const btnBox = document.getElementById('roompe-popup-buttons');
  
  document.getElementById('roompe-popup-title').innerText = title;
  document.getElementById('roompe-popup-msg').innerText = message;

  window.tempPopupCallback = actionCallback; 
  let okayAction = `closePopup(); if(window.tempPopupCallback) window.tempPopupCallback();`;

  if (type === 'success') {
    iconBox.innerHTML = '<span class="material-symbols-outlined" style="color:#10b981; font-size:32px;">check_circle</span>';
    iconBox.style.background = '#dcfce7';
    btnBox.innerHTML = `<button onclick="${okayAction}" style="width:100%; padding:14px; background:#10b981; color:white; border:none; border-radius:12px; font-weight:800; font-size:15px; cursor:pointer;">Awesome</button>`;
  } else if (type === 'error') {
    iconBox.innerHTML = '<span class="material-symbols-outlined" style="color:#ef4444; font-size:32px;">error</span>';
    iconBox.style.background = '#fee2e2';
    btnBox.innerHTML = `<button onclick="${okayAction}" style="width:100%; padding:14px; background:#ef4444; color:white; border:none; border-radius:12px; font-weight:800; font-size:15px; cursor:pointer;">Okay</button>`;
  } else if (type === 'confirm') {
    iconBox.innerHTML = '<span class="material-symbols-outlined" style="color:#f59e0b; font-size:32px;">help</span>';
    iconBox.style.background = '#fef3c7';
    btnBox.innerHTML = `
      <button onclick="closePopup()" style="flex:1; padding:14px; background:#f1f5f9; color:#475569; border:none; border-radius:12px; font-weight:800; font-size:15px; cursor:pointer;">Cancel</button>
      <button onclick="${okayAction}" style="flex:1; padding:14px; background:#059669; color:white; border:none; border-radius:12px; font-weight:800; font-size:15px; cursor:pointer;">Yes, Do it</button>
    `;
  }

  overlay.style.display = 'flex';
  setTimeout(() => {
    box.style.opacity = '1';
    box.style.transform = 'scale(1)';
  }, 10);
}

function closePopup() {
  const overlay = document.getElementById('roompe-popup-overlay');
  const box = document.getElementById('roompe-popup-box');
  box.style.opacity = '0';
  box.style.transform = 'scale(0.9)';
  setTimeout(() => { overlay.style.display = 'none'; }, 200);
}

// ==========================================================================
// ROOMPE APP - GLOBALS & SCREEN TRANSITIONS
// ==========================================================================

var currentRoomFilter = 'All';
var currentRoomSearch = '';
var currentMainTab = 'dashboard'; 
var currentBillingFilter = 'Received';
var currentRoomView = 'grid';

function goToLogin() {
  document.getElementById('screen-welcome').classList.add('hidden');
  document.getElementById('screen-login').classList.remove('hidden'); // 🚨 Yahi line missing thi!
  document.getElementById('screen-login').style.display = 'flex';
}

function goToSetup() {
  document.getElementById('screen-otp').classList.add('hidden');
  document.getElementById('screen-setup').classList.remove('hidden');
}

function goToDashboard() {
  document.getElementById('screen-setup').classList.add('hidden');
  document.getElementById('screen-dashboard').classList.remove('hidden');
}

function selectProperty(clickedCard) {
  let cards = document.querySelectorAll('.prop-card');
  cards.forEach(card => card.classList.remove('active'));
  clickedCard.classList.add('active');
}

// ==========================================================================
// 2. MASTER DATABASE LAYER (Rooms + Properties + Bookings + Payments)
// ==========================================================================
var RoomPeDB = {
  init: function() {
    if(!localStorage.getItem('roompe_rooms')) { localStorage.setItem('roompe_rooms', JSON.stringify([])); }
    if(!localStorage.getItem('roompe_properties')) { localStorage.setItem('roompe_properties', JSON.stringify([])); }
    if(!localStorage.getItem('roompe_active_prop')) { localStorage.setItem('roompe_active_prop', ''); }
    if(!localStorage.getItem('roompe_bookings')) { localStorage.setItem('roompe_bookings', JSON.stringify([])); }
    if(!localStorage.getItem('roompe_payments')) { localStorage.setItem('roompe_payments', JSON.stringify([])); }
  },

  getRooms: function() { return JSON.parse(localStorage.getItem('roompe_rooms')) || []; },
  saveRooms: function(roomsArray) { 
    localStorage.setItem('roompe_rooms', JSON.stringify(roomsArray)); 
    if(window.triggerCloudSync) window.triggerCloudSync(); 
  },

  getProperties: function() {
    let props = localStorage.getItem('roompe_properties');
    return props ? JSON.parse(props) : [];
  },
  saveProperties: function(propsArray) { 
    localStorage.setItem('roompe_properties', JSON.stringify(propsArray)); 
    if(window.triggerCloudSync) window.triggerCloudSync(); 
  },
  
  getActiveProperty: function() {
    let active = localStorage.getItem('roompe_active_prop');
    let props = this.getProperties();
    if (active && props.some(p => p.id === active)) return active;
    if (props.length > 0) {
      localStorage.setItem('roompe_active_prop', props[0].id);
      return props[0].id;
    }
    return 'prop_default';
  },
  
  setActiveProperty: function(propId) { localStorage.setItem('roompe_active_prop', propId); },

  getBookings: function() { return JSON.parse(localStorage.getItem('roompe_bookings')) || []; },
  saveBookings: function(b) { 
    localStorage.setItem('roompe_bookings', JSON.stringify(b)); 
    if(window.triggerCloudSync) window.triggerCloudSync(); 
  },
  getActivePropertyBookings: function() {
    let all = this.getBookings();
    let activeId = this.getActiveProperty();
    return all.filter(b => b.propId === activeId || (!b.propId && activeId === 'prop_default'));
  },

  getPayments: function() { return JSON.parse(localStorage.getItem('roompe_payments')) || []; },
  savePayments: function(p) { 
    localStorage.setItem('roompe_payments', JSON.stringify(p)); 
    if(window.triggerCloudSync) window.triggerCloudSync(); 
  },
  getActivePropertyPayments: function() {
    let all = this.getPayments();
    let activeId = this.getActiveProperty();
    return all.filter(p => p.propId === activeId || (!p.propId && activeId === 'prop_default'));
  }
};
// ==========================================================================
// 🧑‍💼 MORE TAB & PROFILE EDIT ENGINE
// ==========================================================================

function updateMoreTabStats() {
  let props = RoomPeDB.getProperties();
  let totalProps = props.length;
  let allRooms = JSON.parse(localStorage.getItem('roompe_rooms')) || [];
  let totalRooms = allRooms.length; 
  
  let propCountEl = document.getElementById('more-prop-count');
  let roomCountEl = document.getElementById('more-room-count');
  let profileNameEl = document.getElementById('more-profile-name');
  let profileEmailEl = document.getElementById('more-profile-email');
  let avatar = document.getElementById('more-profile-img');
  
  if(propCountEl) propCountEl.innerText = totalProps;
  if(roomCountEl) roomCountEl.innerText = totalRooms;
  
  let userEmail = localStorage.getItem('roompe_logged_in_user') || 'owner@roompe.com';
  
  // 🚨 DATABASE SE USER KA CUSTOM DATA NIKALNA
  let savedName = localStorage.getItem('roompe_user_name');
  let savedPhone = localStorage.getItem('roompe_user_phone');
  let savedAvatar = localStorage.getItem('roompe_user_avatar');

  // Agar naam save nahi hai, toh email se bana lo (E.g. arun@gmail.com -> Arun)
  let userName = savedName;
  if(!userName) {
      userName = userEmail.split('@')[0]; 
      userName = userName.charAt(0).toUpperCase() + userName.slice(1); 
  }
  
  // Update HTML
  if(profileNameEl) profileNameEl.innerHTML = `${userName} <span style="font-size: 9px; background: #dcfce7; color: #16a34a; padding: 2px 6px; border-radius: 4px; font-weight: 700;">Verified</span>`;
  
  // Agar phone number save kiya hai toh wo dikhao, warna email dikhao
  if(profileEmailEl) profileEmailEl.innerText = savedPhone ? '+91 ' + savedPhone : userEmail;
  
  // Agar Custom Photo daali hai toh wo lagao, warna Initial wali lagao
  if(avatar) {
      if(savedAvatar) {
          avatar.src = savedAvatar;
      } else {
          avatar.src = `https://ui-avatars.com/api/?name=${userName}&background=059669&color=fff&size=150&bold=true`;
      }
  }
}

// 1. Edit Screen Kholna aur purana data bharna
function openEditProfileScreen() {
    let savedName = localStorage.getItem('roompe_user_name');
    let savedPhone = localStorage.getItem('roompe_user_phone') || '';
    let savedAvatar = localStorage.getItem('roompe_user_avatar');
    let userEmail = localStorage.getItem('roompe_logged_in_user') || 'owner@roompe.com';
    
    let defaultName = savedName || (userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1));
    
    document.getElementById('edit-profile-name').value = defaultName;
    document.getElementById('edit-profile-phone').value = savedPhone;
    
    let preview = document.getElementById('edit-profile-preview');
    preview.src = savedAvatar ? savedAvatar : `https://ui-avatars.com/api/?name=${defaultName}&background=059669&color=fff&size=150&bold=true`;
    
    openActionScreen('screen-edit-profile');
}

// 2. Photo Upload hone par usko Data URL (Photo) me convert karna
function handleProfilePicUpload(input) {
    if (input.files && input.files[0]) {
        let reader = new FileReader();
        reader.onload = function(e) {
            let base64Image = e.target.result; 
            document.getElementById('edit-profile-preview').src = base64Image; // Preview update
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// 3. Save Button dabane par Database me data daalna
function saveProfileDetails() {
    let newName = document.getElementById('edit-profile-name').value.trim();
    let newPhone = document.getElementById('edit-profile-phone').value.trim();
    let newAvatar = document.getElementById('edit-profile-preview').src;
    
    if(!newName) return alert("Bhai, naam toh daalna padega!");
    
    // Save to LocalStorage (Database)
    localStorage.setItem('roompe_user_name', newName);
    localStorage.setItem('roompe_user_phone', newPhone);
    
    // Sirf custom photo save karna (ui-avatars wali default link nahi)
    if(!newAvatar.includes('ui-avatars.com')) {
        localStorage.setItem('roompe_user_avatar', newAvatar);
    }

    // Refresh UI and Close Screen
    updateMoreTabStats();
    closeActionScreen();
    showPopup('success', 'Profile Updated', 'Your profile details have been saved successfully.');
}
// ==========================================================================
// 3. ROOMS SCREEN LOGIC & MASTER RENDER ENGINE
// ==========================================================================
function updateRoomStats(rooms) {
  let total = rooms.length;
  let occupied = rooms.filter(r => r.status === 'occupied').length;
  let available = rooms.filter(r => r.status === 'available').length;
  let cleaning = rooms.filter(r => r.status === 'cleaning').length;

  let topStats = document.querySelector('.grid-top-stats');
  if (topStats) {
    topStats.innerHTML = `
      <span class="material-symbols-outlined" style="color:#16A34A; font-size:18px;">domain</span>
      <strong>${total} Rooms</strong>
      <div class="stat-dot dot-red"></div> ${occupied} Occupied
      <div class="stat-dot dot-green"></div> ${available} Avail
      <div class="stat-dot dot-orange"></div> ${cleaning} Clean
    `;
  }

  let floatPill = document.querySelector('.floating-status-bar');
  if (floatPill) {
    floatPill.innerHTML = `
      <div class="stat-dot dot-green"></div> Avail (${available})
      <div class="stat-dot dot-red" style="margin-left:8px;"></div> Occ (${occupied})
      <div class="stat-dot dot-orange" style="margin-left:8px;"></div> Dirty (${cleaning})
    `;
  }

  let chipAll = document.getElementById('chip-count-all');
  let chipVacant = document.getElementById('chip-count-vacant');
  let chipOcc = document.getElementById('chip-count-occupied');
  let chipDirty = document.getElementById('chip-count-dirty');
  
  if (chipAll) chipAll.innerText = total;
  if (chipVacant) chipVacant.innerText = available;
  if (chipOcc) chipOcc.innerText = occupied;
  if (chipDirty) chipDirty.innerText = cleaning;
}

function quickBook(roomNo) {
  openActionScreen('screen-new-booking');
  let roomInput = document.getElementById('book-room-no');
  if (roomInput) roomInput.value = roomNo;
}

// --- MARK ROOM AS CLEAN ENGINE (Custom Popup Added) ---
function markRoomClean(roomNo) {
  // Purana 'confirm()' hata kar apna naya Premium Confirm lagaya
  showCustomPopup('confirm', 'Room Cleaned?', `Mark Room ${roomNo} as Clean & Available?`, function() {
    
    let rooms = RoomPeDB.getRooms(); 
    let activeId = RoomPeDB.getActiveProperty();
    
    // SMART LOCK: Sirf current active property ka room dhoondhega
    let roomIndex = rooms.findIndex(r => String(r.no) === String(roomNo) && (r.propertyId === activeId || (!r.propertyId && activeId === 'prop_default')));
    
    if (roomIndex !== -1) {
      // Room ko Available kar do
      rooms[roomIndex].status = 'available';
      rooms[roomIndex].guest = '';
      RoomPeDB.saveRooms(rooms);
      
      // UI Refresh karo
      if(typeof renderRoomsGrid === 'function') renderRoomsGrid();
      if(typeof updateDashboardStats === 'function') updateDashboardStats();
      
      // Success Message
      setTimeout(() => {
        showPopup('success', 'Room Ready', `Room ${roomNo} is now clean and available for booking.`);
      }, 400);

    } else {
      // Error ko bhi alert() ki jagah apne popup me dikhao
      showPopup('error', 'Error', 'Room not found in current property!');
    }
  });
}

function handleRoomSearch(query) {
  currentRoomSearch = query.toLowerCase().trim();
  renderRoomsGrid();
}

function toggleRoomView(viewType) {
  currentRoomView = viewType;
  let btnList = document.getElementById('view-btn-list');
  let btnGrid = document.getElementById('view-btn-grid');
  
  if(!btnList || !btnGrid) return;

  btnList.style.background = 'transparent'; btnList.style.color = '#64748b'; btnList.style.fontWeight = 'normal'; btnList.style.boxShadow = 'none';
  btnGrid.style.background = 'transparent'; btnGrid.style.color = '#64748b'; btnGrid.style.fontWeight = 'normal'; btnGrid.style.boxShadow = 'none';

  if(viewType === 'list') {
    btnList.style.background = 'white'; btnList.style.color = '#059669'; btnList.style.fontWeight = '600'; btnList.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
  } else {
    btnGrid.style.background = 'white'; btnGrid.style.color = '#059669'; btnGrid.style.fontWeight = '600'; btnGrid.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
  }
  renderRoomsGrid(); 
}

function setRoomFilter(filterName) {
  currentRoomFilter = filterName;
  document.querySelectorAll('.room-chip').forEach(chip => {
    chip.style.background = 'white';
    chip.style.color = '#64748b';
    chip.style.borderColor = '#e2e8f0';
    
    if(chip.innerText.includes(filterName)) {
      chip.style.background = '#059669';
      chip.style.color = 'white';
      chip.style.borderColor = '#059669';
    }
  });
  renderRoomsGrid(); 
}

// ==========================================================================
// 3. ROOMS SCREEN LOGIC & MASTER RENDER ENGINE (FIXED DISPLAY & DELETE)
// ==========================================================================
function renderRoomsGrid() {
  let allRooms = RoomPeDB.getRooms();
  let scrollArea = document.querySelector('#screen-rooms .rooms-scroll-area');
  if(!scrollArea) return;

  if (typeof updateRoomStats === 'function') updateRoomStats(allRooms);

  // 🧠 SMART CHECK: Property Daily (Hotel) hai ya Monthly (PG)?
  let props = RoomPeDB.getProperties();
  let activeProp = props.find(p => p.id === RoomPeDB.getActiveProperty());
  let isMonthlyProp = activeProp && activeProp.type === 'Monthly';

  let filteredRooms = allRooms.filter(room => {
    let matchesFilter = true;
    if (currentRoomFilter === 'Vacant') matchesFilter = (room.status === 'available');
    if (currentRoomFilter === 'Occupied') matchesFilter = (room.status === 'occupied');
    if (currentRoomFilter === 'Dirty') matchesFilter = (room.status === 'cleaning');

    let matchesSearch = true;
    if (currentRoomSearch !== '') {
      matchesSearch = (
        String(room.no).toLowerCase().includes(currentRoomSearch) ||
        (room.guest && room.guest.toLowerCase().includes(currentRoomSearch)) ||
        (room.cat && room.cat.toLowerCase().includes(currentRoomSearch))
      );
    }
    return matchesFilter && matchesSearch;
  });

  document.querySelectorAll('#screen-rooms .floor-header, #screen-rooms .room-grid-layout, #screen-rooms .room-list-layout').forEach(el => el.remove());

  if (filteredRooms.length === 0) {
    scrollArea.insertAdjacentHTML('beforeend', `<div class="floor-header" style="text-align:center; padding: 40px 20px; color: #94a3b8;">No rooms found.</div>`);
    return;
  }

  let floorsData = {};
  allRooms.forEach(room => {
    if(!floorsData[room.floor]) floorsData[room.floor] = { total: [], filtered: [] };
    floorsData[room.floor].total.push(room);
  });
  filteredRooms.forEach(room => {
    if(floorsData[room.floor]) floorsData[room.floor].filtered.push(room);
  });

  for (const [floorName, floorData] of Object.entries(floorsData)) {
    if (floorData.filtered.length === 0) continue; 

    let occupiedCount = floorData.total.filter(r => r.status === 'occupied').length;
    let occupancyPercent = Math.round((occupiedCount / floorData.total.length) * 100) || 0;

    let floorHTML = `
      <div class="floor-header" style="display: flex; justify-content: space-between; align-items: center; margin: 24px 0 12px;">
        <h4 style="margin: 0; font-size: 16px; color: #0f172a; font-weight: 800;">${floorName}</h4>
        <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; color: #64748b; font-weight: 600;">
          <span>${occupancyPercent}% Occupancy</span>
          <div style="width: 40px; height: 6px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
            <div style="width: ${occupancyPercent}%; height: 100%; background: #10b981; border-radius: 4px;"></div>
          </div>
        </div>
      </div>
    `;

    if (currentRoomView === 'grid') {
      floorHTML += `<div class="room-grid-layout" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;">`;
    } else {
      floorHTML += `<div class="room-list-layout" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">`;
    }

    floorData.filtered.forEach(room => {
      let shortCat = room.cat.split(' ')[0].toUpperCase();
      let cardClass = room.status === 'occupied' ? 'card-occupied' : (room.status === 'cleaning' ? 'card-cleaning' : 'card-available');
      let badgeClass = room.status === 'occupied' ? 'badge-red' : (room.status === 'cleaning' ? 'badge-orange' : 'badge-green');
      let icon = room.status === 'occupied' ? 'person_pin_circle' : (room.status === 'cleaning' ? 'cleaning_services' : 'key');
      let footerText = room.status === 'available' ? 'AVAILABLE' : (room.status === 'cleaning' ? 'CLEANING' : 'OCCUPIED');
      
      let footerIcon = '';
      let subText = '';
      let cardAction = '';

      if (room.status === 'occupied') {
        footerIcon = `<span class="material-symbols-outlined" onclick="event.stopPropagation(); openRoomDetails('${room.no}')">more_vert</span>`;
        subText = room.guest;
        cardAction = `onclick="openRoomDetails('${room.no}')"`;
      } else if (room.status === 'available') {
        // 🚨 NAYA UPDATE: Yahan Delete ke liye Edit Icon aur Price Format (/mo ya /d) theek kiya gaya hai!
        footerIcon = `<span class="material-symbols-outlined" onclick="event.stopPropagation(); openEditRoom('${room.no}')" style="font-size: 18px; color: #94a3b8;">edit</span>`;
        subText = isMonthlyProp ? `₹${room.priceMonthly}/mo` : `₹${room.priceDaily}/d`;
        cardAction = `onclick="openActionScreen('screen-new-booking'); document.getElementById('book-room-no').value='${room.no}';"`;
      } else if (room.status === 'cleaning') {
        footerIcon = `<span class="material-symbols-outlined" onclick="event.stopPropagation(); markRoomClean('${room.no}')">check</span>`;
        subText = 'Housekeeping';
      }

      if (currentRoomView === 'grid') {
        floorHTML += `
          <div class="grid-card ${cardClass}" ${cardAction}>
            <div class="gc-header">
              <span class="type-badge ${badgeClass}">${shortCat}</span>
              <span class="material-symbols-outlined gc-icon">${icon}</span>
            </div>
            <h3 class="gc-number">${room.no}</h3>
            <p class="gc-sub">${subText}</p>
            <div class="gc-footer">
              <strong>${footerText}</strong>
              ${footerIcon}
            </div>
          </div>
        `;
      } else {
        let listBorder = room.status === 'occupied' ? '#fecdd3' : (room.status === 'cleaning' ? '#fed7aa' : '#bbf7d0');
        let listBg = room.status === 'occupied' ? '#fff1f2' : (room.status === 'cleaning' ? '#fff7ed' : '#f0fdf4');
        let listColor = room.status === 'occupied' ? '#e11d48' : (room.status === 'cleaning' ? '#f97316' : '#16a34a');

        floorHTML += `
          <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 16px; background: white; border: 1px solid ${listBorder}; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.02); cursor: pointer;" ${cardAction}>
            <div style="display: flex; gap: 16px; align-items: center;">
              <div style="width: 48px; height: 48px; border-radius: 12px; background: ${listBg}; color: ${listColor}; display: flex; justify-content: center; align-items: center;">
                <span class="material-symbols-outlined" style="font-size: 24px;">${icon}</span>
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 800;">Room ${room.no}</h3>
                  <span style="font-size: 9px; font-weight: 700; background: ${listBg}; color: ${listColor}; padding: 2px 6px; border-radius: 6px;">${shortCat}</span>
                </div>
                <p style="margin: 0; font-size: 13px; color: #64748b; font-weight: 500;">${subText}</p>
              </div>
            </div>
            <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
              <span style="font-size: 10px; font-weight: 800; color: ${listColor}; background: ${listBg}; padding: 4px 8px; border-radius: 8px;">${footerText}</span>
              ${footerIcon}
            </div>
          </div>
        `;
      }
    });
    
    floorHTML += `</div>`;
    scrollArea.insertAdjacentHTML('beforeend', floorHTML);
  }
}

// ==========================================
// BOOKINGS & HISTORY ENGINE VARIABLES
// ==========================================
let currentBookingView = 'active'; 
let currentBookingSearch = '';

function toggleBookingView(view) {
  currentBookingView = view;
  
  let chipAct = document.getElementById('chip-active');
  let chipHist = document.getElementById('chip-history');
  
  if (chipAct && chipHist) {
    if (view === 'active') {
      chipAct.classList.add('active');
      chipHist.classList.remove('active');
    } else {
      chipHist.classList.add('active');
      chipAct.classList.remove('active');
    }
  }
  renderBookingsList(); 
}

function handleBookingSearch(val) {
  currentBookingSearch = val.toLowerCase().trim();
  renderBookingsList();
}

// ==========================================================================
// 4. NAVIGATION & ANIMATION ENGINE (PWA HARDWARE BACK FIX)
// ==========================================================================
function switchTab(tabName) {
  screenHistory = []; // Reset screen memory
  let globalNav = document.getElementById('global-nav');
  if(globalNav) globalNav.classList.remove('hidden');
  currentMainTab = tabName; 

  // 🚨 PWA FIX: Phone ko batao ki naya tab open hua hai
  window.history.pushState({ tab: tabName }, "", "");

  document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden'));
  
  let targetScreen = document.getElementById('screen-' + tabName);
  if (targetScreen !== null) targetScreen.classList.remove('hidden');

  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('onclick') === `switchTab('${tabName}')`) {
      item.classList.add('active');
    }
  });

  if(tabName === 'rooms') renderRoomsGrid();
  if(tabName === 'dashboard') updateDashboardStats();
  if(tabName === 'bookings') renderBookingsList();
  if(tabName === 'billing') renderBillingList(); 
  if(tabName === 'more') updateMoreTabStats();
  document.getElementById('global-nav').classList.remove('hidden');
}

// ==========================================================================
// 🚀 SMART NATIVE NAVIGATION ENGINE (STEP-BY-STEP BACK)
// ==========================================================================
let screenStack = []; // Ye array memory me yaad rakhega hum kahan se aaye hain

function openActionScreen(screenId) {
  // 1. Jo screen abhi khuli hai, usko history stack me save karo
  const currentScreen = document.querySelector('.screen:not(.hidden)');
  if (currentScreen && currentScreen.id !== screenId) {
    screenStack.push(currentScreen.id);
  }

  // 2. Sab hide karke target screen dikhao
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  let target = document.getElementById(screenId);
  if (target) target.classList.remove('hidden');

  // 3. Action screens par bottom nav chhupao
  const mainTabs = ['screen-dashboard', 'screen-rooms', 'screen-bookings', 'screen-billing', 'screen-more'];
  let globalNav = document.getElementById('global-nav');
  if (globalNav) {
    if (!mainTabs.includes(screenId)) {
      globalNav.classList.add('hidden');
    } else {
      globalNav.classList.remove('hidden');
    }
  }

  // 4. Phone ke system history me ek step badhao
  window.history.pushState({ page: screenId }, "", "");
}

function closeActionScreen() {
  // 🚨 MAGIC FIX: Ab ye function khud koi screen change nahi karega!
  // Ye bas phone ke hardware ko bolega "1 step back aao".
  // Screen change karne ka kaam neeche wala 'popstate' khud sambhalega. (No Double Jumps)
  window.history.back();
}

// 🚨 MASTER HARDWARE LISTENER (Phone Back aur App Back dono yahin hit honge)
window.addEventListener('popstate', function(event) {
  if (screenStack.length > 0) {
    // Array se theek ek step pichla screen nikalo
    const previousScreenId = screenStack.pop(); 
    
    // UI update karo
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    const prevScreen = document.getElementById(previousScreenId);
    if (prevScreen) prevScreen.classList.remove('hidden');

    // Bottom Nav check
    const mainTabs = ['screen-dashboard', 'screen-rooms', 'screen-bookings', 'screen-billing', 'screen-more'];
    let globalNav = document.getElementById('global-nav');
    if (globalNav) {
      if (mainTabs.includes(previousScreenId)) {
        globalNav.classList.remove('hidden');
      } else {
        globalNav.classList.add('hidden');
      }
    }
  } else {
    // Agar history bilkul khali hai (app ke root par), toh hamesha safely Dashboard dikhao
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    let dash = document.getElementById('screen-dashboard');
    if (dash) dash.classList.remove('hidden');
    
    let globalNav = document.getElementById('global-nav');
    if (globalNav) globalNav.classList.remove('hidden');
  }
});

// Tab switch karne par purani history clean karna zaroori hai
function switchTab(tabName) {
  screenStack = []; // Tab badalte hi memory reset
  currentMainTab = tabName; 
  
  document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden'));
  let targetScreen = document.getElementById('screen-' + tabName);
  if (targetScreen) targetScreen.classList.remove('hidden');

  let globalNav = document.getElementById('global-nav');
  if(globalNav) globalNav.classList.remove('hidden');

  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('onclick') === `switchTab('${tabName}')`) {
      item.classList.add('active');
    }
  });

  if(tabName === 'rooms' && typeof renderRoomsGrid === 'function') renderRoomsGrid();
  if(tabName === 'dashboard' && typeof updateDashboardStats === 'function') updateDashboardStats();
  if(tabName === 'bookings' && typeof renderBookingsList === 'function') renderBookingsList();
  if(tabName === 'billing' && typeof renderBillingList === 'function') renderBillingList(); 
  if(tabName === 'more' && typeof updateMoreTabStats === 'function') updateMoreTabStats();
  
  window.history.pushState({ page: tabName }, "", "");
}
// ==========================================================================
// REAL-TIME DASHBOARD ENGINE
// ==========================================================================
function updateDashboardStats() {
  if (typeof RoomPeDB.getActivePropertyRooms !== 'function') return;

  let rooms = RoomPeDB.getActivePropertyRooms();
  let payments = RoomPeDB.getActivePropertyPayments();
  
  let props = RoomPeDB.getProperties();
  let activeProp = props.find(p => p.id === RoomPeDB.getActiveProperty()) || props[0];

  let totalRooms = rooms.length;
  let occupiedRooms = rooms.filter(r => r.status === 'occupied');
  let occupancyRate = totalRooms === 0 ? 0 : Math.round((occupiedRooms.length / totalRooms) * 100);

  let occElement = document.getElementById('dash-occupancy');
  if(occElement) occElement.innerText = occupancyRate + '%';

  let totalReceived = payments.reduce((sum, p) => sum + parseInt(p.amount || 0), 0);
  let totalExpected = 0;
  let totalPendingAmt = 0;
  let pendingRoomsList = [];

  occupiedRooms.forEach(r => {
    let roomTotalPaid = payments.filter(p => p.bookingId ? (p.bookingId === r.currentBookingId) : (String(p.room) === String(r.no) && p.guest === r.guest)).reduce((sum, p) => sum + parseInt(p.amount || 0), 0);
    
    // 🚨 DASHBOARD SMART MATH START
    let isMonthlyStay = r.stayType === 'Monthly';
    let priceDaily = parseInt(r.priceDaily || r.price || 0);
    let priceMonthly = parseInt(r.priceMonthly || r.price || 0);
    let duration = parseInt(r.duration || 1);

    let expectedRent = 0;
    let expectedCheckoutDate = new Date(r.checkinDate || new Date());
    expectedCheckoutDate.setHours(0,0,0,0);

    if (isMonthlyStay) {
      expectedRent = priceMonthly * duration;
      expectedCheckoutDate.setMonth(expectedCheckoutDate.getMonth() + duration);
    } else {
      expectedRent = priceDaily * duration;
      expectedCheckoutDate.setDate(expectedCheckoutDate.getDate() + duration);
    }

    let isOverstay = false;
    let extraFine = 0;
    let today = new Date();
    today.setHours(0,0,0,0);

    if (today > expectedCheckoutDate) {
      let diffTime = Math.abs(today - expectedCheckoutDate);
      let extraDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let perDayFine = isMonthlyStay ? Math.round(priceMonthly / 30) : priceDaily;
      extraFine = extraDays * perDayFine;
      
      expectedRent += extraFine;
      isOverstay = true;
    }
    // 🚨 DASHBOARD SMART MATH END

    totalExpected += expectedRent;
    let remainingDue = expectedRent - roomTotalPaid;

    if (remainingDue > 0) {
      totalPendingAmt += remainingDue;
      pendingRoomsList.push({ ...r, remainingDue, isOverstay, extraFine });
    }
  });

  let expectedEl = document.getElementById('dash-expected-amt');
  let collectedEl = document.getElementById('dash-collected-amt');
  let pendingEl = document.getElementById('dash-pending-amt');

  if(expectedEl) expectedEl.innerText = '₹' + totalExpected.toLocaleString('en-IN');
  if(collectedEl) collectedEl.innerText = '₹' + totalReceived.toLocaleString('en-IN');
  if(pendingEl) pendingEl.innerText = '₹' + totalPendingAmt.toLocaleString('en-IN');

  let actionContainer = document.getElementById('action-required-list');
  if(!actionContainer) return;
  let actionHTML = '';
  let actionCount = 0;

  pendingRoomsList.forEach(r => {
    actionCount++;
    let alertColor = r.isOverstay ? '#991b1b' : '#ef4444'; 
    let overstayTag = r.isOverstay ? `<span style="font-size:10px; background:#fee2e2; color:#b91c1c; padding:2px 4px; border-radius:4px; margin-left:4px; border: 1px solid #fca5a5;">+ ₹${r.extraFine} Fine</span>` : '';

    actionHTML += `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div style="display: flex; gap: 12px; align-items: center;">
          <div style="width: 40px; height: 40px; background: #fef2f2; border-radius: 12px; display: flex; justify-content: center; align-items: center; color: ${alertColor};">
            <span class="material-symbols-outlined" style="font-size: 20px;">${r.isOverstay ? 'warning' : 'currency_rupee'}</span>
          </div>
          <div>
            <h5 style="margin: 0; font-size: 15px; color: #0f172a; font-weight: 700;">Room ${r.no} ${overstayTag}</h5>
            <p style="margin: 0; font-size: 12px; color: ${alertColor};">₹${r.remainingDue.toLocaleString('en-IN')} Due</p>
          </div>
        </div>
        <button onclick="openActionScreen('screen-add-payment'); document.getElementById('pay-room-no').value='${r.no}'; document.getElementById('pay-amount').value='${r.remainingDue}';" style="background: white; border: 1px solid #10b981; color: #10b981; padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 12px; cursor: pointer;">Collect</button>
      </div>
    `;
  });

  let cleaningRooms = rooms.filter(r => r.status === 'cleaning');
  cleaningRooms.forEach(r => {
    actionCount++;
    actionHTML += `
      <div onclick="markRoomClean('${r.no}')" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; cursor: pointer;">
        <div style="display: flex; gap: 12px; align-items: center;">
          <div style="width: 40px; height: 40px; background: #fff7ed; border-radius: 12px; display: flex; justify-content: center; align-items: center; color: #f97316;">
            <span class="material-symbols-outlined" style="font-size: 20px;">cleaning_services</span>
          </div>
          <div>
            <h5 style="margin: 0; font-size: 15px; color: #0f172a; font-weight: 700;">Room ${r.no}</h5>
            <p style="margin: 0; font-size: 12px; color: #f97316;">Needs Cleaning</p>
          </div>
        </div>
        <span class="material-symbols-outlined" style="color: #cbd5e1;">chevron_right</span>
      </div>
    `;
  });

  if(actionCount === 0) {
    actionHTML = `
      <div style="text-align:center; padding: 10px; color:#94a3b8; font-size:13px; font-weight:600;">
        <span class="material-symbols-outlined" style="font-size:32px; color:#10b981; display:block; margin-bottom:8px;">task_alt</span> 
        All caught up! No pending actions.
      </div>`;
  }
  actionContainer.innerHTML = actionHTML;
}

// ==========================================================================
// 5. FORMS & DATA ACTIONS (Rooms)
// ==========================================================================
// --- UPDATED SAVE ROOM LOGIC (WITH BULK ADD & AUTO-MATH) ---
function saveNewRoom() {
  const roomInput = document.getElementById('new-room-no').value.trim();
  const floor = document.getElementById('new-room-floor').value;
  const category = document.getElementById('new-room-cat').value;
  const priceDaily = Number(document.getElementById('new-room-price-daily').value) || 0;
  const priceMonthly = Number(document.getElementById('new-room-price-monthly').value) || 0;

  if (!roomInput) {
    showPopup('error', 'Missing Details', 'Please enter Room Number(s).');
    return;
  }

  // 🪄 AUTO-MATH: Ek price daalo, dusra khud nikal jayega
  const finalDaily = priceDaily > 0 ? priceDaily : Math.round(priceMonthly / 30);
  const finalMonthly = priceMonthly > 0 ? priceMonthly : (priceDaily * 30);

  const activePropId = RoomPeDB.getActiveProperty();
  let allRooms = JSON.parse(localStorage.getItem('roompe_rooms')) || [];

  // 🚀 BULK PARSING ENGINE (Comma aur Hyphen ko samajhna)
  let roomsToAdd = [];
  let inputParts = roomInput.split(','); // Pehle comma se alag karo (e.g. "101, 201-205")

  for (let part of inputParts) {
    part = part.trim();
    if (part.includes('-')) {
      // Agar Hyphen (-) hai, toh range banao (e.g. 201-205)
      let rangeParts = part.split('-');
      let start = parseInt(rangeParts[0].trim());
      let end = parseInt(rangeParts[1].trim());

      // Number check karo aur loop chalao
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let i = start; i <= end; i++) {
          roomsToAdd.push(String(i));
        }
      } else {
         roomsToAdd.push(part); // Agar kisine galat format dala
      }
    } else if (part !== "") {
      // Single room number (e.g. 201)
      roomsToAdd.push(part);
    }
  }

  // 💾 DUPLICATE CHECK & SAVE
  let addedCount = 0;
  let duplicateCount = 0;

  roomsToAdd.forEach((rNo, index) => {
    // Check karo ki ye specific room pehle se toh nahi hai
    let exists = allRooms.find(r => String(r.no) === String(rNo) && r.propertyId === activePropId);
    
    if (!exists) {
      allRooms.push({
        id: 'room_' + Date.now() + '_' + index, // Loop ke liye unique ID
        propertyId: activePropId,
        no: String(rNo),
        floor: floor,
        cat: category,
        price: finalMonthly, // Default display rent
        priceDaily: finalDaily,
        priceMonthly: finalMonthly,
        status: 'available',
        guest: '',
        createdAt: new Date().getTime()
      });
      addedCount++;
    } else {
      duplicateCount++;
    }
  });

  // Final Action & Messages
  if (addedCount > 0) {
    RoomPeDB.saveRooms(allRooms);
    
    // Form Inputs Clear karo
    document.getElementById('new-room-no').value = '';
    document.getElementById('new-room-price-daily').value = '';
    document.getElementById('new-room-price-monthly').value = '';
    
    let msg = `Successfully added ${addedCount} room(s).`;
    if (duplicateCount > 0) msg += ` (${duplicateCount} skipped because they already exist).`;
    
    showPopup('success', 'Rooms Added', msg);
    closeActionScreen();
    switchTab('rooms');
  } 
  else if (duplicateCount > 0) {
    showPopup('error', 'Rooms Exist', 'All entered rooms already exist in this property.');
  } 
  else {
    showPopup('error', 'Invalid Input', 'Please enter valid room numbers.');
  }
}

// ==========================================
// RENDER BOOKINGS (ACTIVE VS HISTORY)
// ==========================================
function renderBookingsList() {
  if (typeof RoomPeDB.getActivePropertyBookings !== 'function') return;
  
  let allBookings = RoomPeDB.getActivePropertyBookings();
  let listContainer = document.getElementById('bookings-list-container');
  if(!listContainer) return;
  
  let targetStatus = currentBookingView === 'active' ? 'confirmed' : 'completed';
  let filteredBookings = allBookings.filter(b => b.status === targetStatus);

  if (currentBookingSearch !== '') {
    filteredBookings = filteredBookings.filter(b => 
      (b.guest && b.guest.toLowerCase().includes(currentBookingSearch)) ||
      (b.room && String(b.room).toLowerCase().includes(currentBookingSearch)) ||
      (b.phone && String(b.phone).includes(currentBookingSearch))
    );
  }

  let html = '';
  
  if(filteredBookings.length === 0) {
     html = `<div style="text-align:center; padding: 40px 20px; color: #94a3b8; font-weight: 500;">
               <span class="material-symbols-outlined" style="font-size: 40px; opacity: 0.5; margin-bottom: 8px; display: block;">receipt_long</span>
               No ${currentBookingView} bookings found.
             </div>`;
  } else {
     filteredBookings.sort((a,b) => b.createdAt - a.createdAt);
     
     filteredBookings.forEach(b => {
       let inDate = new Date(b.checkin);
       let outDate = b.checkoutDate ? new Date(b.checkoutDate) : new Date(inDate);
       if(!b.checkoutDate) outDate.setDate(outDate.getDate() + parseInt(b.duration));
       
       let inStr = inDate.toLocaleDateString('en-GB', {day:'numeric', month:'short'}) + ', ' + inDate.toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'});
       let outStr = outDate.toLocaleDateString('en-GB', {day:'numeric', month:'short'}) + ', ' + outDate.toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'});
       
       let totalAmt = b.totalBilled || (b.advance || 0); 
       let phoneStr = b.phone ? `+91 ${b.phone}` : 'No phone saved';
       
       let tagHTML = currentBookingView === 'active' 
         ? `<div class="status-tag tag-available" style="background:#dcfce7; color:#166534;"><div class="dot" style="background:#16a34a;"></div> Confirmed</div>`
         : `<div class="status-tag" style="background:#f1f5f9; color:#475569;"><div class="dot" style="background:#94a3b8;"></div> Checked Out</div>`;

       // 🚨 NAYA: Card par Click Engine laga diya
       let clickAction = currentBookingView === 'active' 
         ? `onclick="openRoomDetails('${b.room}')"` 
         : `onclick="openHistoricalBooking('${b.id}')"`;

       html += `
        <div class="room-card" ${clickAction} style="cursor:pointer; transition: 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
          <div class="room-card-header" style="margin-bottom: 12px;">
            <div class="guest-info" style="margin-bottom: 0;">
              <div class="guest-avatar" style="background:#f8fafc; border:1px solid #e2e8f0;"><span class="material-symbols-outlined" style="color:#64748b;">person</span></div>
              <div>
                <h4 class="guest-name" style="margin:0; font-size:15px;">${b.guest || 'Unknown'}</h4>
                <p class="guest-label" style="margin:0; font-size:11px;">${phoneStr}</p>
              </div>
            </div>
            ${tagHTML}
          </div>
          <div style="font-size: 14px; color: #0f172a; font-weight: 600; margin-bottom: 12px;">
            ${b.stayType || 'Daily'} Stay - Room ${b.room}
          </div>
          <div class="room-footer" style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">In: ${inStr}</div>
              <div style="font-size: 12px; color: #64748b;">Out: ${outStr}</div>
            </div>
            <div style="text-align: right;">
              <div class="price-big" style="font-size: 18px; color:#0f172a;">₹${parseInt(totalAmt).toLocaleString('en-IN')}</div>
              <div style="font-size: 11px; color: ${currentBookingView === 'active' ? '#16A34A' : '#64748b'}; font-weight: 600;">
                ${currentBookingView === 'active' ? 'Advance' : 'Total Billed'}
              </div>
            </div>
          </div>
        </div>
       `;
     });
  }
  listContainer.innerHTML = html;
}

// ==========================================================================
// 6. BILLING & PAYMENTS LOGIC
// ==========================================================================
function setBillingFilter(filterName) {
  currentBillingFilter = filterName;
  document.querySelectorAll('.billing-chip').forEach(c => {
    c.classList.remove('active-green');
    if(c.innerText.includes(filterName)) c.classList.add('active-green');
  });
  renderBillingList();
}

function downloadStatement() {
  // 1. PDF kis area ka banana hai? (Humne Billing Summary card ko select kiya)
  const element = document.querySelector('.billing-summary');
  
  if(!element) {
    alert("Error: Billing summary not found!");
    return;
  }

  // 2. PDF ki settings set karo
  const opt = {
    margin:       10,
    filename:     'RoomPe_Billing_Statement.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  // 3. UX Magic: Button ka text change karke 'Downloading...' dikhao
  let btn = document.querySelector('.bs-statement');
  let oldHTML = btn.innerHTML;
  btn.innerHTML = `<span class="material-symbols-outlined" style="font-size:16px;">hourglass_empty</span> Wait...`;
  btn.style.pointerEvents = 'none'; // Jab tak ban raha hai, button disable kar do
  
  // 4. Library ko call karke PDF Generate & Download karo
  html2pdf().set(opt).from(element).save().then(() => {
      // 5. PDF banne ke baad button normal kardo aur Success Popup dikhao
      btn.innerHTML = oldHTML;
      btn.style.pointerEvents = 'auto';
      showPopup('success', 'PDF Downloaded!', 'Your billing statement has been saved successfully.');
  }).catch(err => {
      btn.innerHTML = oldHTML;
      btn.style.pointerEvents = 'auto';
      showPopup('error', 'Download Failed', 'Something went wrong. Please try again.');
  });
}

function selectPayMode(mode) {
  let upiBtn = document.getElementById('pay-mode-upi');
  let cashBtn = document.getElementById('pay-mode-cash');
  let valInput = document.getElementById('pay-mode-value');

  if(upiBtn) upiBtn.classList.remove('active');
  if(cashBtn) cashBtn.classList.remove('active');
  
  if(mode === 'UPI' && upiBtn) upiBtn.classList.add('active');
  else if (cashBtn) cashBtn.classList.add('active');
  
  if(valInput) valInput.value = mode;
}

function saveNewPayment() {
  let roomEl = document.getElementById('pay-room-no');
  let amtEl = document.getElementById('pay-amount');
  let modeEl = document.getElementById('pay-mode-value');

  if (!roomEl || !amtEl) { alert("Payment form inputs missing!"); return; }

  let roomNo = roomEl.value.trim();
  let amount = amtEl.value.trim();
  let mode = modeEl ? modeEl.value : 'UPI';
  let activePropId = RoomPeDB.getActiveProperty();

  if (roomNo === "" || amount === "") {
    alert("Please enter both Room Number and Amount!");
    return;
  }

  let allRooms = RoomPeDB.getActivePropertyRooms();
  let room = allRooms.find(r => String(r.no) === String(roomNo));
  let guestName = room && room.guest ? room.guest : "Unknown Guest";
  
  // 🚨 SMART FETCH: Room ki current Booking ID nikalo
  let currentBookingId = room && room.currentBookingId ? room.currentBookingId : null;

  let payments = RoomPeDB.getPayments();
  payments.push({
    id: 'pay_' + Date.now(),
    propId: activePropId,
    room: roomNo,
    guest: guestName,
    bookingId: currentBookingId, // 🔐 Locked to ID
    amount: amount,
    mode: mode,
    date: new Date().getTime()
  });
  
  RoomPeDB.savePayments(payments);

  roomEl.value = '';
  amtEl.value = '';

  closeActionScreen();
  switchTab('billing'); 
}

function renderBillingList() {
  if (typeof RoomPeDB.getActivePropertyPayments !== 'function') return;

  let payments = RoomPeDB.getActivePropertyPayments();
  let rooms = RoomPeDB.getActivePropertyRooms();
  
  let occupiedRooms = rooms.filter(r => r.status === 'occupied');

  let totalReceived = payments.reduce((sum, p) => sum + parseInt(p.amount || 0), 0);
  
  // 🚨 NAYA SMART CALCULATION ENGINE START 🚨
  let totalExpected = 0;
  let totalPendingAmount = 0; 
  let pendingRooms = [];

  occupiedRooms.forEach(r => {
    // 1. Unique Booking ID wala filter (Purane bugs na aayein)
    let roomTotalPaid = payments
      .filter(p => p.bookingId ? (p.bookingId === r.currentBookingId) : (String(p.room) === String(r.no) && p.guest === r.guest))
      .reduce((sum, p) => sum + parseInt(p.amount || 0), 0);
    
    // 2. Smart Math (Daily/Monthly)
    let isMonthlyStay = r.stayType === 'Monthly';
    let priceDaily = parseInt(r.priceDaily || r.price || 0);
    let priceMonthly = parseInt(r.priceMonthly || r.price || 0);
    let duration = parseInt(r.duration || 1);

    let expectedRent = 0;
    let expectedCheckoutDate = new Date(r.checkinDate || new Date());
    expectedCheckoutDate.setHours(0,0,0,0);

    if (isMonthlyStay) {
      expectedRent = priceMonthly * duration;
      expectedCheckoutDate.setMonth(expectedCheckoutDate.getMonth() + duration);
    } else {
      expectedRent = priceDaily * duration;
      expectedCheckoutDate.setDate(expectedCheckoutDate.getDate() + duration);
    }

    let today = new Date();
    today.setHours(0,0,0,0);

    // 3. Overstay Fine
    let extraFine = 0;
    if (today > expectedCheckoutDate) {
      let diffTime = Math.abs(today - expectedCheckoutDate);
      let extraDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      let perDayFine = isMonthlyStay ? Math.round(priceMonthly / 30) : priceDaily;
      extraFine = extraDays * perDayFine;
    }

    // 4. Extras Calculation
    let extrasTotal = 0;
    if (r.extras && r.extras.length > 0) {
      r.extras.forEach(ext => extrasTotal += parseInt(ext.price || 0));
    }

    let finalExpectedRent = expectedRent + extraFine + extrasTotal;
    totalExpected += finalExpectedRent;

    let remainingDue = finalExpectedRent - roomTotalPaid;

    if (remainingDue > 0) {
      totalPendingAmount += remainingDue;
      pendingRooms.push({ ...r, remainingDue: remainingDue, totalPaid: roomTotalPaid });
    }
  });
  // 🚨 NAYA SMART CALCULATION ENGINE END 🚨

  let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  let currentMonthStr = monthNames[new Date().getMonth()] + " " + new Date().getFullYear();
  
  if(document.getElementById('billing-month-display')) document.getElementById('billing-month-display').innerHTML = `<span class="material-symbols-outlined">account_balance_wallet</span> ${currentMonthStr}`;
  if(document.getElementById('billing-received-amt')) document.getElementById('billing-received-amt').innerText = '₹' + totalReceived.toLocaleString('en-IN');
  if(document.getElementById('billing-pending-amt')) document.getElementById('billing-pending-amt').innerText = '₹' + totalPendingAmount.toLocaleString('en-IN');
  if(document.getElementById('billing-pending-count')) document.getElementById('billing-pending-count').innerText = pendingRooms.length + ' left';

  if(document.getElementById('count-received')) document.getElementById('count-received').innerText = payments.length;
  if(document.getElementById('count-pending')) document.getElementById('count-pending').innerText = pendingRooms.length;
  if(document.getElementById('count-all')) document.getElementById('count-all').innerText = payments.length + pendingRooms.length;

  let listContainer = document.querySelector('#screen-billing .room-cards-list');
  if(!listContainer) return;
  let html = '';

  let showReceived = currentBillingFilter === 'Received' || currentBillingFilter === 'All';
  let showPending = currentBillingFilter === 'Pending' || currentBillingFilter === 'All';
  let itemsCount = 0;

  if (showPending) {
    pendingRooms.forEach(r => {
      itemsCount++;
      let initials = r.guest ? r.guest.charAt(0).toUpperCase() : "G";
      let partialBadge = r.totalPaid > 0 
        ? `<span style="font-size: 9px; color: #b45309; border: 1px solid #fcd34d; background: #fffbeb; padding: 2px 4px; border-radius: 4px; margin-left: 6px;">PARTIAL PAID: ₹${r.totalPaid}</span>` 
        : '';

      html += `
        <div class="bill-card" style="background: white; border: 1px solid #fecdd3; border-radius: 16px; overflow: hidden; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
          <div class="bill-header" style="padding: 16px; display: flex; justify-content: space-between; align-items: center;">
            <div class="guest-info" style="margin-bottom: 0; display:flex; gap:10px; align-items:center;">
              <div style="width:40px; height:40px; background:#fef2f2; color:#e11d48; border-radius:50%; display:flex; justify-content:center; align-items:center; font-weight:bold; font-size:16px;">
                ${initials}
              </div>
              <div>
                <h4 class="guest-name" style="margin:0; font-size:15px; color:#0f172a; font-weight: 700;">${r.guest || 'Unknown'} <span style="font-weight:400; color:#64748b;">• Room ${r.no}</span></h4>
                <p class="guest-label" style="margin:0; font-size:12px; color:#e11d48;">Rent Due ${partialBadge}</p>
              </div>
            </div>
            <div class="bill-amount-box text-right">
              <div class="bill-price text-red" style="font-size: 18px; font-weight: 800; color:#e11d48;">₹${parseInt(r.remainingDue).toLocaleString('en-IN')}</div>
              <div class="bill-tag tag-unpaid" style="font-size: 10px; font-weight: 700; color: #e11d48; background: #fff1f2; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-top: 4px;">UNPAID</div>
            </div>
          </div>
          <div class="bill-footer" style="background: #fff1f2; padding: 12px 16px; border-top: 1px solid #fecdd3; display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 12px; color: #e11d48; font-weight: 600;"><span class="material-symbols-outlined" style="font-size:14px; vertical-align:middle;">error</span> Due this month</div>
            <div style="display:flex; gap:8px;">
              <button onclick="openActionScreen('screen-send-reminder')" style="background: white; color: #e11d48; border: 1px solid #fecdd3; padding:6px 12px; border-radius:8px; font-weight: 600; font-size: 12px; cursor: pointer;">Remind</button>
              <button onclick="openActionScreen('screen-add-payment'); document.getElementById('pay-room-no').value='${r.no}'; document.getElementById('pay-amount').value='${r.remainingDue}';" style="background: #e11d48; color: white; border: none; padding:6px 12px; border-radius:8px; font-weight: 600; font-size: 12px; cursor: pointer;">Collect</button>
            </div>
          </div>
        </div>
      `;
    });
  }

  if (showReceived) {
    let sortedPayments = [...payments].sort((a,b) => b.date - a.date);
    sortedPayments.forEach(p => {
      itemsCount++;
      let dateStr = new Date(p.date).toLocaleDateString('en-GB', {day:'numeric', month:'short'});
      let icon = p.mode === 'UPI' ? 'phone_iphone' : 'payments';
      
      html += `
        <div class="bill-card" style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
          <div class="bill-header" style="padding: 16px; display: flex; justify-content: space-between; align-items: center;">
            <div class="guest-info" style="margin-bottom: 0; display:flex; gap:10px; align-items:center;">
              <div style="width:40px; height:40px; background:#f1f5f9; color:#475569; border-radius:50%; display:flex; justify-content:center; align-items:center;">
                <span class="material-symbols-outlined">${icon}</span>
              </div>
              <div>
                <h4 class="guest-name" style="margin:0; font-size:15px; color:#0f172a; font-weight: 700;">${p.guest} <span style="font-weight:400; color:#64748b;">• Room ${p.room}</span></h4>
                <p class="guest-label" style="margin:0; font-size:12px; color:#64748b;">Paid via ${p.mode}</p>
              </div>
            </div>
            <div class="bill-amount-box text-right">
              <div class="bill-price text-green" style="font-size: 18px; font-weight: 800; color:#059669;">₹${parseInt(p.amount).toLocaleString('en-IN')}</div>
              <div class="bill-tag tag-paid" style="font-size: 10px; font-weight: 700; color: #059669; background: #ecfdf5; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-top: 4px;">PAID</div>
            </div>
          </div>
          <div class="bill-footer bg-green-lightest" style="background: #f8fafc; padding: 12px 16px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 12px; color: #64748b; font-weight: 500;">Received on ${dateStr}</div>
            <button onclick="alert('Receipt downloaded!')" style="background: transparent; color: #059669; border: none; font-weight: 600; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
              <span class="material-symbols-outlined" style="font-size: 16px;">receipt</span> Receipt
            </button>
          </div>
        </div>
      `;
    });
  }

  if(itemsCount === 0) {
    html = `<div style="text-align:center; padding: 40px 20px; color: #94a3b8; font-weight: 500;">No records found.</div>`;
  }
  listContainer.innerHTML = html;
}

// ==========================================================================
// 7. ROOM DETAILS, CHECKOUT & EDIT LOGIC (MASTER ENGINE)
// ==========================================================================

function addRoomExtra(roomNo) {
  let itemName = prompt("Enter item/service name (e.g., Tea, Water Bottle, Laundry):");
  if (!itemName) return;
  let itemPrice = prompt(`Enter price for ${itemName}:`);
  if (!itemPrice || isNaN(itemPrice)) return alert("Invalid amount!");

  let absoluteRooms = JSON.parse(localStorage.getItem('roompe_rooms')) || [];
  let absIndex = absoluteRooms.findIndex(r => String(r.no) === String(roomNo) && r.propertyId === RoomPeDB.getActiveProperty());
  
  if (absIndex !== -1) {
    if (!absoluteRooms[absIndex].extras) absoluteRooms[absIndex].extras = [];
    absoluteRooms[absIndex].extras.push({
      item: itemName,
      price: parseInt(itemPrice),
      date: new Date().getTime()
    });
    localStorage.setItem('roompe_rooms', JSON.stringify(absoluteRooms));
    openRoomDetails(roomNo); 
  }
}

function openRoomDetails(roomNo) {
  // 🚨 1. SMART MEMORY (Pichli screen ko yaad rakho taaki Back sahi jagah jaye)
  let currentVisible = document.querySelector('.screen:not(.hidden)');
  if (currentVisible && currentVisible.id !== 'screen-room-details') {
     if(typeof screenStack !== 'undefined') screenStack.push(currentVisible.id);
  }

  // 🚨 2. UI CLEANUP (Baaki sab chupao, sirf Room Details dikhao bina kisi blink ke)
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  let rdScreen = document.getElementById('screen-room-details');
  if (rdScreen) {
     rdScreen.classList.remove('hidden');
     rdScreen.classList.add('screen'); 
  }

  // 🚨 3. BROWSER HISTORY (Phone ko batao ki naya page aa gaya hai)
  window.history.pushState({ screen: 'screen-room-details' }, "", "");

  // 🚨 4. BOTTOM NAV HIDE (Room details me niche ka menu nahi dikhna chahiye)
  let globalNav = document.getElementById('global-nav');
  if (globalNav) globalNav.classList.add('hidden');

  let rooms = RoomPeDB.getActivePropertyRooms();
  let payments = RoomPeDB.getActivePropertyPayments();
  let room = rooms.find(r => String(r.no) === String(roomNo));
  if(!room) return;

  // Basic Info Setup
  let titleEl = document.getElementById('rd-room-title');
  let catEl = document.getElementById('rd-room-cat');
  let floorEl = document.getElementById('rd-room-floor');
  let guestNameEl = document.getElementById('rd-guest-name');
  let guestInitEl = document.getElementById('rd-guest-initials');

  if(titleEl) titleEl.innerText = 'Room ' + room.no;
  if(catEl) catEl.innerText = room.cat;
  
  // Property ka asli naam laane ka engine
  let props = RoomPeDB.getProperties();
  let activeProp = props.find(p => p.id === RoomPeDB.getActiveProperty());
  let propName = activeProp ? activeProp.name : 'My Property';

  if(floorEl) floorEl.innerText = propName + ' • ' + room.floor;

  if(room.status === 'occupied') {
    if(guestNameEl) guestNameEl.innerText = room.guest || 'Guest';
    if(guestInitEl) guestInitEl.innerText = room.guest ? room.guest.charAt(0).toUpperCase() : 'G';
    
    // NAYA: Phone, Chhota Signature aur Bada Signature (Documents tab) sab yahan hai
    let guestPhoneEl = document.getElementById('rd-guest-phone');
    let guestSigEl = document.getElementById('rd-guest-signature');
    let docSigEl = document.getElementById('rd-doc-signature'); // Bada wala sign
    let docNoSigEl = document.getElementById('rd-doc-no-sig');  // No sign text
    
    if(guestPhoneEl) guestPhoneEl.innerText = room.phone ? '+91 ' + room.phone : 'No Phone';
    
    if(room.signature) {
        if(guestSigEl) { guestSigEl.src = room.signature; guestSigEl.style.display = 'block'; }
        if(docSigEl) { docSigEl.src = room.signature; docSigEl.style.display = 'block'; }
        if(docNoSigEl) { docNoSigEl.style.display = 'none'; }
    } else {
        if(guestSigEl) { guestSigEl.style.display = 'none'; }
        if(docSigEl) { docSigEl.style.display = 'none'; }
        if(docNoSigEl) { docNoSigEl.style.display = 'block'; }
    }
  } else {
    // Agar room khali (Vacant) hai
    if(guestNameEl) guestNameEl.innerText = 'Vacant';
    if(guestInitEl) guestInitEl.innerText = '-';
    
    let guestPhoneEl = document.getElementById('rd-guest-phone');
    let guestSigEl = document.getElementById('rd-guest-signature');
    let docSigEl = document.getElementById('rd-doc-signature');
    let docNoSigEl = document.getElementById('rd-doc-no-sig');
    
    if(guestPhoneEl) guestPhoneEl.innerText = '-';
    if(guestSigEl) guestSigEl.style.display = 'none';
    if(docSigEl) docSigEl.style.display = 'none';
    if(docNoSigEl) docNoSigEl.style.display = 'block';
  }

  // Actions Assignment
  let chatBtn = document.getElementById('rd-chat-btn');
  let callBtn = document.getElementById('rd-call-btn');
  if(chatBtn) chatBtn.setAttribute('onclick', `contactGuestAction('whatsapp', '${roomNo}')`);
  if(callBtn) callBtn.setAttribute('onclick', `contactGuestAction('call', '${roomNo}')`);

  let editBtn = document.getElementById('rd-edit-btn');
  if(editBtn) editBtn.setAttribute('onclick', `openEditRoom('${room.no}')`);
  let checkoutBtn = document.getElementById('rd-checkout-btn');
  if(checkoutBtn) checkoutBtn.setAttribute('onclick', `checkoutGuest('${room.no}')`);

  // OVERVIEW MATH & EXTRAS
  if (room.status === 'occupied') {
    if(!room.checkinDate) {
      room.checkinDate = new Date().toISOString().slice(0,16);
      room.duration = 1;
      let absoluteRooms = JSON.parse(localStorage.getItem('roompe_rooms')) || [];
      let absIndex = absoluteRooms.findIndex(r => String(r.no) === String(roomNo) && r.propertyId === RoomPeDB.getActiveProperty());
      if(absIndex !== -1) {
         absoluteRooms[absIndex].checkinDate = room.checkinDate;
         absoluteRooms[absIndex].duration = 1;
         localStorage.setItem('roompe_rooms', JSON.stringify(absoluteRooms));
      }
    }

    let checkinDate = new Date(room.checkinDate);
    let today = new Date();
    today.setHours(0,0,0,0);
    checkinDate.setHours(0,0,0,0);

    let diffTimeCurrent = Math.abs(today - checkinDate);
    let daysStaying = Math.ceil(diffTimeCurrent / (1000 * 60 * 60 * 24));
    if(daysStaying === 0) daysStaying = 1;

    // SMART MATH LOGIC START
    let isMonthlyStay = room.stayType === 'Monthly';
    let priceDaily = parseInt(room.priceDaily || room.price || 0);
    let priceMonthly = parseInt(room.priceMonthly || room.price || 0);
    let duration = parseInt(room.duration || 1);

    let totalRoomRent = 0;
    let expectedCheckoutDate = new Date(checkinDate);

    if (isMonthlyStay) {
      totalRoomRent = priceMonthly * duration;
      expectedCheckoutDate.setMonth(expectedCheckoutDate.getMonth() + duration);
    } else {
      totalRoomRent = priceDaily * duration;
      expectedCheckoutDate.setDate(expectedCheckoutDate.getDate() + duration);
    }

    let isOverstay = false;
    let extraFine = 0;
    if (today > expectedCheckoutDate) {
      let diffTime = Math.abs(today - expectedCheckoutDate);
      let extraDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let perDayFine = isMonthlyStay ? Math.round(priceMonthly / 30) : priceDaily;
      extraFine = extraDays * perDayFine;
      
      totalRoomRent += extraFine;
      isOverstay = true;
    }
    // SMART MATH LOGIC END

    let extrasTotal = 0;
    let extrasHTML = '';
    if (room.extras && room.extras.length > 0) {
      room.extras.forEach(ext => {
        extrasTotal += ext.price;
        extrasHTML += `
          <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 6px; border-bottom: 1px dashed #e2e8f0;">
            <span style="font-size: 13px; color: #475569;">${ext.item}</span>
            <span style="font-size: 13px; font-weight: 700; color: #0f172a;">₹${ext.price}</span>
          </div>`;
      });
      extrasHTML += `
        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 4px;">
          <span style="font-size: 11px; font-weight: 700; color: #64748b;">TOTAL EXTRAS</span>
          <span style="font-size: 13px; font-weight: 800; color: #4f46e5;">₹${extrasTotal}</span>
        </div>`;
    } else {
      extrasHTML = `<div style="text-align: center; color: #94a3b8; font-size: 12px; padding: 10px 0;">No extra orders yet.</div>`;
    }

    let grandTotal = totalRoomRent + extrasTotal;
    let roomTotalPaid = payments.filter(p => p.bookingId ? (p.bookingId === room.currentBookingId) : (String(p.room) === String(roomNo) && p.guest === room.guest)).reduce((sum, p) => sum + parseInt(p.amount || 0), 0);
    let remainingDue = grandTotal - roomTotalPaid;

    let checkinEl = document.getElementById('rd-checkin-date');
    if(checkinEl) checkinEl.innerText = checkinDate.toLocaleDateString('en-GB', {day:'numeric', month:'short'});
    let durationEl = document.getElementById('rd-stay-duration');
    if(durationEl) durationEl.innerText = daysStaying + ' days staying';
    let rentEl = document.getElementById('rd-room-rent');
    if(rentEl) rentEl.innerText = '₹' + grandTotal.toLocaleString('en-IN');
    let advEl = document.getElementById('ui-amount-paid');
    if(advEl) advEl.innerText = '₹' + roomTotalPaid.toLocaleString('en-IN');
    let extrasListEl = document.getElementById('rd-extras-list');
    if(extrasListEl) extrasListEl.innerHTML = extrasHTML;

    let addExtraBtn = document.getElementById('rd-add-extra-btn');
    if(addExtraBtn) addExtraBtn.setAttribute('onclick', `addRoomExtra('${room.no}')`);
    let addPayBtn = document.getElementById('rd-add-pay-btn');
    if(addPayBtn) addPayBtn.setAttribute('onclick', `goToAddPaymentFromDetails('${room.no}', ${remainingDue})`);

    let dueCard = document.getElementById('rd-due-card');
    let dueTitle = document.getElementById('rd-due-title');
    let dueDate = document.getElementById('rd-due-date');
    let dueStatus = document.getElementById('rd-due-status');
    let dueIcon = document.getElementById('rd-due-icon');

    if(typeof calculateNetPayable === 'function') calculateNetPayable();

    if (isOverstay) {
      let dueStatusElement = document.getElementById('rd-due-status');
      if (dueStatusElement) {
        dueStatusElement.innerHTML += `<br><span style="font-size:9px; color:#b91c1c;">(Includes ₹${extraFine} Overstay)</span>`;
      }
    }
  }

  // PAYMENTS TAB UPDATE
  let roomPayments = payments.filter(p => String(p.room) === String(roomNo)).sort((a,b) => b.date - a.date);
  let payListContainer = document.getElementById('rd-payments-list');
  if(payListContainer) {
    let payHTML = '';
    if(roomPayments.length === 0) {
      payHTML = `<div style="text-align:center; padding: 20px; color:#94a3b8; font-size:12px;">No payments found for this stay.</div>`;
    } else {
      roomPayments.forEach(p => {
        let dStr = new Date(p.date).toLocaleDateString('en-GB', {day:'numeric', month:'short'});
        payHTML += `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:16px; background:white; border:1px solid #e2e8f0; border-radius:12px; margin-bottom:10px;">
            <div style="display:flex; gap:12px; align-items:center;">
              <div style="width:36px; height:36px; background:#f8fafc; border-radius:50%; display:flex; justify-content:center; align-items:center; color:#475569;">
                <span class="material-symbols-outlined" style="font-size:18px;">${p.mode === 'UPI' ? 'phone_iphone' : 'payments'}</span>
              </div>
              <div>
                <h5 style="margin:0; font-size:15px; color:#0f172a; font-weight:800;">₹${parseInt(p.amount).toLocaleString('en-IN')}</h5>
                <p style="margin:0; font-size:11px; color:#64748b;">${dStr} • via ${p.mode}</p>
              </div>
            </div>
            <span style="font-size:10px; background:#ecfdf5; color:#059669; padding:4px 8px; border-radius:6px; font-weight:700;">Success</span>
          </div>`;
      });
    }
    payListContainer.innerHTML = payHTML;
  }

  // Clean UI and Open Tab
  let docPreview = document.getElementById('uploaded-doc-preview');
  if (docPreview) docPreview.classList.add('hidden');
  let uploadInput = document.getElementById('kyc-upload');
  if (uploadInput) uploadInput.value = '';
  if(document.getElementById('rd-edit-btn')) document.getElementById('rd-edit-btn').style.display = '';
  if(document.getElementById('rd-checkout-btn')) document.getElementById('rd-checkout-btn').style.display = '';
  if(document.getElementById('rd-add-extra-btn')) document.getElementById('rd-add-extra-btn').style.display = '';
  if(document.getElementById('rd-add-pay-btn')) document.getElementById('rd-add-pay-btn').style.display = '';
  
  // DISPLAY KYC DOCUMENTS IN ROOM DETAILS
  let kycDisplayBox = document.getElementById('rd-kyc-display-box');
  if(kycDisplayBox) {
    if (room.idFront || room.idBack) {
      kycDisplayBox.innerHTML = `
        <div style="display:flex; gap:12px; margin-top:10px; width: 100%;">
          ${room.idFront ? `<div style="flex:1;"><img src="${room.idFront}" style="width:100%; height:120px; object-fit:cover; border-radius:12px; border:1px solid #e2e8f0; box-shadow:0 2px 8px rgba(0,0,0,0.05);"><p style="text-align:center; font-size:11px; margin-top:4px; color:#64748b; font-weight:600;">Front</p></div>` : ''}
          ${room.idBack ? `<div style="flex:1;"><img src="${room.idBack}" style="width:100%; height:120px; object-fit:cover; border-radius:12px; border:1px solid #e2e8f0; box-shadow:0 2px 8px rgba(0,0,0,0.05);"><p style="text-align:center; font-size:11px; margin-top:4px; color:#64748b; font-weight:600;">Back</p></div>` : ''}
        </div>
      `;
    } else {
      kycDisplayBox.innerHTML = `
        <div style="border: 1.5px dashed #cbd5e1; border-radius: 12px; padding: 30px 20px; text-align: center; color: #64748b; background: #f8fafc;">
          <span class="material-symbols-outlined" style="font-size: 32px; color: #3b82f6; margin-bottom: 8px;">add_a_photo</span>
          <h5 style="margin: 0; font-size: 15px; color: #0f172a; font-weight: 700;">No ID Uploaded</h5>
          <p style="margin: 4px 0 0 0; font-size: 12px;">Documents are pending for this guest.</p>
        </div>
      `;
    }
  }
  
  switchRoomDetailsTab('overview');
  // 🚨 YAHAN SE 'openActionScreen' HATA DIYA GAYA HAI TAAKI DOUBLE JUMP/BLINK NA HO
}
// ==========================================================================
// 🏢 DYNAMIC PROPERTY NAME ENGINE
// ==========================================================================
function updateHotelName() {
  if (typeof RoomPeDB === 'undefined' || typeof RoomPeDB.getProperties !== 'function') return;

  let props = RoomPeDB.getProperties();
  let activeId = RoomPeDB.getActiveProperty();
  let activeProp = props.find(p => p.id === activeId) || props[0];
  
  let hotelName = (activeProp && activeProp.name) ? activeProp.name : "My Property";
  
  let headers = document.querySelectorAll('.active-hotel-name');
  headers.forEach(h => {
      h.innerText = hotelName;
  });
}

// ==========================================
// SMART CHECKOUT ENGINE (Fixed Math, Cloud Sync & Custom Popup)
// ==========================================
function checkoutGuest(roomNo) {
  let rooms = RoomPeDB.getActivePropertyRooms();
  let payments = RoomPeDB.getActivePropertyPayments();
  
  // 🚨 FIX 1: String matching taaki room hamesha mile
  let room = rooms.find(r => String(r.no) === String(roomNo));
  if (!room) return;

  // 🧠 Checkout Math (Updated with Smart Hybrid Logic)
  let isMonthlyStay = room.stayType === 'Monthly';
let roomTotalPaid = payments.filter(p => p.bookingId ? (p.bookingId === room.currentBookingId) : (String(p.room) === String(roomNo) && p.guest === room.guest)).reduce((sum, p) => sum + parseInt(p.amount || 0), 0);
  
  let priceDaily = parseInt(room.priceDaily || room.price || 0);
  let priceMonthly = parseInt(room.priceMonthly || room.price || 0);
  let duration = parseInt(room.duration || 1);

  let expectedRent = 0;
  let expectedCheckoutDate = new Date(room.checkinDate || new Date());
  expectedCheckoutDate.setHours(0,0,0,0);

  if (isMonthlyStay) {
    expectedRent = priceMonthly * duration;
    expectedCheckoutDate.setMonth(expectedCheckoutDate.getMonth() + duration);
  } else {
    expectedRent = priceDaily * duration;
    expectedCheckoutDate.setDate(expectedCheckoutDate.getDate() + duration);
  }

  let today = new Date();
  today.setHours(0,0,0,0);

  if (today > expectedCheckoutDate) {
    let diffTime = Math.abs(today - expectedCheckoutDate);
    let extraDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    let perDayFine = isMonthlyStay ? Math.round(priceMonthly / 30) : priceDaily;
    expectedRent += (extraDays * perDayFine);
  }

  // Extras add karo
  let extrasTotal = 0;
  if (room.extras && room.extras.length > 0) {
    room.extras.forEach(ext => extrasTotal += ext.price);
  }
  expectedRent += extrasTotal;

  let remainingDue = expectedRent - roomTotalPaid;

  // Agar paise baki hain toh Custom Popup dikhao aur form par bhejo
  if (remainingDue > 0) {
    showCustomPopup('danger', 'Checkout Blocked!', `Room ${roomNo} has a pending due of ₹${remainingDue.toLocaleString('en-IN')}.\nPlease collect the payment first.`, function() {
      openActionScreen('screen-add-payment');
      document.getElementById('pay-room-no').value = roomNo;
      document.getElementById('pay-amount').value = remainingDue;
    });
    return; 
  }

  // 🚨 FIX 2: Premium Custom Popup for Checkout confirmation
  showCustomPopup('confirm', 'Checkout Guest?', `Are you sure you want to checkout the guest from Room ${roomNo}?`, function() {
    
    let activePropId = RoomPeDB.getActiveProperty();
    let allBookings = RoomPeDB.getBookings();
    let activeBookingIndex = allBookings.findIndex(b => String(b.room) === String(roomNo) && b.status === 'confirmed' && b.propId === activePropId);
    
    // Booking History Update
    if(activeBookingIndex !== -1) {
      allBookings[activeBookingIndex].status = 'completed'; 
      allBookings[activeBookingIndex].checkoutDate = new Date().getTime(); 
      allBookings[activeBookingIndex].totalBilled = expectedRent;
      RoomPeDB.saveBookings(allBookings);
    }

    let absoluteRooms = JSON.parse(localStorage.getItem('roompe_rooms')) || [];
    let absIndex = absoluteRooms.findIndex(r => String(r.no) === String(roomNo) && (r.propertyId === activePropId || (!r.propertyId && activePropId === 'prop_default')));
    
    if (absIndex !== -1) {
      // Room Reset
      absoluteRooms[absIndex].status = 'cleaning';
      absoluteRooms[absIndex].guest = ''; 
      absoluteRooms[absIndex].phone = ''; 
      absoluteRooms[absIndex].stayType = '';
      absoluteRooms[absIndex].checkinDate = ''; 
      absoluteRooms[absIndex].duration = '';
      absoluteRooms[absIndex].extras = [];
      absoluteRooms[absIndex].signature = ''; 
      absoluteRooms[absIndex].currentBookingId = ''; // 🚨 NAYA: ID Clear kar do
      
      // 🚨 FIX 3: RoomPeDB.saveRooms use kiya taaki Cloud par bhi update ho
      RoomPeDB.saveRooms(absoluteRooms);
      
      closeActionScreen(); 
      switchTab('rooms'); 
      if(typeof renderBookingsList === 'function') renderBookingsList();
      if(typeof updateDashboardStats === 'function') updateDashboardStats();
      
      // Success feedback
      setTimeout(() => {
        showPopup('success', 'Checkout Complete', `Room ${roomNo} is now vacant and needs cleaning.`);
      }, 400);
    }
  });
}
function openEditRoom(roomNo) {
  let rooms = RoomPeDB.getRooms();
  let room = rooms.find(r => r.no === roomNo);
  if(!room) return;
  
  document.getElementById('edit-original-room-no').value = room.no;
  document.getElementById('edit-room-no').value = room.no;
  document.getElementById('edit-room-price').value = room.price;
  document.getElementById('edit-room-cat').value = room.cat;
  
  openActionScreen('screen-edit-room');
}

function saveRoomEdits() {
  let originalNo = document.getElementById('edit-original-room-no').value;
  let newNo = document.getElementById('edit-room-no').value.trim();
  let newPrice = document.getElementById('edit-room-price').value;
  let newCat = document.getElementById('edit-room-cat').value;
  
  if(newNo === "") return alert("Room number required!"); 
  
  let absoluteRooms = JSON.parse(localStorage.getItem('roompe_rooms')) || [];
  let absIndex = absoluteRooms.findIndex(r => r.no === originalNo && r.propertyId === RoomPeDB.getActiveProperty());
  
  if(absIndex !== -1) {
    absoluteRooms[absIndex].no = newNo;
    absoluteRooms[absIndex].price = newPrice;
    absoluteRooms[absIndex].cat = newCat;
    localStorage.setItem('roompe_rooms', JSON.stringify(absoluteRooms));
    
    closeActionScreen();
    closeActionScreen();
    switchTab('rooms');
  }
}

// --- PERFECT DELETE ROOM ENGINE (Cloud Sync Fixed) ---
function deleteRoom() {
  let originalNo = document.getElementById('edit-original-room-no').value;

  // 1. Apna Custom Premium Popup call karo
  showCustomPopup(
    'danger', 
    'Delete Room?', 
    `Are you sure you want to permanently delete Room ${originalNo}? All data for this room will be lost.`, 
    function() {
      // 2. Database (Local + Cloud) se room filter karke nikal do
      let activePropId = RoomPeDB.getActiveProperty();
      let absoluteRooms = JSON.parse(localStorage.getItem('roompe_rooms')) || [];
      
      let updatedRooms = absoluteRooms.filter(r => !(String(r.no) === String(originalNo) && r.propertyId === activePropId));
      
      // 🚨 MASTER FIX: Yahan RoomPeDB.saveRooms use karna hai!
      // Ye local storage ke sath-sath Cloud (Firebase) par bhi automatically delete sync mar dega.
      RoomPeDB.saveRooms(updatedRooms);
      
      // 3. Edit screen ko band karo aur list refresh karo
      closeActionScreen();
      switchTab('rooms');
      
      // 4. Delete hone ke 0.4 second baad ek Success message dikha do
      setTimeout(() => {
         showPopup('success', 'Room Deleted', `Room ${originalNo} has been removed successfully.`);
      }, 400);
    }
  );
}

function switchRoomDetailsTab(tabName) {
  let tabs = ['overview', 'payments', 'documents'];
  tabs.forEach(t => {
    let btn = document.getElementById('rd-btn-' + t);
    let content = document.getElementById('rd-tab-' + t);
    if(btn && content) {
      btn.style.background = 'transparent';
      btn.style.color = '#64748b';
      content.classList.add('hidden');
    }
  });

  let activeBtn = document.getElementById('rd-btn-' + tabName);
  let activeContent = document.getElementById('rd-tab-' + tabName);

  if(activeBtn && activeContent) {
    activeBtn.style.background = '#059669';
    activeBtn.style.color = 'white';
    activeContent.classList.remove('hidden');
  }

  // 🚨 SMART KYC & SIGNATURE TAB VISIBILITY CONTROLLER (Naya Code Yahan Aaya Hai)
  let kycWrapper = document.getElementById('kyc-and-signature-wrapper');
  if (kycWrapper) {
    if (tabName === 'documents') {
      kycWrapper.style.display = 'block'; // Sirf Documents tab par dikhega
    } else {
      kycWrapper.style.display = 'none';  // Baaki sab jagah chup jayega
    }
  }
}

function handleFileUpload(input) {
  if (input.files && input.files[0]) {
    let fileName = input.files[0].name;
    alert(`📸 Photo Selected: ${fileName}\n\n(In a real app, this will securely upload to the cloud!)`);
    document.getElementById('uploaded-file-name').innerText = fileName;
    document.getElementById('uploaded-doc-preview').classList.remove('hidden');
  }
}

function goToAddPaymentFromDetails(roomNo, dueAmount) {
  closeActionScreen(); 
  setTimeout(() => {
    openActionScreen('screen-add-payment');
    document.getElementById('pay-room-no').value = roomNo;
    document.getElementById('pay-amount').value = dueAmount > 0 ? dueAmount : '';
  }, 200);
}

// ==========================================================================
// 8. PROPERTY MANAGEMENT & SWITCHING
// ==========================================================================
function updateAppHeaders() {
  if (typeof RoomPeDB.getProperties !== 'function') return; 

  let props = RoomPeDB.getProperties();
  let activeId = RoomPeDB.getActiveProperty();
  let activeProp = props.find(p => p.id === activeId) || props[0];

  if (activeProp) {
    document.querySelectorAll('.property-title h3').forEach(el => {
      el.innerText = activeProp.name;
    });
  }
}

function saveNewProperty() {
  let propName = document.getElementById('setup-prop-name').value;
  if (propName) propName = propName.trim();
  
  if(!propName) {
    alert("Please enter a property name!");
    return;
  }

  // 🚨 SMART TYPE DETECTOR: Check karega ki tumne UI mein kaunsa card select kiya hai
  let propType = 'Daily'; // Default Hotel
  let activeCard = document.querySelector('#screen-setup .active'); // Jo green card select hua hai
  
  if(activeCard) {
     let cardText = activeCard.innerText.toLowerCase();
     // Agar card me PG, Monthly ya Hybrid likha hai, toh usko Monthly Property manenge
     if(cardText.includes('monthly') || cardText.includes('pg') || cardText.includes('hostel') || cardText.includes('hybrid')) {
         propType = 'Monthly';
     }
  }

  let props = RoomPeDB.getProperties();
  let newProp = {
    id: 'prop_' + Date.now(),
    name: propName,
    type: propType // Ab perfect type save hoga!
  };

  props.push(newProp);
  RoomPeDB.saveProperties(props);
  RoomPeDB.setActiveProperty(newProp.id);

  document.getElementById('setup-prop-name').value = ''; 
  updateAppHeaders(); 
  
  switchTab('dashboard');
  
  alert(propName + " added successfully as a " + propType + " property!");
}

function openPropertySwitcher() {
  let modal = document.getElementById('modal-property-switcher');
  let sheet = document.getElementById('property-sheet-content');
  let listContainer = document.getElementById('dynamic-prop-list');
  
  if(!modal || !listContainer) return; 

  let props = RoomPeDB.getProperties();
  let activeId = RoomPeDB.getActiveProperty();
  let allRooms = JSON.parse(localStorage.getItem('roompe_rooms')) || [];
  let listHTML = '';
  
  props.forEach(p => {
    let isActive = (p.id === activeId);
    let propRooms = allRooms.filter(r => r.propertyId === p.id || (!r.propertyId && p.id === 'prop_default'));
    let roomCount = propRooms.length;
    
    if (isActive) {
      listHTML += `
        <div style="width: 100%; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; padding: 16px; background: #ffffff; border: 2px solid #059669; border-radius: 16px; cursor: pointer;">
          <div style="display: flex; align-items: flex-start; gap: 14px; flex: 1; min-width: 0;">
            <div style="flex-shrink: 0; width: 44px; height: 44px; background: #059669; border-radius: 12px; display: flex; justify-content: center; align-items: center; color: white;">
              <span class="material-symbols-outlined" style="font-size: 24px;">domain</span>
            </div>
            <div style="flex: 1; min-width: 0; text-align: left;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <h4 style="margin: 0; font-size: 16px; color: #0f172a; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.name}</h4>
                <span style="background: #dcfce7; color: #059669; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 6px;">MAIN</span>
              </div>
              <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
                <div style="width: 6px; height: 6px; background: #059669; border-radius: 50%;"></div>
                <p style="margin: 0; font-size: 12px; color: #059669; font-weight: 700;">Active Property</p>
              </div>
              <p style="margin: 0; font-size: 11px; color: #94a3b8; font-weight: 500;">${roomCount} Rooms</p>
            </div>
          </div>
          <div style="flex-shrink: 0; width: 28px; height: 28px; background: #059669; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: white; margin-left: 12px;">
            <span class="material-symbols-outlined" style="font-size: 18px; font-weight: bold;">check</span>
          </div>
        </div>
      `;
    } else {
      listHTML += `
        <div onclick="switchActiveProperty('${p.id}')" style="width: 100%; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; padding: 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; cursor: pointer;">
          <div style="display: flex; align-items: flex-start; gap: 14px; flex: 1; min-width: 0;">
            <div style="flex-shrink: 0; width: 44px; height: 44px; background: #f8fafc; border-radius: 12px; border: 1px solid #f1f5f9; display: flex; justify-content: center; align-items: center; color: #475569;">
              <span class="material-symbols-outlined" style="font-size: 24px;">home</span>
            </div>
            <div style="flex: 1; min-width: 0; text-align: left;">
              <h4 style="margin: 0 0 4px 0; font-size: 16px; color: #0f172a; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.name}</h4>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #475569; font-weight: 500;">Tap to switch</p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8; font-weight: 500;">${roomCount} Rooms</p>
            </div>
          </div>
          <span class="material-symbols-outlined" style="color: #cbd5e1; flex-shrink: 0; margin-left: 12px;">chevron_right</span>
        </div>
      `;
    }
  });

  listContainer.innerHTML = listHTML;
  modal.classList.remove('hidden');
  setTimeout(() => {
    modal.style.opacity = '1';
    sheet.style.transform = 'translateY(0)';
  }, 10);
}

function switchActiveProperty(propId) {
  RoomPeDB.setActiveProperty(propId);
  updateAppHeaders();
  closePropertySwitcher();
  if (typeof renderRoomsGrid === 'function') renderRoomsGrid();
  if (typeof updateDashboardStats === 'function') updateDashboardStats();
}

function closePropertySwitcher() {
  let modal = document.getElementById('modal-property-switcher');
  let sheet = document.getElementById('property-sheet-content');
  if(!modal || !sheet) return;
  
  sheet.style.transform = 'translateY(100%)';
  modal.style.opacity = '0';
  setTimeout(() => { modal.classList.add('hidden'); }, 300);
}

function goToAddProperty() {
  closePropertySwitcher();
  setTimeout(() => {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById('screen-setup').classList.remove('hidden');
    // Setup screen par nav bar nahi dikhna chahiye!
document.getElementById('global-nav').classList.add('hidden');
  }, 300);
}

function cancelSetup() {
  let props = RoomPeDB.getProperties();
  if (props.length > 1 || (props.length === 1 && props[0].id !== 'prop_default')) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById('screen-dashboard').classList.remove('hidden');
  } else {
    if(confirm("You need to setup at least one property to use RoomPe. Do you want to cancel and go back to the home screen?")) {
      localStorage.removeItem('roompe_logged_in_user');
      document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
      document.getElementById('screen-welcome').classList.remove('hidden');
    }
  }
}

function openManageProperties() {
  let listContainer = document.getElementById('manage-prop-list');
  let props = RoomPeDB.getProperties();
  let activeId = RoomPeDB.getActiveProperty();
  
  let html = '';
  props.forEach(p => {
    let isActive = (p.id === activeId);
    html += `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px; background: white; border: 1px solid #e2e8f0; border-radius: 12px;">
        <div>
          <h4 style="margin: 0 0 4px 0; font-size: 15px; color: #0f172a;">${p.name}</h4>
          ${isActive ? `<span style="font-size: 10px; background: #ecfdf5; color: #10b981; padding: 2px 6px; border-radius: 4px; font-weight: 600;">Currently Active</span>` : ''}
        </div>
        <button onclick="deletePropertySafetyLock('${p.id}', '${p.name}')" style="background: #fef2f2; color: #ef4444; border: 1px solid #fecdd3; padding: 8px 12px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
          <span class="material-symbols-outlined" style="font-size: 18px;">delete</span> Delete
        </button>
      </div>
    `;
  });
  
  if(listContainer) {
    listContainer.innerHTML = html;
    openActionScreen('screen-manage-properties');
  }
}

function deletePropertySafetyLock(propId, propName) {
  let props = RoomPeDB.getProperties();
  if (props.length === 1) {
    alert("Warning: You cannot delete your only property.");
    return;
  }

  if (confirm(`Permanently delete "${propName}"? This will delete all rooms and data inside it.`)) {
    let updatedProps = props.filter(p => p.id !== propId);
    RoomPeDB.saveProperties(updatedProps);
    
    let allRooms = JSON.parse(localStorage.getItem('roompe_rooms')) || [];
    let remainingRooms = allRooms.filter(r => r.propertyId !== propId && (r.propertyId || propId !== 'prop_default'));
    localStorage.setItem('roompe_rooms', JSON.stringify(remainingRooms));
    
    if (RoomPeDB.getActiveProperty() === propId) {
      RoomPeDB.setActiveProperty(updatedProps[0].id);
    }
    
    updateAppHeaders();
    openManageProperties(); 
    if (typeof renderRoomsGrid === 'function') renderRoomsGrid();
    if (typeof updateDashboardStats === 'function') updateDashboardStats();
  }
}

// ==========================================================================
// 9. DATA ISOLATION & LOAD HOOKS
// ==========================================================================
RoomPeDB.getActivePropertyRooms = function() {
  let allRooms = JSON.parse(localStorage.getItem('roompe_rooms')) || [];
  let activeId = this.getActiveProperty();
  return allRooms.filter(r => r.propertyId === activeId || (!r.propertyId && activeId === 'prop_default'));
};

const originalRenderRoomsGrid = renderRoomsGrid;
renderRoomsGrid = function() {
  let oldGetRooms = RoomPeDB.getRooms;
  RoomPeDB.getRooms = RoomPeDB.getActivePropertyRooms; 
  originalRenderRoomsGrid(); 
  RoomPeDB.getRooms = oldGetRooms; 
};

const originalUpdateDashboardStats = updateDashboardStats;
updateDashboardStats = function() {
  let oldGetRooms = RoomPeDB.getRooms;
  RoomPeDB.getRooms = RoomPeDB.getActivePropertyRooms; 
  originalUpdateDashboardStats(); 
  RoomPeDB.getRooms = oldGetRooms; 
};

// ==========================================================================
// NOTIFICATION ENGINE
// ==========================================================================
function timeAgo(time) {
  let diff = Math.floor((new Date() - new Date(time)) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return Math.floor(diff / 60) + ' mins ago';
  if (diff < 86400) return Math.floor(diff / 3600) + ' hours ago';
  return Math.floor(diff / 86400) + ' days ago';
}

function openNotifications() {
  let payments = RoomPeDB.getActivePropertyPayments();
  let allBookings = RoomPeDB.getBookings().filter(b => b.propId === RoomPeDB.getActiveProperty());
  let notifList = document.getElementById('real-notification-list');
  let allNotifs = []; 

  payments.forEach(p => {
    allNotifs.push({
      id: p.id, type: 'Payment', title: 'Payment Received',
      desc: `₹${parseInt(p.amount).toLocaleString('en-IN')} received from <b>${p.guest}</b> (Room ${p.room}) via ${p.mode}.`,
      time: p.date, icon: 'payments', color: '#059669', bg: '#ecfdf5', action: `closeActionScreen(); openRoomDetails('${p.room}')`, pill: 'View Room'
    });
  });

  allBookings.forEach(b => {
    allNotifs.push({
      id: b.id, type: 'Booking', title: 'New Booking Confirmed',
      desc: `<b>${b.guest}</b> booked Room <b>${b.room}</b> for ${b.duration} nights.`,
      time: b.createdAt, icon: 'book_online', color: '#4f46e5', bg: '#e0e7ff', action: `closeActionScreen(); switchTab('bookings')`, pill: 'View Booking'
    });
  });

  allNotifs.sort((a, b) => b.time - a.time);

  let badge = document.getElementById('notif-badge');
  let countAll = document.getElementById('notif-count-all');
  if(badge) badge.innerText = allNotifs.length > 0 ? `${allNotifs.length} New` : '0 New';
  if(countAll) countAll.innerText = allNotifs.length;

  if (allNotifs.length === 0) {
    notifList.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: #94a3b8;">
        <span class="material-symbols-outlined" style="font-size: 48px; margin-bottom: 12px; opacity: 0.5;">notifications_off</span>
        <h4 style="margin: 0; font-size: 15px; color: #64748b;">No new notifications</h4>
      </div>`;
  } else {
    let notifHTML = '';
    allNotifs.forEach(n => {
      notifHTML += `
        <div id="notif-${n.id}" class="notif-card" style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; display: flex; gap: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.02); position: relative; overflow: hidden;">
          <div style="width: 40px; height: 40px; background: ${n.bg}; color: ${n.color}; border-radius: 50%; display: flex; justify-content: center; align-items: center; flex-shrink: 0;">
            <span class="material-symbols-outlined">${n.icon}</span>
          </div>
          <div style="flex: 1; cursor: pointer;" onclick="${n.action}">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <h4 style="margin: 0 0 4px; font-size: 14px; color: #0f172a; font-weight: 700;">${n.title}</h4>
              <div style="width: 8px; height: 8px; background: ${n.color}; border-radius: 50%;"></div>
            </div>
            <p style="margin: 0 0 10px; font-size: 12px; color: #475569; line-height: 1.5;">${n.desc}</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 11px; color: #94a3b8; display: flex; align-items: center; gap: 4px;"><span class="material-symbols-outlined" style="font-size: 12px;">schedule</span> ${timeAgo(n.time)}</span>
              <span style="font-size: 10px; font-weight: 700; color: ${n.color}; background: ${n.bg}; padding: 3px 8px; border-radius: 12px;">${n.pill}</span>
            </div>
          </div>
          <div onclick="dismissNotification('notif-${n.id}')" style="position: absolute; right: -30px; top: 0; bottom: 0; width: 40px; background: #fee2e2; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; color: #ef4444; border-top-right-radius: 12px; border-bottom-right-radius: 12px; z-index: 10;">
             <span class="material-symbols-outlined">close</span>
          </div>
        </div>
      `;
    });
    notifList.innerHTML = notifHTML;
  }
  openActionScreen('screen-notifications');
}

function dismissNotification(id) {
  let el = document.getElementById(id);
  if (el) {
    el.classList.add('slide-out');
    setTimeout(() => {
      el.remove();
      let badge = document.getElementById('notif-badge');
      let countAll = document.getElementById('notif-count-all');
      let remaining = document.querySelectorAll('.notif-card').length;
      
      if(badge) badge.innerText = remaining > 0 ? `${remaining} New` : '0 New';
      if(countAll) countAll.innerText = remaining;
      
      if(remaining === 0) {
        document.getElementById('real-notification-list').innerHTML = `
          <div style="text-align: center; padding: 40px 20px; color: #94a3b8;">
            <span class="material-symbols-outlined" style="font-size: 48px; margin-bottom: 12px; opacity: 0.5;">notifications_off</span>
            <h4 style="margin: 0; font-size: 15px; color: #64748b;">No new notifications</h4>
          </div>`;
      }
    }, 300);
  }
}

function clearAllNotifications() {
  document.querySelectorAll('.notif-card').forEach(el => {
    el.classList.add('slide-out');
  });
  setTimeout(() => {
    document.getElementById('real-notification-list').innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: #94a3b8;">
        <span class="material-symbols-outlined" style="font-size: 48px; margin-bottom: 12px; opacity: 0.5;">done_all</span>
        <h4 style="margin: 0; font-size: 15px; color: #10b981;">All caught up!</h4>
      </div>`;
    document.getElementById('notif-badge').innerText = '0 New';
    document.getElementById('notif-count-all').innerText = '0';
  }, 300);
}

// ==========================================================================
// 🚀 VIP BOOKING ENGINE & DIGITAL SIGNATURE (Unique ID Architecture)
// ==========================================================================

function toggleGSTBox() {
  let isCorp = document.getElementById('book-is-corporate').checked;
  document.getElementById('corporate-gst-box').style.display = isCorp ? 'block' : 'none';
}

function saveNewBookingVIP() {
  let guestName = document.getElementById('book-guest-name').value.trim();
  let guestPhone = document.getElementById('book-guest-phone').value.trim();
  let roomNo = document.getElementById('book-room-no').value.trim();
  let stayType = document.getElementById('book-stay-type').value;
  let checkin = document.getElementById('book-checkin').value;
  let duration = document.getElementById('book-duration').value;
  let advance = document.getElementById('book-advance').value;
  
  let smartMenuBox = document.getElementById('book-smart-menu');
  let smartMenu = smartMenuBox ? smartMenuBox.checked : false;
  
  let sigCanvas = document.getElementById('signature-pad');
  let signatureData = '';
  if(sigCanvas) signatureData = sigCanvas.toDataURL(); 

  if(guestName === "" || roomNo === "" || guestPhone === "") {
    return showPopup('error', 'Missing Details', 'Guest Name, Phone Number, and Room Number are required!');
  }

  let absoluteRooms = JSON.parse(localStorage.getItem('roompe_rooms')) || [];
  let activePropId = RoomPeDB.getActiveProperty();
  let absIndex = absoluteRooms.findIndex(r => String(r.no) === String(roomNo) && (r.propertyId === activePropId || (!r.propertyId && activePropId === 'prop_default')));
  
  if(absIndex === -1) return showPopup('error', 'Invalid Room', `Room ${roomNo} does not exist in this property!`); 
  if(absoluteRooms[absIndex].status === 'occupied') return showPopup('error', 'Room Occupied', `Room ${roomNo} is already occupied!`);

  let actualCheckin = checkin || new Date().toISOString().slice(0,16); 
  let actualDuration = duration || '1';

  // 🚨 MASTER ENGINE: Generate Unique Booking ID
  let randomString = Math.random().toString(36).substring(2, 6).toUpperCase();
  let uniqueBookingId = `bk_${activePropId}_${Date.now()}_${randomString}`;

  // Room data me sab save karna + Unique ID lagana
  absoluteRooms[absIndex].status = 'occupied';
  absoluteRooms[absIndex].idFront = currentKycFront;
  absoluteRooms[absIndex].idBack = currentKycBack;
  absoluteRooms[absIndex].guest = guestName;
  absoluteRooms[absIndex].phone = guestPhone; 
  absoluteRooms[absIndex].stayType = stayType; 
  absoluteRooms[absIndex].checkinDate = actualCheckin;
  absoluteRooms[absIndex].duration = actualDuration;
  absoluteRooms[absIndex].signature = signatureData; 
  absoluteRooms[absIndex].currentBookingId = uniqueBookingId; // 🔐 ID Locked to Room
  
  
  RoomPeDB.saveRooms(absoluteRooms);

  let bookings = RoomPeDB.getBookings();
  bookings.push({
    id: uniqueBookingId, // 🔐 Same ID for History
    propId: activePropId, guest: guestName, room: roomNo, checkin: actualCheckin, duration: actualDuration, advance: advance || '0', status: 'confirmed', createdAt: new Date().getTime(), phone: guestPhone, stayType: stayType, signature: signatureData
  });
  RoomPeDB.saveBookings(bookings);

  if (advance && parseInt(advance) > 0) {
    let payments = RoomPeDB.getPayments();
    payments.push({
      id: 'pay_' + Date.now(), 
      propId: activePropId, 
      room: roomNo, 
      guest: guestName, 
      bookingId: uniqueBookingId, // 🔐 Payment locked to this specific booking
      amount: advance, 
      mode: 'UPI', 
      date: new Date().getTime()
    });
    RoomPeDB.savePayments(payments);
  }

  document.getElementById('book-guest-name').value = '';
  document.getElementById('book-guest-phone').value = '';
  document.getElementById('book-room-no').value = '';
  document.getElementById('book-advance').value = '';
  currentKycFront = "";
  currentKycBack = "";
  if(document.getElementById('front-preview')) document.getElementById('front-preview').style.display = 'none';
  if(document.getElementById('back-preview')) document.getElementById('back-preview').style.display = 'none';
  if(document.getElementById('id-front-input')) document.getElementById('id-front-input').value = '';
  if(document.getElementById('id-back-input')) document.getElementById('id-back-input').value = '';
  clearSignature('signature-pad');

  closeActionScreen();
  switchTab('rooms');

  setTimeout(() => {
    if (smartMenu) showPopup('success', 'Booking & WhatsApp Sent!', `Message delivered to +91 ${guestPhone}. Guest has been successfully checked in.`);
    else showPopup('success', 'Booking Saved', 'Guest booking has been confirmed successfully!');
  }, 400);
}
// Ensure the HTML button calls the right function
window.saveNewBooking = saveNewBookingVIP;

function contactGuestAction(actionType, roomNo) {
  let rooms = RoomPeDB.getActivePropertyRooms();
  let payments = RoomPeDB.getActivePropertyPayments();
  let room = rooms.find(r => String(r.no) === String(roomNo));
  
  let name = room && room.guest ? room.guest : 'Guest';
  let phone = room && room.phone ? room.phone : ''; 
  
  let roomTotalPaid = payments.filter(p => String(p.room) === String(roomNo)).reduce((sum, p) => sum + parseInt(p.amount || 0), 0);
  let basePrice = parseInt(room.price || 0);
  let duration = parseInt(room.duration || 1);
  let due = (basePrice * duration) - roomTotalPaid;
  
  if(actionType === 'whatsapp') {
    if(!phone) return alert("❌ No mobile number saved for this guest!");
    let msg = `Hi ${name}, this is from the reception.`;
    if(due > 0) msg = `Hi ${name}, gentle reminder. Your pending due is ₹${due.toLocaleString('en-IN')}. Please clear it at your earliest convenience.`;
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  } else if (actionType === 'call') {
    if(!phone) return alert("❌ No mobile number saved for this guest!");
    window.open(`tel:${phone}`, '_self');
  }
}

// ==========================================================================
// ✍️ PRO SIGNATURE ENGINE
// ==========================================================================
let sigCanvas, sigCtx;
let isDrawingSig = false;

function initSignaturePad(canvasId) {
  sigCanvas = document.getElementById(canvasId);
  if(!sigCanvas) return;
  sigCtx = sigCanvas.getContext('2d');
  
  sigCanvas.width = sigCanvas.offsetWidth;
  sigCanvas.height = sigCanvas.offsetHeight;
  sigCtx.lineWidth = 3;
  sigCtx.lineCap = 'round';
  sigCtx.strokeStyle = '#0f172a'; 

  sigCanvas.onmousedown = startSig;
  sigCanvas.onmouseup = endSig;
  sigCanvas.onmousemove = drawSig;
  sigCanvas.ontouchstart = (e) => { e.preventDefault(); startSig(e.touches[0]); };
  sigCanvas.ontouchend = endSig;
  sigCanvas.ontouchmove = (e) => { e.preventDefault(); drawSig(e.touches[0]); };
}

function startSig(e) { isDrawingSig = true; drawSig(e); }
function endSig() { isDrawingSig = false; sigCtx.beginPath(); }
function drawSig(e) {
  if (!isDrawingSig) return;
  let rect = sigCanvas.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;
  sigCtx.lineTo(x, y);
  sigCtx.stroke();
  sigCtx.beginPath();
  sigCtx.moveTo(x, y);
}

function clearSignature(canvasId) { 
  let c = document.getElementById(canvasId);
  if(c) c.getContext('2d').clearRect(0, 0, c.width, c.height); 
}

function openFullScreenSignature() {
  document.getElementById('fullscreen-sig-modal').style.display = 'flex';
  setTimeout(() => initSignaturePad('fs-signature-pad'), 150);
}

function closeFullScreenSignature() {
  document.getElementById('fullscreen-sig-modal').style.display = 'none';
  initSignaturePad('signature-pad'); 
}

function saveFSSignature() {
  let fsCanvas = document.getElementById('fs-signature-pad');
  let smallCanvas = document.getElementById('signature-pad');
  let smallCtx = smallCanvas.getContext('2d');
  
  smallCtx.clearRect(0, 0, smallCanvas.width, smallCanvas.height);
  smallCtx.drawImage(fsCanvas, 0, 0, smallCanvas.width, smallCanvas.height);
  closeFullScreenSignature();
}

const autoSigOpenActionScreen = openActionScreen;
openActionScreen = function(screenId) {
  autoSigOpenActionScreen(screenId);
  if(screenId === 'screen-new-booking') {
    setTimeout(() => initSignaturePad('signature-pad'), 150); 
  }
};

// ==========================================================================
// 🔐 ROOMPE AUTHENTICATION ENGINE (PERFECT SYNC & AUTO-LOGIN)
// ==========================================================================
let isLoginMode = true;

function toggleAuthMode() {
  isLoginMode = !isLoginMode;
  document.getElementById('auth-title').innerText = isLoginMode ? 'Welcome Back' : 'Create Account';
  document.getElementById('auth-subtitle').innerText = isLoginMode ? 'Log in to manage your properties' : 'Sign up to register your property';
  document.getElementById('auth-main-btn').innerText = isLoginMode ? 'Sign In' : 'Sign Up';
  document.getElementById('auth-toggle-btn').innerText = isLoginMode ? 'Sign Up' : 'Log In';
  document.getElementById('auth-toggle-text').innerText = isLoginMode ? "Don't have an account? " : "Already have an account? ";
}

// 🚀 APP UNLOCKER (Parda hatane aur data laane ka engine)
function unlockApp(user) {
  document.getElementById('screen-login').style.display = 'none';
  document.getElementById('screen-welcome').classList.add('hidden'); // Ekdum clean
  localStorage.setItem('roompe_logged_in_user', user.email);

  // Private data lana shuru karo
  startCloudSync(user.uid);

  // Thoda wait karo data aane ke liye, fir dashboard kholo
  setTimeout(() => {
    routeToDashboard();
  }, 800);
}

// --- GOOGLE LOGIN FIX ---
async function handleGoogleLogin() {
  const errorBox = document.getElementById('auth-error-msg');
  const errorText = document.getElementById('auth-error-text');
  errorBox.style.display = 'none'; // reset errors

  try {
    // Ye line Firebase ka Google popup open karti hai
    const result = await window.fbSignInPopup(window.fbAuth, window.fbGoogleProvider);
    const user = result.user;
    
    console.log("Google Login Success:", user.displayName);
    
    // Seedha Dashboard me bhej do
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById('screen-dashboard').classList.remove('hidden');
    document.getElementById('global-nav').classList.remove('hidden');
    
  } catch (error) {
    console.error("Google Auth Error:", error);
    errorText.innerText = "Google Sign-In failed or cancelled.";
    errorBox.style.display = 'flex';
  }
}

// --- BULLETPROOF EMAIL LOGIN / SIGNUP LOGIC ---
async function handleEmailAuth(event) {
  if(event) event.preventDefault();
  
  const emailInput = document.getElementById('auth-email');
  const passInput = document.getElementById('auth-pass');
  const errorBox = document.getElementById('auth-error-msg');
  const errorText = document.getElementById('auth-error-text');
  const btn = document.getElementById('auth-main-btn');

  const email = emailInput.value.trim();
  const pass = passInput.value.trim();

  // Smart Check: Button par "Up" likha hai ya nahi (Sign Up vs Sign In)
  const isSignUp = btn.innerText.includes('Up');

  // Reset errors
  if(errorBox) errorBox.style.display = 'none';
  emailInput.style.borderColor = 'var(--border-color)';
  passInput.style.borderColor = 'var(--border-color)';

  // Agar khali chhod diya
  if(!email || !pass) {
    if(errorText) errorText.innerText = "Please enter both email and password.";
    if(errorBox) errorBox.style.display = 'flex';
    emailInput.style.borderColor = 'var(--red)';
    passInput.style.borderColor = 'var(--red)';
    return;
  }

  // Button ko lock karo taaki user baar baar click na kare
  btn.disabled = true;
  btn.innerHTML = 'Please wait...';
  
  try {
    // Check agar Firebase load hone me time le raha hai
    if (!window.fbAuth) throw new Error("Firebase connection loading... Try again in 2 seconds.");

    if(isSignUp) {
      await window.fbCreateUser(window.fbAuth, email, pass);
    } else {
      await window.fbSignIn(window.fbAuth, email, pass);
    }
    
    // Agar successful hua:
    btn.innerHTML = 'Success!';
    btn.style.background = '#10b981'; // Green
    
    setTimeout(() => {
      document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
      document.getElementById('screen-dashboard').classList.remove('hidden');
      document.getElementById('global-nav').classList.remove('hidden');
      
      // Button wapas normal karo
      btn.innerHTML = isSignUp ? 'Sign Up' : 'Sign In';
      btn.style.background = 'var(--primary-dark)';
      btn.disabled = false;
    }, 1000);

  } catch (error) {
    // AGAR GALAT PASSWORD HUA YA ERROR AAYA
    console.error("Auth Error:", error);
    
    // Button wapas normal karo
    btn.disabled = false;
    btn.innerHTML = isSignUp ? 'Sign Up' : 'Sign In';
    
    // Inputs ko lal (Red) karo
    emailInput.style.borderColor = 'var(--red)';
    passInput.style.borderColor = 'var(--red)';
    if(errorBox) errorBox.style.display = 'flex';
    
    // Smart Error Messages
    if(error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
      if(errorText) errorText.innerText = "Incorrect email or password.";
    } else if(error.code === 'auth/email-already-in-use') {
      if(errorText) errorText.innerText = "This email is already registered. Please log in.";
    } else if(error.code === 'auth/weak-password') {
      if(errorText) errorText.innerText = "Password must be at least 6 characters.";
    } else if(error.code === 'auth/invalid-email') {
      if(errorText) errorText.innerText = "Invalid email format. E.g. name@roompe.com";
    } else {
      if(errorText) errorText.innerText = error.message; // Koi aur issue hoga toh exact error dikhayega
    }
  }
}

function logOutApp() {
  // Ab koi 'confirm' nahi, sidha logout karo!
  
  // 1. Navigation chupao
  const nav = document.getElementById('global-nav');
  if(nav) nav.classList.add('hidden');
  
  // 2. Login screen par bhejo
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById('screen-login').classList.remove('hidden');
  
  // 3. Agar Firebase hai toh usko bhi sign out kar do
  if (window.fbSignOut && window.fbAuth) {
    window.fbSignOut(window.fbAuth).then(() => {
      console.log("Logged out successfully");
    });
  }
}

// 2. INSTANT PROPERTY SWITCHER
function switchActiveProperty(propId) {
  RoomPeDB.setActiveProperty(propId);
  updateAppHeaders();
  
  // 🚨 Animation khatam hone ka wait nahi karna, instantly naya data render karo
  if (typeof renderRoomsGrid === 'function') renderRoomsGrid();
  if (typeof updateDashboardStats === 'function') updateDashboardStats();
  if (typeof renderBookingsList === 'function') renderBookingsList();
  if (typeof renderBillingList === 'function') renderBillingList();
  
  closePropertySwitcher();
}
function routeToDashboard() {
  let props = RoomPeDB.getProperties();
  if (props.length > 0) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    
    // 🌟 MAGIC FIX: Manual screen show karne ki jagah switchTab call karo
    // Ye dashboard screen AUR bottom navbar dono ko ek sath show kar dega!
    switchTab('dashboard'); 
    
    updateAppHeaders();
    if (typeof renderRoomsGrid === 'function') renderRoomsGrid();
    if (typeof updateDashboardStats === 'function') updateDashboardStats();
  } else {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById('screen-setup').classList.remove('hidden');
  }
}

// ==========================================================================
// ☁️ ROOMPE MASTER CLOUD ENGINE (SECURE & CONFLICT-FREE)
// ==========================================================================
let isReceivingCloudData = false;
let cloudTimer = null;

// Naya Smart Trigger: Ye tabhi push karega jab local user koi data change karega
window.triggerCloudSync = function() {
  if (isReceivingCloudData) return; // Agar Firebase se data download ho raha hai, toh wapas upload mat karo
  clearTimeout(cloudTimer);
  cloudTimer = setTimeout(pushToCloud, 1000); // 1 sec delay taaki ek sath multiple changes push ho sakein
};

async function pushToCloud() {
  let user = window.fbAuth ? window.fbAuth.currentUser : null;
  if (!window.db || !user) return;
  
  const userRef = window.fbDoc(window.db, "users", user.uid);
  
  // Jo current updated local data hai, usko lo
  let rooms = JSON.parse(localStorage.getItem('roompe_rooms')) || [];
  let bookings = JSON.parse(localStorage.getItem('roompe_bookings')) || [];
  let payments = JSON.parse(localStorage.getItem('roompe_payments')) || [];
  let properties = JSON.parse(localStorage.getItem('roompe_properties')) || [];
  
  try {
    await window.fbSetDoc(userRef, {
        rooms: rooms,
        bookings: bookings,
        payments: payments,
        properties: properties,
        lastUpdated: new Date().getTime()
    }, { merge: true });
    console.log("☁️ Private Property Data Safely Saved to Cloud!");
  } catch (e) {
    console.error("Cloud Save Error:", e);
  }
}

function startCloudSync(uid) {
  if(!window.db) return;
  
  const userRef = window.fbDoc(window.db, "users", uid); 
  
  window.fbOnSnapshot(userRef, (docSnap) => {
      if(docSnap.exists()) {
          isReceivingCloudData = true; // 🔒 Lock laga diya
          let data = docSnap.data();
          
          // Cloud data ko local mein dalo (Bina interceptor ke!)
          if(data.rooms) localStorage.setItem('roompe_rooms', JSON.stringify(data.rooms));
          if(data.bookings) localStorage.setItem('roompe_bookings', JSON.stringify(data.bookings));
          if(data.payments) localStorage.setItem('roompe_payments', JSON.stringify(data.payments));
          if(data.properties) localStorage.setItem('roompe_properties', JSON.stringify(data.properties));
          
          // Data aate hi UI refresh
          if(typeof renderRoomsGrid === 'function') renderRoomsGrid();
          if(typeof renderBookingsList === 'function') renderBookingsList();
          if(typeof updateHotelName === 'function') updateHotelName();
          if(typeof updateDashboardStats === 'function') updateDashboardStats();
          
          // Thodi der baad lock kholo aur loader hatao
          setTimeout(() => { 
              isReceivingCloudData = false; // 🔓 Lock khol diya
              hideAppLoader(); 
          }, 800);
      } else {
          hideAppLoader(); // Agar user ka pehla din hai (Koi data nahi cloud par)
      }
  });
}

// ==========================================================================
// 🚀 APP INITIALIZATION & AUTO-LOGIN OBSERVER
// ==========================================================================
window.onload = function() {
  // Database initialize (blank empty data set karega naye user ke liye)
  RoomPeDB.init();

  // Firebase Auto-Login Observer
  setTimeout(() => {
    if(window.fbOnAuthChange && window.fbAuth) {
      window.fbOnAuthChange(window.fbAuth, (user) => {
        if (user) {
          // Agar user pehle se login hai toh app unlock karo
          unlockApp(user);
        } else {
          // Agar login nahi hai, toh Login screen dikhao aur Loader hata do
          document.getElementById('screen-login').style.display = 'flex';
          hideAppLoader(); // 🚨 YAHI WO AAKHRI UPDATE HAI
        }
      });
    } else {
       // Failsafe: Agar firebase load na ho
       document.getElementById('screen-login').style.display = 'flex';
       hideAppLoader();
    }
  }, 500);
};

// ==========================================================================
// 📜 HISTORICAL BOOKING VIEWER
// ==========================================================================
function openHistoricalBooking(bookingId) {
  let allBookings = RoomPeDB.getBookings();
  let b = allBookings.find(x => x.id === bookingId);
  if(!b) return;
  
  // Us room aur us guest ki payments nikalna
  let payments = RoomPeDB.getActivePropertyPayments();
  let bPayments = payments.filter(p => String(p.room) === String(b.room) && p.guest === b.guest);
  
  let inDate = new Date(b.checkin);
  let outDate = b.checkoutDate ? new Date(b.checkoutDate) : new Date();
  let days = Math.ceil(Math.abs(outDate - inDate) / (1000 * 60 * 60 * 24)) || 1;
  
  // UI ko purane data se bharna
  document.getElementById('rd-room-title').innerText = 'Room ' + b.room + ' (Past Stay)';
  document.getElementById('rd-guest-name').innerText = b.guest || 'Guest';
  document.getElementById('rd-guest-initials').innerText = b.guest ? b.guest.charAt(0).toUpperCase() : 'G';
  document.getElementById('rd-room-cat').innerText = b.stayType || 'Daily Stay';
  document.getElementById('rd-room-floor').innerText = 'Checked Out: ' + outDate.toLocaleDateString('en-GB');
  
  document.getElementById('rd-checkin-date').innerText = inDate.toLocaleDateString('en-GB');
  document.getElementById('rd-stay-duration').innerText = days + ' days stayed';
  
  let totalRent = b.totalBilled || 0;
  let totalPaid = bPayments.reduce((sum, p) => sum + parseInt(p.amount||0), 0);
  
  document.getElementById('rd-room-rent').innerText = '₹' + totalRent.toLocaleString('en-IN');
  document.getElementById('rd-adv-paid').innerText = '₹' + totalPaid.toLocaleString('en-IN');
  
  let extrasListEl = document.getElementById('rd-extras-list');
  if(extrasListEl) extrasListEl.innerHTML = `<div style="text-align: center; color: #94a3b8; font-size: 12px; padding: 10px 0;">Archived</div>`;
  
  // 🚨 Action Buttons ko Disable karna taaki history alter na ho
  if(document.getElementById('rd-edit-btn')) document.getElementById('rd-edit-btn').style.display = 'none';
  if(document.getElementById('rd-checkout-btn')) document.getElementById('rd-checkout-btn').style.display = 'none';
  if(document.getElementById('rd-add-extra-btn')) document.getElementById('rd-add-extra-btn').style.display = 'none';
  if(document.getElementById('rd-add-pay-btn')) document.getElementById('rd-add-pay-btn').style.display = 'none';
  
  // Dues Box for History
  let dueCard = document.getElementById('rd-due-card');
  if(dueCard) { dueCard.style.background = '#f8fafc'; dueCard.style.borderColor = '#e2e8f0'; }
  document.getElementById('rd-due-title').style.color = '#475569';
  document.getElementById('rd-due-date').style.color = '#475569';
  document.getElementById('rd-due-date').innerText = '₹' + (totalRent - totalPaid);
  document.getElementById('rd-due-status').style.color = '#475569';
  document.getElementById('rd-due-status').innerText = 'Historical Record Settled';
  document.getElementById('rd-due-icon').style.color = '#475569';
  document.getElementById('rd-due-icon').innerText = 'history';
  
  // Payment History List
  let payListContainer = document.getElementById('rd-payments-list');
  if(payListContainer) {
    let payHTML = '';
    if(bPayments.length === 0) {
      payHTML = `<div style="text-align:center; padding: 20px; color:#94a3b8; font-size:12px;">No payments recorded during this stay.</div>`;
    } else {
      bPayments.sort((a,b) => b.date - a.date).forEach(p => {
        let dStr = new Date(p.date).toLocaleDateString('en-GB', {day:'numeric', month:'short'});
        payHTML += `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:16px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:12px; margin-bottom:10px;">
            <div style="display:flex; gap:12px; align-items:center;">
              <div style="width:36px; height:36px; background:white; border-radius:50%; display:flex; justify-content:center; align-items:center; color:#64748b;">
                <span class="material-symbols-outlined" style="font-size:18px;">${p.mode === 'UPI' ? 'phone_iphone' : 'payments'}</span>
              </div>
              <div>
                <h5 style="margin:0; font-size:15px; color:#334155; font-weight:800;">₹${parseInt(p.amount).toLocaleString('en-IN')}</h5>
                <p style="margin:0; font-size:11px; color:#94a3b8;">${dStr} • via ${p.mode}</p>
              </div>
            </div>
            <span style="font-size:10px; background:#e2e8f0; color:#475569; padding:4px 8px; border-radius:6px; font-weight:700;">Archived</span>
          </div>`;
      });
    }
    payListContainer.innerHTML = payHTML;
  }
  
  switchRoomDetailsTab('overview');
  openActionScreen('screen-room-details');
}
// ==========================================================================
// 🏢 PROPERTY DETAILS ENGINE (Option 1)
// ==========================================================================

// 1. Screen kholte waqt purana data fetch karke dikhana
function openPropertyDetailsScreen() {
    let props = RoomPeDB.getProperties();
    let activeId = RoomPeDB.getActiveProperty();
    let activeProp = props.find(p => p.id === activeId);
    
    if(!activeProp) return alert("Property not found!");

    // Agar property me pehle se data hai, toh form me bhar do, warna khali chhod do
    document.getElementById('prop-detail-address').value = activeProp.address || '';
    document.getElementById('prop-detail-wifi').value = activeProp.wifi || '';
    document.getElementById('prop-detail-checkout').value = activeProp.checkoutTime || '11:00';
    document.getElementById('prop-detail-rules').value = activeProp.rules || '';
    
    openActionScreen('screen-property-details');
}

// 2. Form bharne ke baad usko usi Property me save karna
function savePropertyDetails() {
    let address = document.getElementById('prop-detail-address').value.trim();
    let wifi = document.getElementById('prop-detail-wifi').value.trim();
    let checkout = document.getElementById('prop-detail-checkout').value;
    let rules = document.getElementById('prop-detail-rules').value.trim();

    let props = RoomPeDB.getProperties();
    let activeId = RoomPeDB.getActiveProperty();
    let activeIndex = props.findIndex(p => p.id === activeId);

    if(activeIndex !== -1) {
        // Asli magic: Sirf Active property me ye details add hongi
        props[activeIndex].address = address;
        props[activeIndex].wifi = wifi;
        props[activeIndex].checkoutTime = checkout;
        props[activeIndex].rules = rules;
        
        RoomPeDB.saveProperties(props); // Database me update
        
        closeActionScreen();
        showPopup('success', 'Details Saved', 'Property details and house rules updated successfully!');
    } else {
        alert("Error saving details.");
    }
}
// ==========================================================================
// 💰 PRICING & TAX SETUP ENGINE
// ==========================================================================

// 1. Screen kholna aur purana data form me bharna
function openPricingSetupScreen() {
    let props = RoomPeDB.getProperties();
    let activeId = RoomPeDB.getActiveProperty();
    let activeProp = props.find(p => p.id === activeId);
    
    if(!activeProp) return alert("Property not found!");

    // Data load karo
    document.getElementById('prop-tax-gstin').value = activeProp.gstin || '';
    document.getElementById('prop-tax-percent').value = activeProp.gstPercent || '';
    document.getElementById('prop-tax-electricity').value = activeProp.electricityRate || '';
    document.getElementById('prop-tax-cycle').value = activeProp.rentCycle || '1st';
    
    openActionScreen('screen-pricing-tax');
}

// 2. Form ka data LocalStorage me (Active Property par) save karna
function savePricingSetup() {
    let gstin = document.getElementById('prop-tax-gstin').value.trim().toUpperCase();
    let gstPercent = document.getElementById('prop-tax-percent').value.trim();
    let electricityRate = document.getElementById('prop-tax-electricity').value.trim();
    let rentCycle = document.getElementById('prop-tax-cycle').value;

    let props = RoomPeDB.getProperties();
    let activeId = RoomPeDB.getActiveProperty();
    let activeIndex = props.findIndex(p => p.id === activeId);

    if(activeIndex !== -1) {
        // Data save karna
        props[activeIndex].gstin = gstin;
        props[activeIndex].gstPercent = gstPercent;
        props[activeIndex].electricityRate = electricityRate;
        props[activeIndex].rentCycle = rentCycle;
        
        RoomPeDB.saveProperties(props); 
        
        closeActionScreen();
        showPopup('success', 'Pricing Saved', 'Tax and Utility settings have been updated successfully!');
    } else {
        alert("Error saving details.");
    }
}
// ==========================================================================
// 👥 STAFF & ROLES ENGINE
// ==========================================================================

function openStaffRolesScreen() {
    renderStaffList(); // Pehle list load karo
    openActionScreen('screen-staff-roles'); // Fir screen kholo
}

// 1. Staff ki List dikhane ka engine
function renderStaffList() {
    let props = RoomPeDB.getProperties();
    let activeProp = props.find(p => p.id === RoomPeDB.getActiveProperty());
    let staffListContainer = document.getElementById('staff-list-container');
    
    // Agar koi staff nahi hai
    if(!activeProp || !activeProp.staff || activeProp.staff.length === 0) {
        staffListContainer.innerHTML = `<div style="text-align:center; padding: 20px; background:white; border-radius:12px; border:1px dashed #cbd5e1; color:#94a3b8; font-size:13px;">No staff added yet. Add your first team member below.</div>`;
        return;
    }
    
    // Agar staff hai toh list banao
    let html = '';
    activeProp.staff.forEach((s, index) => {
        let roleColor = s.role === 'Manager' ? '#0ea5e9' : (s.role === 'Receptionist' ? '#8b5cf6' : '#f59e0b');
        let roleBg = s.role === 'Manager' ? '#e0f2fe' : (s.role === 'Receptionist' ? '#ede9fe' : '#fef3c7');
        
        html += `
        <div style="background: white; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; gap: 12px; align-items: center;">
                <div style="width: 40px; height: 40px; background: #f8fafc; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: #475569; font-weight: bold; font-size: 16px; border: 1px solid #e2e8f0;">
                    ${s.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h5 style="margin: 0 0 4px 0; font-size: 14px; color: #0f172a; font-weight: 800;">${s.name}</h5>
                    <p style="margin: 0; font-size: 12px; color: #64748b;">+91 ${s.phone}</p>
                </div>
            </div>
            <div style="text-align: right;">
                <span style="background: ${roleBg}; color: ${roleColor}; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700;">${s.role}</span>
                <div style="margin-top: 8px; font-size: 11px; color: #ef4444; cursor: pointer; font-weight: 600;" onclick="removeStaff(${index})">Remove</div>
            </div>
        </div>`;
    });
    
    staffListContainer.innerHTML = html;
}

// 2. Naya Staff Save karna
function saveNewStaff() {
    let name = document.getElementById('staff-name').value.trim();
    let phone = document.getElementById('staff-phone').value.trim();
    let role = document.getElementById('staff-role').value;
    let pin = document.getElementById('staff-pin').value.trim();

    if(!name || !phone || !pin) return alert("Bhai, saari details bharni zaroori hain!");
    if(pin.length !== 4) return alert("Login PIN theek 4-digit ka hona chahiye.");

    let props = RoomPeDB.getProperties();
    let activeId = RoomPeDB.getActiveProperty();
    let activeIndex = props.findIndex(p => p.id === activeId);

    if(activeIndex !== -1) {
        if(!props[activeIndex].staff) props[activeIndex].staff = [];
        
        // Data Push karo
        props[activeIndex].staff.push({
            name: name,
            phone: phone,
            role: role,
            pin: pin,
            addedAt: new Date().getTime()
        });
        
        RoomPeDB.saveProperties(props);
        
        // Form Khali karo
        document.getElementById('staff-name').value = '';
        document.getElementById('staff-phone').value = '';
        document.getElementById('staff-pin').value = '';
        
        renderStaffList(); // List ko turant refresh karo
        showPopup('success', 'Staff Added', `${name} has been added as ${role}.`);
    }
}

// 3. Staff ko Delete karna
function removeStaff(index) {
    if(confirm("Are you sure you want to remove this staff member? They will lose access instantly.")) {
        let props = RoomPeDB.getProperties();
        let activeId = RoomPeDB.getActiveProperty();
        let activeIndex = props.findIndex(p => p.id === activeId);
        
        if(activeIndex !== -1 && props[activeIndex].staff) {
            props[activeIndex].staff.splice(index, 1); // Array se delete karo
            RoomPeDB.saveProperties(props);
            renderStaffList(); // UI Refresh
        }
    }
}
// ==========================================================================
// ⚙️ APP PREFERENCES & LANGUAGE ENGINE (PREMIUM UI LOGIC)
// ==========================================================================

// --- APP SETTINGS LOGIC ---
function openAppSettingsScreen() {
    let savedTheme = localStorage.getItem('roompe_pref_theme') || 'light';
    let savedNotif = localStorage.getItem('roompe_pref_notif') || 'on';
    
    // Toggles ko on/off karna
    document.getElementById('toggle-dark').checked = (savedTheme === 'dark');
    document.getElementById('toggle-notif').checked = (savedNotif === 'on');
    
    // Language preview update karna
    let savedLang = localStorage.getItem('roompe_pref_lang') || 'en';
    let langMap = {'en': 'English (IN)', 'hi': 'हिंदी', 'bn': 'বাংলা'};
    document.getElementById('stg-lang-preview').innerText = langMap[savedLang] + ' • Selected';
    
    openActionScreen('screen-app-settings');
}

function saveAppSettings() {
    // Toggles se value nikalna
    let isDark = document.getElementById('toggle-dark').checked;
    let isNotif = document.getElementById('toggle-notif').checked;
    
    localStorage.setItem('roompe_pref_theme', isDark ? 'dark' : 'light');
    localStorage.setItem('roompe_pref_notif', isNotif ? 'on' : 'off');
    
    closeActionScreen();
    showPopup('success', 'Preferences Saved', 'Your system settings have been updated.');
}

// --- LANGUAGE LOGIC ---
let tempSelectedLang = 'en'; // Temporary selection hold karne ke liye

function openLanguageScreen() {
    tempSelectedLang = localStorage.getItem('roompe_pref_lang') || 'en';
    selectLang(tempSelectedLang); // UI me select karo
    openActionScreen('screen-language');
}

function selectLang(langCode) {
    tempSelectedLang = langCode;
    
    // Sabhi cards ko reset karo
    ['en', 'hi', 'bn'].forEach(code => {
        let card = document.getElementById('lang-btn-' + code);
        if(card) {
            card.classList.remove('active');
            card.querySelector('.material-symbols-outlined').style.display = 'none'; // Checkmark chhupao
            card.querySelector('p').style.color = '#64748b'; // Description gray
            card.querySelector('.circle-check').style.background = 'transparent';
        }
    });
    
    // Jo select hua usko green/active karo
    let activeCard = document.getElementById('lang-btn-' + langCode);
    if(activeCard) {
        activeCard.classList.add('active');
        activeCard.querySelector('.material-symbols-outlined').style.display = 'block'; // Checkmark dikhao
        activeCard.querySelector('p').style.color = '#059669'; // Description green
        activeCard.querySelector('.circle-check').style.background = '#059669';
    }
}

function saveLanguageSetting() {
    localStorage.setItem('roompe_pref_lang', tempSelectedLang);
    
    let displayLang = "English (IN)";
    if(tempSelectedLang === 'hi') displayLang = "हिंदी";
    if(tempSelectedLang === 'bn') displayLang = "বাংলা";
    
    // More tab ki main screen par language naam update
    let actionTexts = document.querySelectorAll('.setting-action .action-text');
    if(actionTexts.length > 0) {
        actionTexts.forEach(el => {
            if(el.innerText.includes('English') || el.innerText.includes('हिंदी') || el.innerText.includes('বাংলা')) {
                el.innerText = displayLang;
            }
        });
    }
    
    // Wapas settings me bhej do (jaise real app me hota hai)
    openAppSettingsScreen();
    setTimeout(() => {
        showPopup('success', 'Language Updated', `App language changed to ${displayLang}.`);
    }, 400);
}
// ==========================================================================
// 🧾 BILLING & INVOICE ENGINE (REAL MATH)
// ==========================================================================

// Ye variables calculation memory me rakhenge
let currentBillState = {
    baseRent: 6000, // Abhi ke liye default, real app me DB room price se aayega
    prevReading: 1420,
    elecRate: 10,
    gstPercent: 0,
    subtotal: 0,
    totalGST: 0,
    grandTotal: 0
};

// 1. Checkout Screen Kholna (Database se GST aur Rate uthana)
function openCheckoutScreen() {
    let props = RoomPeDB.getProperties();
    let activeProp = props.find(p => p.id === RoomPeDB.getActiveProperty());
    
    if(activeProp) {
        // "Pricing & Tax Setup" se real values nikalna
        currentBillState.elecRate = parseFloat(activeProp.electricityRate) || 10;
        currentBillState.gstPercent = parseFloat(activeProp.gstPercent) || 0;
        
        // UI me Update karna
        document.getElementById('chk-elec-rate').innerText = `⚡ ₹${currentBillState.elecRate} / unit`;
        document.getElementById('chk-subtitle').innerText = `${activeProp.name || 'Property'} • Room 101`;
    }

    // Input fields reset
    document.getElementById('calc-curr').value = '';
    document.getElementById('calc-extra-amt').value = '';
    document.getElementById('calc-extra-desc').value = '';
    
    liveCalculateBill(); // Pehli baar math run karo
    
    // Screen open karo
    document.getElementById('screen-checkout').classList.remove('hidden');
}

// 2. LIVE MATH ENGINE (Jab bhi user type karega, ye chalega)
function liveCalculateBill() {
    let currReading = parseFloat(document.getElementById('calc-curr').value) || 0;
    let extraAmt = parseFloat(document.getElementById('calc-extra-amt').value) || 0;
    
    // Bijli ka hisaab (Agar current reading purani se zyada hai)
    let units = 0;
    let elecTotal = 0;
    if (currReading > currentBillState.prevReading) {
        units = currReading - currentBillState.prevReading;
        elecTotal = units * currentBillState.elecRate;
    }

    // Subtotal (Rent + Bijli + Extra)
    currentBillState.subtotal = currentBillState.baseRent + elecTotal + extraAmt;
    
    // GST (Tax) calculation
    currentBillState.totalGST = currentBillState.subtotal * (currentBillState.gstPercent / 100);
    
    // Grand Total
    currentBillState.grandTotal = currentBillState.subtotal + currentBillState.totalGST;

    // ----- UI KO UPDATE KARNA -----
    // Electricity Texts
    document.getElementById('calc-units-txt').innerText = `Units: ${units}`;
    document.getElementById('calc-rate-txt').innerText = `Rate: ${units} x ₹${currentBillState.elecRate}`;
    document.getElementById('calc-elec-total').innerText = `₹${elecTotal.toLocaleString('en-IN')}`;
    
    // Grand Total Text
    document.getElementById('calc-grand-total').innerText = `₹${Math.round(currentBillState.grandTotal).toLocaleString('en-IN')}`;
}

// 3. INVOICE GENERATE KARNA (Checkout se data Invocie par bhejna)
function generateFinalInvoice() {
    let props = RoomPeDB.getProperties();
    let activeProp = props.find(p => p.id === RoomPeDB.getActiveProperty());
    
    let currReading = parseFloat(document.getElementById('calc-curr').value) || currentBillState.prevReading;
    let units = Math.max(0, currReading - currentBillState.prevReading);
    let elecTotal = units * currentBillState.elecRate;
    
    let extraAmt = parseFloat(document.getElementById('calc-extra-amt').value) || 0;
    let extraDesc = document.getElementById('calc-extra-desc').value || 'Additional Charges';

    // Invoice Header & Info
    let date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    let invNum = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    document.getElementById('inv-header-num').innerText = invNum;
    document.getElementById('inv-num').innerText = invNum;
    document.getElementById('inv-date').innerText = date;
    
    if(activeProp) {
        document.getElementById('inv-prop-name').innerText = activeProp.name || 'RoomPe Property';
        document.getElementById('inv-prop-address').innerText = activeProp.address || 'Address not provided';
        document.getElementById('inv-gst-txt').innerText = `GST Tax (${activeProp.gstPercent || 0}%) ${activeProp.gstin ? '#' + activeProp.gstin : ''}`;
    }

    // Line Items populate karna
    document.getElementById('inv-amt-base').innerText = `₹${currentBillState.baseRent.toLocaleString('en-IN')}`;
    
    // Electricity Row
    document.getElementById('inv-elec-units').innerText = `⚡ ${units} units`;
    document.getElementById('inv-elec-desc').innerText = `Meter: ${currentBillState.prevReading} to ${currReading} @₹${currentBillState.elecRate}/unit`;
    document.getElementById('inv-amt-elec').innerText = `₹${elecTotal.toLocaleString('en-IN')}`;
    
    // Extra Charges Row
    if(extraAmt > 0) {
        document.getElementById('inv-row-extra').style.display = 'table-row';
        document.getElementById('inv-extra-desc').innerText = extraDesc;
        document.getElementById('inv-amt-extra').innerText = `₹${extraAmt.toLocaleString('en-IN')}`;
    } else {
        document.getElementById('inv-row-extra').style.display = 'none';
    }

    // Totals
    document.getElementById('inv-amt-subtotal').innerText = `₹${currentBillState.subtotal.toLocaleString('en-IN')}`;
    document.getElementById('inv-amt-gst').innerText = `₹${Math.round(currentBillState.totalGST).toLocaleString('en-IN')}`;
    document.getElementById('inv-grand-total').innerText = `₹${Math.round(currentBillState.grandTotal).toLocaleString('en-IN')}`;

    // Switch Screens (Checkout band, Invoice chalu)
    document.getElementById('screen-checkout').classList.add('hidden');
    document.getElementById('screen-invoice').classList.remove('hidden');
}

// 4. WhatsApp Par Bill Bhejna
function shareOnWhatsApp() {
    let invNum = document.getElementById('inv-num').innerText;
    let amount = document.getElementById('inv-grand-total').innerText;
    let propName = document.getElementById('inv-prop-name').innerText;
    
    let msg = `Hello! 🏢\nHere is your final bill from *${propName}*.\n\n📄 Invoice: ${invNum}\n💰 Total Amount: *${amount}*\n\nThank you for staying with us! - Powered by RoomPe.`;
    
    let whatsappUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(whatsappUrl, '_blank');
}
/* ==========================================================================
   🚀 ROOMPE CUSTOM POPUP ENGINE (Fixed Confirm Buttons)
   ========================================================================== */
function showCustomPopup(type, title, message, confirmCallback = null) {
  const overlay = document.getElementById('roompe-popup-overlay');
  const box = document.getElementById('roompe-popup-box');
  const iconBox = document.getElementById('roompe-popup-icon');
  const titleEl = document.getElementById('roompe-popup-title');
  const msgEl = document.getElementById('roompe-popup-msg');
  const btnBox = document.getElementById('roompe-popup-buttons');

  // 1. Text Set Karo
  titleEl.innerText = title;
  msgEl.innerText = message;

  // 2. Theme & Buttons Set Karo
  if (type === 'danger' || type === 'logout') {
    iconBox.style.background = '#fef2f2';
    iconBox.style.color = '#ef4444';
    iconBox.innerHTML = `<span class="material-symbols-outlined" style="font-size:32px;">${type === 'logout' ? 'logout' : 'delete'}</span>`;
    
    btnBox.innerHTML = `
      <button onclick="closeCustomPopup()" style="flex:1; padding:14px; border-radius:12px; background:#f1f5f9; color:#475569; border:none; font-weight:700; font-size:15px; cursor:pointer;">Cancel</button>
      <button id="popup-confirm-btn" style="flex:1; padding:14px; border-radius:12px; background:#ef4444; color:white; border:none; font-weight:700; font-size:15px; cursor:pointer;">${type === 'logout' ? 'Yes, Logout' : 'Delete'}</button>
    `;
  } 
  else if (type === 'success') {
    iconBox.style.background = '#ecfdf5';
    iconBox.style.color = '#059669';
    iconBox.innerHTML = '<span class="material-symbols-outlined" style="font-size:32px;">check_circle</span>';
    
    btnBox.innerHTML = `
      <button onclick="closeCustomPopup()" style="width:100%; padding:14px; border-radius:12px; background:#059669; color:white; border:none; font-weight:700; font-size:15px; cursor:pointer;">Okay, Done</button>
    `;
  }
  // 🚨 FIX: YAHAN 'confirm' WALA MISSING CODE ADD KIYA HAI
  else if (type === 'confirm') {
    iconBox.style.background = '#fef3c7'; // Warning Yellow Background
    iconBox.style.color = '#d97706'; // Warning Yellow Text
    iconBox.innerHTML = '<span class="material-symbols-outlined" style="font-size:32px;">help</span>';
    
    btnBox.innerHTML = `
      <button onclick="closeCustomPopup()" style="flex:1; padding:14px; border-radius:12px; background:#f1f5f9; color:#475569; border:none; font-weight:700; font-size:15px; cursor:pointer;">Cancel</button>
      <button id="popup-confirm-btn" style="flex:1; padding:14px; border-radius:12px; background:#059669; color:white; border:none; font-weight:700; font-size:15px; cursor:pointer;">Yes, Do it</button>
    `;
  }

  // 3. Agar 'Yes' button dabaya, toh agla function chalao (Callback)
  if (confirmCallback) {
    setTimeout(() => {
      const confirmBtn = document.getElementById('popup-confirm-btn');
      if (confirmBtn) {
        confirmBtn.onclick = () => {
          closeCustomPopup();
          confirmCallback(); // Jaise: logOutApp() ya checkoutGuest()
        };
      }
    }, 50);
  }

  // 4. Popup Screen Par Dikhao (With smooth animation)
  overlay.style.display = 'flex';
  setTimeout(() => {
    box.classList.add('popup-active');
  }, 10);
}
function closeCustomPopup() {
  const overlay = document.getElementById('roompe-popup-overlay');
  const box = document.getElementById('roompe-popup-box');
  
  box.classList.remove('popup-active');
  setTimeout(() => {
    overlay.style.display = 'none';
  }, 200); // 200ms animation timer
}
// --- PASSWORD VISIBILITY TOGGLE ---
function togglePasswordVisibility() {
  const passInput = document.getElementById('auth-pass');
  const eyeIcon = document.getElementById('toggle-password-eye');
  
  if (passInput.type === 'password') {
    passInput.type = 'text';
    eyeIcon.innerText = 'visibility';
    eyeIcon.style.color = 'var(--primary-dark)'; // Green color when visible
  } else {
    passInput.type = 'password';
    eyeIcon.innerText = 'visibility_off';
    eyeIcon.style.color = 'var(--text-light)'; // Grey color when hidden
  }
}
/* ==========================================================================
   🚀 SMART RENT CALCULATOR (Pro-Rata Engine)
   ========================================================================== */
function calculateSmartRent(stayType, durationDays, dailyRate, monthlyRate) {
  // Fallbacks: Agar kisi ne ek box khali chhod diya ho
  const safeDaily = dailyRate > 0 ? dailyRate : Math.round(monthlyRate / 30);
  const safeMonthly = monthlyRate > 0 ? monthlyRate : (dailyRate * 30);

  if (stayType === "Daily") {
    // Hotel Style: Seedha multiply
    return durationDays * safeDaily;
  } 
  else if (stayType === "Monthly") {
    // PG Style: Mahine alag, extra din alag (Pro-Rata)
    const totalMonths = Math.floor(durationDays / 30);
    const extraDays = durationDays % 30;
    
    // Per day of monthly rent (e.g. 6000/30 = 200 per day)
    const proRataDailyRate = Math.round(safeMonthly / 30); 
    
    return (totalMonths * safeMonthly) + (extraDays * proRataDailyRate);
  }
  
  return 0;
}
/* ==========================================================================
   🚀 PAYMENT & CHECKOUT ENGINE
   ========================================================================== */

// --- 1. OPEN PAYMENT MODAL ---
// Tere '+' icon ke onclick me ye call karna: onclick="openPaymentModal()"
function openPaymentModal() {
  document.getElementById('pay-amount-input').value = ''; // Purana amount hatao
  document.getElementById('modal-add-payment').style.display = 'flex'; // Modal dikhao
}

// --- 2. SUBMIT PAYMENT & AUTO-DEDUCT LOGIC ---
async function submitNewPayment() {
  const amount = Number(document.getElementById('pay-amount-input').value);
  const mode = document.getElementById('pay-mode-input').value;
  
  if(amount <= 0) {
    showCustomPopup('danger', 'Invalid Amount', 'Please enter an amount greater than 0.');
    return;
  }

  // 1. Modal band karo
  document.getElementById('modal-add-payment').style.display = 'none';

  // 2. 🟢 AUTO-DEDUCTION LOGIC (UI MATH)
  // Note: HTML me Amount Paid ko id="ui-amount-paid" aur Net Payable ko id="ui-net-payable" de dena
  const paidEl = document.getElementById('ui-amount-paid');
  const payableEl = document.getElementById('ui-net-payable');
  
  if(paidEl && payableEl) {
    // Purana text utha kar usme se comma/₹ hata kar Number me badlo
    let currentPaid = Number(paidEl.innerText.replace(/[^0-9.-]+/g,""));
    let currentPayable = Number(payableEl.innerText.replace(/[^0-9.-]+/g,""));

    // Calculation
    currentPaid += amount;
    currentPayable -= amount;
    if(currentPayable < 0) currentPayable = 0; // Negative me na jaye

    // Wapas UI me update karo instantly
    paidEl.innerText = `₹${currentPaid.toLocaleString('en-IN')}`;
    payableEl.innerText = `₹${currentPayable.toLocaleString('en-IN')}`;
    calculateNetPayable(); // Naya amount aate hi color aur status update karega
  }

  // 3. Success Popup Dikhao
  showCustomPopup('success', 'Payment Added', `₹${amount} successfully received via ${mode}.`);

  // 4. (Backend) Yahan tu Firebase me save karne ka code likh dena
  // e.g., await window.fbAddDoc(collection(db, "bookings", bookingId, "payments"), { amount, mode, date: new Date() });
}

// --- 3. CHECKOUT GUEST ---
// Checkout button ke onclick me ye dalna: onclick="triggerCheckout('Room 202')"
function triggerCheckout(roomNo) {
  // Apna custom popup use kar rahe hain (Alert nahi!)
  showCustomPopup(
    'danger', 
    'Checkout Guest?', 
    `Are you sure you want to checkout the guest from ${roomNo}? This will free up the room and lock their ledger.`, 
    () => processCheckoutAction(roomNo) // Agar Yes dabaya toh ye function chalega
  );
}

// Asli Checkout ka code
async function processCheckoutAction(roomNo) {
  console.log(`${roomNo} is being checked out...`);
  
  // (Backend) Yahan tu Firebase me Update marega:
  // 1. Room ka status 'Vacant' set karega
  // 2. Room ki currentBookingId ko null/empty karega
  
  // Success popup aur screen refresh
  showCustomPopup('success', 'Checkout Complete', `${roomNo} is now vacant and ready for new guests.`);
  
  // Thodi der baad Dashboard ya Rooms list par wapas bhej do
  setTimeout(() => {
    // Apni close screen wali function yahan call kar dena
    // closeActionScreen(); 
  }, 1500);
}
/* ==========================================================================
   💰 SMART FINANCE ENGINE (Net Payable Calculator)
   ========================================================================== */
function calculateNetPayable() {
  // 1. UI se text uthao aur sirf Numbers nikalo (₹ aur comma hata kar)
  const rentEl = document.getElementById('rd-room-rent');
  const paidEl = document.getElementById('ui-amount-paid');
  const payableEl = document.getElementById('ui-net-payable');
  const statusEl = document.getElementById('rd-due-status');
  const dueCard = document.getElementById('rd-due-card');
  const dueIcon = document.getElementById('rd-due-icon');
  const dueTitle = document.getElementById('rd-due-title');

  if (!rentEl || !paidEl || !payableEl) return; // Agar elements nahi hain toh ruk jao

  let totalRent = Number(rentEl.innerText.replace(/[^0-9]/g, '')) || 0;
  let amountPaid = Number(paidEl.innerText.replace(/[^0-9]/g, '')) || 0;
  
  // 2. The Core Math 
  let netPayable = totalRent - amountPaid;
  
  // 3. UI Updates (Premium Dynamic Colors)
  if (netPayable > 0) {
    // 🔴 PENDING DUE (Lal Rang)
    payableEl.innerText = `₹${netPayable.toLocaleString('en-IN')}`;
    statusEl.innerText = "Total Pending Due";
    dueTitle.innerText = "Net Payable";
    dueCard.style.background = "#fff1f2";
    dueCard.style.borderColor = "#fecdd3";
    payableEl.style.color = "#e11d48";
    dueIcon.style.color = "#e11d48";
    dueTitle.style.color = "#e11d48";
  } 
  else if (netPayable === 0) {
    // 🟢 CLEARED (Hara Rang)
    payableEl.innerText = "₹0";
    statusEl.innerText = "All Dues Cleared ✓";
    dueTitle.innerText = "Settled";
    dueCard.style.background = "#ecfdf5";
    dueCard.style.borderColor = "#bbf7d0";
    payableEl.style.color = "#059669";
    dueIcon.style.color = "#059669";
    dueTitle.style.color = "#059669";
  } 
  else {
    // 🔵 ADVANCE (Neela Rang - Agar minus me chala gaya)
    let advanceAmount = Math.abs(netPayable);
    payableEl.innerText = `₹${advanceAmount.toLocaleString('en-IN')}`;
    statusEl.innerText = "Advance / Refundable";
    dueTitle.innerText = "Extra Paid";
    dueCard.style.background = "#eff6ff";
    dueCard.style.borderColor = "#bfdbfe";
    payableEl.style.color = "#2563eb";
    dueIcon.style.color = "#2563eb";
    dueTitle.style.color = "#2563eb";
  }
}
// ==========================================
// 📸 KYC DOCUMENT UPLOAD ENGINE
// ==========================================
let currentKycFront = "";
let currentKycBack = "";

function handleKycUpload(input, previewId, side) {
  let file = input.files[0];
  if (!file) return;

  // File size check (Max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    showPopup('error', 'File Too Large', 'Please upload a clear photo under 2MB.');
    input.value = ""; 
    return;
  }

  // FileReader se image ko Base64 me convert karo taaki DB me save ho sake
  let reader = new FileReader();
  reader.onload = function(e) {
    let base64Image = e.target.result;
    
    // UI me preview dikhao
    let previewImg = document.getElementById(previewId);
    if(previewImg) {
      previewImg.src = base64Image;
      previewImg.style.display = 'block';
    }

    // Memory me save karo taaki Booking Save hote time DB me ja sake
    if (side === 'front') currentKycFront = base64Image;
    if (side === 'back') currentKycBack = base64Image;
    
    // Premium Success Popup
    showPopup('success', 'Document Attached', `${side.charAt(0).toUpperCase() + side.slice(1)} photo added successfully.`);
  };
  reader.readAsDataURL(file);
}
// ==========================================
// 📸 ROOM DETAILS DIRECT KYC UPLOAD ENGINE
// ==========================================
function uploadKycFromRoomDetails(input) {
  let file = input.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    showPopup('error', 'File Too Large', 'Please upload a photo under 2MB.');
    input.value = '';
    return;
  }

  // Room number dhoondho (Header se)
  let roomTitle = document.getElementById('rd-room-title').innerText; // e.g. "Room 207"
  let roomNoStr = roomTitle.replace('Room', '').trim();
  
  let activePropId = RoomPeDB.getActiveProperty();
  let absoluteRooms = JSON.parse(localStorage.getItem('roompe_rooms')) || [];
  let absIndex = absoluteRooms.findIndex(r => String(r.no) === String(roomNoStr) && (r.propertyId === activePropId || (!r.propertyId && activePropId === 'prop_default')));

  if(absIndex === -1) return;

  let reader = new FileReader();
  reader.onload = function(e) {
    let base64Image = e.target.result;
    
    // Asli Image Database me save karo (Pehle front, agar hai toh back)
    if (!absoluteRooms[absIndex].idFront) {
        absoluteRooms[absIndex].idFront = base64Image;
    } else {
        absoluteRooms[absIndex].idBack = base64Image;
    }

    RoomPeDB.saveRooms(absoluteRooms);
    showPopup('success', 'Document Saved', 'Guest ID uploaded successfully.');
    
    // Screen ko turant refresh karo taaki photo dikh jaye
    openRoomDetails(roomNoStr); 
  };
  reader.readAsDataURL(file);
}
