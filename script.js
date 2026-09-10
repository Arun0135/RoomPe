// ==========================================================================
// ROOMPE APP - FINAL MASTER JAVASCRIPT (100% UNIFIED & ERROR-FREE)
// ==========================================================================

var currentRoomFilter = 'All';
var currentRoomSearch = '';
var currentMainTab = 'dashboard'; 
var currentBillingFilter = 'Received';
var currentRoomView = 'grid';


// ==========================================================================
// 1. BASIC SCREEN TRANSITIONS & AUTH
// ==========================================================================
function goToLogin() {
  document.getElementById('screen-welcome').classList.add('hidden');
  document.getElementById('screen-login').classList.remove('hidden');
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
    if(!localStorage.getItem('roompe_rooms')) {
      let defaultRooms = [
        { no: '101', floor: 'Floor 1', cat: 'Deluxe AC', price: '1500', status: 'occupied', guest: 'Rahul K.' },
        { no: '102', floor: 'Floor 1', cat: 'Suite', price: '1200', status: 'available', guest: '' },
        { no: '104', floor: 'Floor 1', cat: 'Standard Non-AC', price: '1000', status: 'cleaning', guest: 'Housekeeping' }
      ];
      localStorage.setItem('roompe_rooms', JSON.stringify(defaultRooms));
    }
    if(!localStorage.getItem('roompe_properties')) {
      let defaultProps = [{id: 'prop_default', name: 'Shanti Residency'}];
      localStorage.setItem('roompe_properties', JSON.stringify(defaultProps));
    }
    if(!localStorage.getItem('roompe_active_prop')) {
      localStorage.setItem('roompe_active_prop', 'prop_default');
    }
    if(!localStorage.getItem('roompe_bookings')) {
      localStorage.setItem('roompe_bookings', JSON.stringify([]));
    }
    if(!localStorage.getItem('roompe_payments')) {
      localStorage.setItem('roompe_payments', JSON.stringify([]));
    }
  },
  
  getRooms: function() { return JSON.parse(localStorage.getItem('roompe_rooms')) || []; },
  saveRooms: function(roomsArray) { localStorage.setItem('roompe_rooms', JSON.stringify(roomsArray)); },

  getProperties: function() {
    let props = localStorage.getItem('roompe_properties');
    return props ? JSON.parse(props) : [{id: 'prop_default', name: 'Shanti Residency'}];
  },
  saveProperties: function(propsArray) { localStorage.setItem('roompe_properties', JSON.stringify(propsArray)); },
  getActiveProperty: function() {
    let active = localStorage.getItem('roompe_active_prop');
    return active ? active : 'prop_default';
  },
  setActiveProperty: function(propId) { localStorage.setItem('roompe_active_prop', propId); },

  getBookings: function() { return JSON.parse(localStorage.getItem('roompe_bookings')) || []; },
  saveBookings: function(b) { localStorage.setItem('roompe_bookings', JSON.stringify(b)); },
  getActivePropertyBookings: function() {
    let all = this.getBookings();
    let activeId = this.getActiveProperty();
    return all.filter(b => b.propId === activeId || (!b.propId && activeId === 'prop_default'));
  },

  getPayments: function() { return JSON.parse(localStorage.getItem('roompe_payments')) || []; },
  savePayments: function(p) { localStorage.setItem('roompe_payments', JSON.stringify(p)); },
  getActivePropertyPayments: function() {
    let all = this.getPayments();
    let activeId = this.getActiveProperty();
    return all.filter(p => p.propId === activeId || (!p.propId && activeId === 'prop_default'));
  }
};

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

  // 🚨 SMART FIX: Directly target the spans to prevent destroying the chip HTML
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

function markRoomClean(roomNo) {
  if (confirm(`Mark Room ${roomNo} as Clean & Available?`)) {
    let rooms = RoomPeDB.getRooms();
    let room = rooms.find(r => r.no === roomNo);
    if (room) {
      room.status = 'available';
      room.guest = '';
      RoomPeDB.saveRooms(rooms);
      renderRoomsGrid();
    }
  }
}

// 1. Search Logic
function handleRoomSearch(query) {
  currentRoomSearch = query.toLowerCase().trim();
  renderRoomsGrid();
}

// 2. View Toggle Logic (Grid vs List)
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

// 3. Filter Chips Logic
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

// 5. MASTER RENDER ENGINE (Renders Grid or Beautiful List)
function renderRoomsGrid() {
  let allRooms = RoomPeDB.getRooms();
  let scrollArea = document.querySelector('#screen-rooms .rooms-scroll-area');
  if(!scrollArea) return;

  if (typeof updateRoomStats === 'function') updateRoomStats(allRooms);

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
        footerIcon = `<span class="material-symbols-outlined" onclick="event.stopPropagation(); quickBook('${room.no}')">add_circle</span>`;
        subText = `₹${room.price}/d`;
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

// ==========================================================================
// 4. NAVIGATION & ANIMATION ENGINE
// ==========================================================================
function switchTab(tabName) {
  currentMainTab = tabName; 

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
}

function openActionScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  let target = document.getElementById(screenId);
  if(target) target.classList.remove('hidden');
}

function closeActionScreen() { 
  switchTab(currentMainTab); 
}

function openGuestProfile() { 
  openActionScreen('screen-guest-profile'); 
}

// ==========================================================================
// REAL-TIME DASHBOARD ENGINE
// ==========================================================================
function updateDashboardStats() {
  if (typeof RoomPeDB.getActivePropertyRooms !== 'function') return;

  let rooms = RoomPeDB.getActivePropertyRooms();
  let payments = RoomPeDB.getActivePropertyPayments();

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
    let roomTotalPaid = payments.filter(p => String(p.room) === String(r.no)).reduce((sum, p) => sum + parseInt(p.amount || 0), 0);
    
    let basePrice = parseInt(r.price || 0);
    let duration = parseInt(r.duration || 1); 
    let expectedRent = basePrice; 
    
    let isOverstay = false;
    let extraFine = 0;

    if (r.checkinDate) {
      expectedRent = basePrice * duration;
      let checkinDate = new Date(r.checkinDate);
      let expectedCheckoutDate = new Date(checkinDate);
      expectedCheckoutDate.setDate(expectedCheckoutDate.getDate() + duration);

      let today = new Date();
      today.setHours(0,0,0,0);
      expectedCheckoutDate.setHours(0,0,0,0);

      if (today > expectedCheckoutDate) {
        let diffTime = Math.abs(today - expectedCheckoutDate);
        let extraDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        extraFine = extraDays * basePrice;
        expectedRent += extraFine;
        isOverstay = true;
      }
    }

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
// 5. FORMS & DATA ACTIONS (Rooms, Bookings, Payments)
// ==========================================================================
function saveNewRoom() {
  let activeId = RoomPeDB.getActiveProperty();
  let roomInput = document.getElementById('new-room-no').value.trim();
  let floorName = document.getElementById('new-room-floor').value;
  let category = document.getElementById('new-room-cat').value;
  let price = document.getElementById('new-room-price').value;
  
  if(roomInput === "") { alert("Please enter Room Number(s)!"); return; }
  if(price === "") price = "0";

  let roomsToProcess = [];
  if (roomInput.includes('-')) {
    let parts = roomInput.split('-');
    let start = parseInt(parts[0].trim()), end = parseInt(parts[1].trim());
    if (!isNaN(start) && !isNaN(end) && start <= end) {
      for (let i = start; i <= end; i++) roomsToProcess.push(i.toString());
    }
  } else if (roomInput.includes(',')) {
    roomInput.split(',').forEach(p => { if(p.trim() !== "") roomsToProcess.push(p.trim()); });
  } else {
    roomsToProcess.push(roomInput);
  }

  let allRooms = RoomPeDB.getRooms();
  roomsToProcess.forEach(no => {
    allRooms.push({ no: no, floor: floorName, cat: category, price: price, status: 'available', guest: '', propertyId: activeId });
  });

  RoomPeDB.saveRooms(allRooms);
  document.getElementById('new-room-no').value = '';
  document.getElementById('new-room-price').value = '';
  switchTab('rooms');
}

function saveNewBooking() {
  let guestName = document.getElementById('book-guest-name').value.trim();
  let roomNo = document.getElementById('book-room-no').value.trim();
  let checkin = document.getElementById('book-checkin').value;
  let duration = document.getElementById('book-duration').value;
  let advance = document.getElementById('book-advance').value;
  
  if(guestName === "" || roomNo === "") {
    alert("Please enter both Guest Name and Room Number!");
    return;
  }

  let absoluteRooms = JSON.parse(localStorage.getItem('roompe_rooms')) || [];
  let activePropId = RoomPeDB.getActiveProperty();
  let absIndex = absoluteRooms.findIndex(r => r.no === roomNo && (r.propertyId === activePropId || (!r.propertyId && activePropId === 'prop_default')));
  
  if(absIndex === -1) { alert("Room " + roomNo + " does not exist!"); return; }
  if(absoluteRooms[absIndex].status === 'occupied') { alert("Room " + roomNo + " is already occupied!"); return; }

  let actualCheckin = checkin || new Date().toISOString().split('T')[0];
  let actualDuration = duration || '1';

  absoluteRooms[absIndex].status = 'occupied';
  absoluteRooms[absIndex].guest = guestName;
  absoluteRooms[absIndex].checkinDate = actualCheckin;
  absoluteRooms[absIndex].duration = actualDuration;
  localStorage.setItem('roompe_rooms', JSON.stringify(absoluteRooms));

  let bookings = RoomPeDB.getBookings();
  bookings.push({
    id: 'bk_' + Date.now(),
    propId: activePropId,
    guest: guestName,
    room: roomNo,
    checkin: actualCheckin,
    duration: actualDuration,
    advance: advance || '0',
    status: 'confirmed',
    createdAt: new Date().getTime()
  });
  RoomPeDB.saveBookings(bookings);

  if (advance && parseInt(advance) > 0) {
    let payments = RoomPeDB.getPayments();
    payments.push({
      id: 'pay_' + Date.now(),
      propId: activePropId,
      room: roomNo,
      guest: guestName,
      amount: advance,
      mode: 'UPI', 
      date: new Date().getTime()
    });
    RoomPeDB.savePayments(payments);
  }

  document.getElementById('book-guest-name').value = '';
  document.getElementById('book-room-no').value = '';
  document.getElementById('book-checkin').value = '';
  document.getElementById('book-duration').value = '';
  document.getElementById('book-advance').value = '';

  closeActionScreen();
  switchTab('bookings');
}

function renderBookingsList() {
  if (typeof RoomPeDB.getActivePropertyBookings !== 'function') return;
  
  let bookings = RoomPeDB.getActivePropertyBookings();
  let listContainer = document.querySelector('#screen-bookings .room-cards-list');
  if(!listContainer) return;
  
  let html = '';
  if(bookings.length === 0) {
     html = `<div style="text-align:center; padding: 40px 20px; color: #94a3b8; font-weight: 500;">No bookings yet for this property.</div>`;
  } else {
     bookings.sort((a,b) => b.createdAt - a.createdAt);
     bookings.forEach(b => {
       let inDate = new Date(b.checkin);
       let outDate = new Date(inDate);
       outDate.setDate(outDate.getDate() + parseInt(b.duration));
       
       let inDateStr = inDate.toLocaleDateString('en-GB', {day:'numeric', month:'short'});
       let outDateStr = outDate.toLocaleDateString('en-GB', {day:'numeric', month:'short'});
       let initials = b.guest.charAt(0).toUpperCase();

       html += `
        <div class="room-card" style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
          <div class="room-card-header" style="margin-bottom: 12px; display:flex; justify-content:space-between; align-items:flex-start;">
            <div class="guest-info" style="margin-bottom: 0; display:flex; gap:10px; align-items:center;">
              <div class="guest-avatar" style="width:40px; height:40px; background:#059669; color:white; border-radius:50%; display:flex; justify-content:center; align-items:center; font-weight:bold; font-size:16px;">${initials}</div>
              <div>
                <h4 class="guest-name" style="margin:0; font-size:15px; color:#0f172a; font-weight: 700;">${b.guest}</h4>
                <p class="guest-label" style="margin:0; font-size:12px; color:#64748b; font-weight: 600;">Room ${b.room}</p>
              </div>
            </div>
            <div class="status-tag tag-available" style="background:#ecfdf5; color:#059669; font-size:10px; font-weight:700; padding:4px 8px; border-radius:8px; display:flex; align-items:center; gap:4px;">
              <div class="dot" style="width:6px; height:6px; background:#059669; border-radius:50%;"></div> Confirmed
            </div>
          </div>
          <div class="room-footer" style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #f1f5f9; padding-top: 12px;">
            <div>
              <div style="font-size: 12px; color: #64748b; margin-bottom: 4px; font-weight: 500;"><span class="material-symbols-outlined" style="font-size:14px; vertical-align:middle; color:#3b82f6;">login</span> In: ${inDateStr}</div>
              <div style="font-size: 12px; color: #64748b; font-weight: 500;"><span class="material-symbols-outlined" style="font-size:14px; vertical-align:middle; color:#e11d48;">logout</span> Out: ${outDateStr}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 10px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">Advance Paid</div>
              <div class="price-big" style="font-size: 18px; color:#0f172a; font-weight:800;">₹${b.advance}</div>
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
  alert("📄 Generating PDF Statement for this month...");
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

  if (!roomEl || !amtEl) {
    alert("Payment form inputs missing!");
    return;
  }

  let roomNo = roomEl.value.trim();
  let amount = amtEl.value.trim();
  let mode = modeEl ? modeEl.value : 'UPI';
  let activePropId = RoomPeDB.getActiveProperty();

  if (roomNo === "" || amount === "") {
    alert("Please enter both Room Number and Amount!");
    return;
  }

  let allRooms = RoomPeDB.getActivePropertyRooms();
  let room = allRooms.find(r => r.no === roomNo);
  let guestName = room && room.guest ? room.guest : "Unknown Guest";

  let payments = RoomPeDB.getPayments();
  payments.push({
    id: 'pay_' + Date.now(),
    propId: activePropId,
    room: roomNo,
    guest: guestName,
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
  let totalExpected = occupiedRooms.reduce((sum, r) => sum + parseInt(r.price || 0), 0);
  let pendingAmount = totalExpected > totalReceived ? totalExpected - totalReceived : 0;

  let pendingRooms = [];
  occupiedRooms.forEach(r => {
    let roomTotalPaid = payments
      .filter(p => String(p.room) === String(r.no))
      .reduce((sum, p) => sum + parseInt(p.amount || 0), 0);
    
    let expectedRent = parseInt(r.price || 0);
    let remainingDue = expectedRent - roomTotalPaid;

    if (remainingDue > 0) {
      pendingRooms.push({
        ...r,
        remainingDue: remainingDue,
        totalPaid: roomTotalPaid
      });
    }
  });

  let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  let currentMonthStr = monthNames[new Date().getMonth()] + " " + new Date().getFullYear();
  
  if(document.getElementById('billing-month-display')) document.getElementById('billing-month-display').innerHTML = `<span class="material-symbols-outlined">account_balance_wallet</span> ${currentMonthStr}`;
  if(document.getElementById('billing-received-amt')) document.getElementById('billing-received-amt').innerText = '₹' + totalReceived.toLocaleString('en-IN');
  if(document.getElementById('billing-pending-amt')) document.getElementById('billing-pending-amt').innerText = '₹' + pendingAmount.toLocaleString('en-IN');
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
  if(floorEl) floorEl.innerText = RoomPeDB.getActiveProperty() + ' • ' + room.floor;

  if(room.status === 'occupied') {
    if(guestNameEl) guestNameEl.innerText = room.guest || 'Guest';
    if(guestInitEl) guestInitEl.innerText = room.guest ? room.guest.charAt(0).toUpperCase() : 'G';
  } else {
    if(guestNameEl) guestNameEl.innerText = 'Vacant';
    if(guestInitEl) guestInitEl.innerText = '-';
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
      room.checkinDate = new Date().toISOString().split('T')[0];
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

    let basePrice = parseInt(room.price || 0);
    let duration = parseInt(room.duration || 1);
    let totalRoomRent = basePrice * duration;

    let expectedCheckoutDate = new Date(checkinDate);
    expectedCheckoutDate.setDate(expectedCheckoutDate.getDate() + duration);

    let isOverstay = false;
    let extraFine = 0;
    if (today > expectedCheckoutDate) {
      let diffTime = Math.abs(today - expectedCheckoutDate);
      let extraDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      extraFine = extraDays * basePrice;
      totalRoomRent += extraFine;
      isOverstay = true;
    }

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
    let roomTotalPaid = payments.filter(p => String(p.room) === String(roomNo)).reduce((sum, p) => sum + parseInt(p.amount || 0), 0);
    let remainingDue = grandTotal - roomTotalPaid;

    let checkinEl = document.getElementById('rd-checkin-date');
    if(checkinEl) checkinEl.innerText = checkinDate.toLocaleDateString('en-GB', {day:'numeric', month:'short'});
    let durationEl = document.getElementById('rd-stay-duration');
    if(durationEl) durationEl.innerText = daysStaying + ' days staying';
    let rentEl = document.getElementById('rd-room-rent');
    if(rentEl) rentEl.innerText = '₹' + grandTotal.toLocaleString('en-IN');
    let advEl = document.getElementById('rd-adv-paid');
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

    if (remainingDue > 0) {
      if(dueCard) { dueCard.style.background = '#fff1f2'; dueCard.style.borderColor = '#fecdd3'; }
      if(dueTitle) dueTitle.style.color = '#e11d48';
      if(dueDate) { dueDate.style.color = '#e11d48'; dueDate.innerText = '₹' + remainingDue.toLocaleString('en-IN'); }
      if(dueStatus) {
        dueStatus.style.color = '#e11d48';
        dueStatus.innerText = 'Total Pending Due';
        if(isOverstay) dueStatus.innerHTML += `<br><span style="font-size:9px; color:#b91c1c;">(Includes ₹${extraFine} Overstay)</span>`;
      }
      if(dueIcon) { dueIcon.style.color = '#e11d48'; dueIcon.innerText = 'receipt_long'; }
    } else {
      if(dueCard) { dueCard.style.background = '#ecfdf5'; dueCard.style.borderColor = '#a7f3d0'; }
      if(dueTitle) dueTitle.style.color = '#059669';
      if(dueDate) { dueDate.style.color = '#059669'; dueDate.innerText = 'Cleared'; }
      if(dueStatus) {
        dueStatus.style.color = '#059669';
        let advanceSurplus = roomTotalPaid - grandTotal;
        dueStatus.innerText = advanceSurplus > 0 ? `₹${advanceSurplus.toLocaleString('en-IN')} Extra Paid` : 'All Dues Settled';
      }
      if(dueIcon) { dueIcon.style.color = '#059669'; dueIcon.innerText = 'check_circle'; }
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

  switchRoomDetailsTab('overview');
  openActionScreen('screen-room-details');
}

function checkoutGuest(roomNo) {
  let rooms = RoomPeDB.getActivePropertyRooms();
  let payments = RoomPeDB.getActivePropertyPayments();
  let room = rooms.find(r => String(r.no) === String(roomNo));
  if (!room) return;

  let roomTotalPaid = payments.filter(p => String(p.room) === String(roomNo)).reduce((sum, p) => sum + parseInt(p.amount || 0), 0);
  let basePrice = parseInt(room.price || 0);
  let duration = parseInt(room.duration || 1);
  let expectedRent = basePrice * duration;

  if (room.checkinDate) {
    let checkinDate = new Date(room.checkinDate);
    let expectedCheckoutDate = new Date(checkinDate);
    expectedCheckoutDate.setDate(expectedCheckoutDate.getDate() + duration);
    let today = new Date();
    today.setHours(0,0,0,0);
    expectedCheckoutDate.setHours(0,0,0,0);

    if (today > expectedCheckoutDate) {
      let diffTime = Math.abs(today - expectedCheckoutDate);
      let extraDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      expectedRent += (extraDays * basePrice);
    }
  }

  let remainingDue = expectedRent - roomTotalPaid;

  if (remainingDue > 0) {
    alert(`🚨 CHECKOUT BLOCKED!\n\nRoom ${roomNo} has a pending due of ₹${remainingDue}.\nPlease collect the payment before checking out the guest.`);
    openActionScreen('screen-add-payment');
    document.getElementById('pay-room-no').value = roomNo;
    document.getElementById('pay-amount').value = remainingDue;
    return; 
  }

  if (confirm(`Checkout guest from Room ${roomNo}? Room will be marked for Cleaning.`)) {
    let absoluteRooms = JSON.parse(localStorage.getItem('roompe_rooms')) || [];
    let absIndex = absoluteRooms.findIndex(r => r.no === roomNo && r.propertyId === RoomPeDB.getActiveProperty());
    
    if (absIndex !== -1) {
      absoluteRooms[absIndex].status = 'cleaning';
      absoluteRooms[absIndex].guest = ''; 
      absoluteRooms[absIndex].checkinDate = ''; 
      absoluteRooms[absIndex].duration = '';
      absoluteRooms[absIndex].extras = [];
      localStorage.setItem('roompe_rooms', JSON.stringify(absoluteRooms));
      
      closeActionScreen(); 
      switchTab('rooms'); 
    }
  }
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

function deleteRoom() {
  let originalNo = document.getElementById('edit-original-room-no').value;
  if(confirm(`Permanently delete Room ${originalNo}?`)) {
    let absoluteRooms = JSON.parse(localStorage.getItem('roompe_rooms')) || [];
    let updatedRooms = absoluteRooms.filter(r => !(r.no === originalNo && r.propertyId === RoomPeDB.getActiveProperty()));
    localStorage.setItem('roompe_rooms', JSON.stringify(updatedRooms));
    
    closeActionScreen();
    closeActionScreen();
    switchTab('rooms');
  }
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
}

function contactGuestAction(actionType, roomNo) {
  let rooms = RoomPeDB.getActivePropertyRooms();
  let room = rooms.find(r => String(r.no) === String(roomNo));
  let name = room && room.guest ? room.guest : 'Guest';
  
  if(actionType === 'whatsapp') {
    alert(`📱 WhatsApp Request\n\nOpening WhatsApp to chat with ${name} (Room ${roomNo})...\n\nMessage: "Hi ${name}, this is Shanti Residency."`);
  } else if (actionType === 'call') {
    alert(`📞 Phone Dialer\n\nDialing ${name} (Room ${roomNo})...`);
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

  let props = RoomPeDB.getProperties();
  let newProp = {
    id: 'prop_' + Date.now(),
    name: propName
  };

  props.push(newProp);
  RoomPeDB.saveProperties(props);
  RoomPeDB.setActiveProperty(newProp.id);

  document.getElementById('setup-prop-name').value = ''; 
  updateAppHeaders(); 
  
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById('screen-dashboard').classList.remove('hidden');
  
  alert(propName + " added successfully!");
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
// FIREBASE AUTHENTICATION ENGINE
// ==========================================================================
function checkAutoLogin() {
  if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        localStorage.setItem('roompe_logged_in_user', user.email);
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        routeToDashboard();
      } else {
        localStorage.removeItem('roompe_logged_in_user');
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        document.getElementById('screen-welcome').classList.remove('hidden');
      }
    });
  } else {
    let loggedInUser = localStorage.getItem('roompe_logged_in_user');
    if (loggedInUser) {
      document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
      routeToDashboard();
    } else {
      document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
      document.getElementById('screen-welcome').classList.remove('hidden');
    }
  }
}

function loginWithEmail() {
  let email = document.getElementById('login-email').value.trim();
  let password = document.getElementById('login-password').value.trim();
  if (email === "" || !email.includes('@') || password === "") {
    alert("Bhai, please enter a valid email and password!");
    return;
  }
  if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().signInWithEmailAndPassword(email, password).catch((error) => alert("Login Failed: " + error.message));
  } else {
    localStorage.setItem('roompe_logged_in_user', email);
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    routeToDashboard();
  }
}

function loginWithGoogle() {
  if (typeof firebase !== 'undefined' && firebase.auth) {
    let provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).catch((error) => alert("Google Login Failed: " + error.message));
  } else {
    localStorage.setItem('roompe_logged_in_user', "google_user@gmail.com");
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    routeToDashboard();
  }
}

function logOutApp() {
  if (confirm("Are you sure you want to log out?")) {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      firebase.auth().signOut().catch((error) => console.error("Sign Out Error", error));
    } else {
      localStorage.removeItem('roompe_logged_in_user');
      document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden'));
      document.getElementById('screen-welcome').classList.remove('hidden');
    }
  }
}

function routeToDashboard() {
  let props = RoomPeDB.getProperties();
  if (props.length > 0) {
    document.getElementById('screen-dashboard').classList.remove('hidden');
    updateAppHeaders();
    if (typeof renderRoomsGrid === 'function') renderRoomsGrid();
    if (typeof updateDashboardStats === 'function') updateDashboardStats();
  } else {
    document.getElementById('screen-setup').classList.remove('hidden');
  }
}

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
      id: p.id,
      type: 'Payment',
      title: 'Payment Received',
      desc: `₹${parseInt(p.amount).toLocaleString('en-IN')} received from <b>${p.guest}</b> (Room ${p.room}) via ${p.mode}.`,
      time: p.date,
      icon: 'payments',
      color: '#059669',
      bg: '#ecfdf5',
      action: `closeActionScreen(); openRoomDetails('${p.room}')`,
      pill: 'View Room'
    });
  });

  allBookings.forEach(b => {
    allNotifs.push({
      id: b.id,
      type: 'Booking',
      title: 'New Booking Confirmed',
      desc: `<b>${b.guest}</b> booked Room <b>${b.room}</b> for ${b.duration} nights.`,
      time: b.createdAt,
      icon: 'book_online',
      color: '#4f46e5',
      bg: '#e0e7ff',
      action: `closeActionScreen(); switchTab('bookings')`,
      pill: 'View Booking'
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
// APP INITIALIZATION
// ==========================================================================
window.onload = function() { 
  RoomPeDB.init();
  checkAutoLogin(); 
};
