const tourGrid = document.getElementById('tourGrid');
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');

function getStep() {
  const firstCard = tourGrid.querySelector('.tour-card:not([hidden])');
  const gap = Number.parseFloat(getComputedStyle(tourGrid).columnGap) || 20;
  return firstCard ? firstCard.offsetWidth + gap : 260;
}

prevBtn.addEventListener('click', () => {
  tourGrid.scrollBy({ left: -getStep(), behavior: 'smooth' });
});

nextBtn.addEventListener('click', () => {
  tourGrid.scrollBy({ left: getStep(), behavior: 'smooth' });
});

const tourFilterButtons = document.querySelectorAll('.tour-filter');
const tourCards = Array.from(tourGrid.querySelectorAll('.tour-card'));
tourFilterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const region = button.dataset.region;
    tourFilterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle('active', isActive);
      filterButton.setAttribute('aria-pressed', String(isActive));
    });
    tourCards.forEach((card) => {
      card.hidden = region !== 'all' && card.dataset.region !== region;
    });
    tourGrid.scrollTo({ left: 0, behavior: 'smooth' });
  });
});

const tourDialog = document.getElementById('tourQuickView');
const tourDialogImage = tourDialog.querySelector('.tour-dialog-image');
const tourDialogRegion = tourDialog.querySelector('.tour-dialog-region');
const tourDialogTitle = tourDialog.querySelector('.tour-dialog-title');
const tourDialogDescription = tourDialog.querySelector('.tour-dialog-description');
const tourDialogPrice = tourDialog.querySelector('.tour-dialog-price');
const tourDialogLink = tourDialog.querySelector('.tour-dialog-link');

document.querySelectorAll('.tour-quick-view').forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.tour-card');
    const image = card.querySelector('.tour-img');
    tourDialogImage.src = image.src;
    tourDialogImage.alt = image.alt;
    tourDialogRegion.textContent = card.querySelector('.tour-badge').textContent;
    tourDialogTitle.textContent = card.querySelector('.tour-title').textContent;
    tourDialogDescription.textContent = card.querySelector('.tour-description').textContent;
    tourDialogPrice.textContent = `Giá từ ${card.querySelector('.tour-price strong').textContent}`;
    tourDialogLink.href = card.querySelector('.tour-details-link').href;
    tourDialog.showModal();
  });
});

tourDialog.querySelector('.tour-dialog-close').addEventListener('click', () => {
  tourDialog.close();
});
tourDialog.addEventListener('click', (event) => {
  if (event.target === tourDialog) tourDialog.close();
});

const departureInput = document.getElementById('departure');
const destinationInput = document.getElementById('destination');
const departureOptions = [
  { label: 'Tất cả' },
  { label: 'Hà Nội' },
  { label: 'TP. Hồ Chí Minh' },
  { label: 'Đà Nẵng' },
  { label: 'Nghệ An' }
];
const destinationOptions = [
  { label: 'Nghệ An', image: 'images/nghean.jpg' },
  { label: 'Đà Lạt', image: 'images/dalat.webp' },
  { label: 'Hà Giang', image: 'images/hagiang.jpg' },
  { label: 'Đà Nẵng - Hội An', image: 'images/danang.jpg' },
  { label: 'Phú Quốc', image: 'images/phuquoc.jpg' },
  { label: 'TP.HCM - Địa đạo Củ Chi', image: 'images/cuchi.jpg' },
  { label: 'Sapa', image: 'images/sapa1.webp' }
];

function normalizePlace(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

function setupAutocomplete(input, options) {
  const field = input.closest('.autocomplete-field');
  const list = document.getElementById(input.getAttribute('aria-controls'));
  let activeIndex = -1;

  function closeList() {
    list.classList.remove('is-open');
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    activeIndex = -1;
  }

  function selectOption(option) {
    input.value = option.label;
    closeList();
    input.focus();
  }

  function setActiveOption(index) {
    const buttons = Array.from(list.querySelectorAll('.suggestion-option'));
    if (!buttons.length) return;

    activeIndex = (index + buttons.length) % buttons.length;
    buttons.forEach((button, buttonIndex) => {
      const isActive = buttonIndex === activeIndex;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-selected', String(isActive));
    });
    input.setAttribute('aria-activedescendant', buttons[activeIndex].id);
    buttons[activeIndex].scrollIntoView({ block: 'nearest' });
  }

  function renderOptions() {
    const query = normalizePlace(input.value);
    const matches = options.filter((option) => normalizePlace(option.label).includes(query));
    list.replaceChildren();
    activeIndex = -1;

    if (!matches.length) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'suggestion-empty';
      emptyMessage.textContent = 'Không tìm thấy địa điểm';
      list.appendChild(emptyMessage);
    } else {
      matches.forEach((option, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'suggestion-option';
        button.id = `${list.id}-option-${index}`;
        button.setAttribute('role', 'option');
        button.setAttribute('aria-selected', 'false');

        if (option.image) {
          const image = document.createElement('img');
          image.className = 'suggestion-image';
          image.src = option.image;
          image.alt = '';
          button.appendChild(image);
        } else {
          const icon = document.createElement('span');
          icon.className = 'suggestion-icon';
          icon.setAttribute('aria-hidden', 'true');
          const marker = document.createElement('i');
          marker.className = 'bi bi-geo-alt';
          icon.appendChild(marker);
          button.appendChild(icon);
        }

        const label = document.createElement('span');
        label.textContent = option.label;
        button.appendChild(label);
        button.addEventListener('mousedown', (event) => event.preventDefault());
        button.addEventListener('click', () => selectOption(option));
        list.appendChild(button);
      });
    }

    list.classList.add('is-open');
    input.setAttribute('aria-expanded', 'true');
  }

  input.addEventListener('focus', renderOptions);
  input.addEventListener('input', renderOptions);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!list.classList.contains('is-open')) renderOptions();
      setActiveOption(activeIndex + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!list.classList.contains('is-open')) renderOptions();
      setActiveOption(activeIndex < 0 ? -1 : activeIndex - 1);
    } else if (event.key === 'Enter' && list.classList.contains('is-open')) {
      const buttons = list.querySelectorAll('.suggestion-option');
      if (buttons.length) {
        event.preventDefault();
        buttons[activeIndex < 0 ? 0 : activeIndex].click();
      }
    } else if (event.key === 'Escape') {
      closeList();
    }
  });

  document.addEventListener('click', (event) => {
    if (!field.contains(event.target)) closeList();
  });
}

function clearDeparture() {
  departureInput.value = '';
  departureInput.focus();
}

setupAutocomplete(departureInput, departureOptions);
setupAutocomplete(destinationInput, destinationOptions);

const serviceTabs = document.querySelectorAll('.tabs .tab');
const servicePanels = document.querySelectorAll('.service-panel');
serviceTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const selectedPanel = document.querySelector(`[data-service-panel="${tab.dataset.service}"]`);
    if (!selectedPanel) return;

    serviceTabs.forEach((item) => {
      const isSelected = item === tab;
      item.classList.toggle('active', isSelected);
      item.setAttribute('aria-selected', String(isSelected));
    });
    servicePanels.forEach((panel) => {
      panel.hidden = panel !== selectedPanel;
    });
  });
});

const flightOriginInput = document.getElementById('flightOrigin');
const flightDestinationInput = document.getElementById('flightDestination');
const airportOptions = [
  { label: 'Hà Nội (HAN)' },
  { label: 'TP. Hồ Chí Minh (SGN)' },
  { label: 'Đà Nẵng (DAD)' },
  { label: 'Nghệ An - Vinh (VII)' },
  { label: 'Singapore (SIN)' },
  { label: 'Brunei (BWN)' },
  { label: 'Hàn Quốc - Incheon (ICN)' }
];
setupAutocomplete(flightOriginInput, airportOptions);
setupAutocomplete(flightDestinationInput, airportOptions);

const comboFlightOriginInput = document.getElementById('comboFlightOrigin');
const comboFlightDestinationInput = document.getElementById('comboFlightDestination');
const comboHotelDestinationInput = document.getElementById('comboHotelDestination');
setupAutocomplete(comboFlightOriginInput, airportOptions);
setupAutocomplete(comboFlightDestinationInput, airportOptions);

const hotelDestinationInput = document.getElementById('hotelDestination');
const hotelDestinationOptions = [
  { label: 'Hà Nội' },
  { label: 'TP. Hồ Chí Minh' },
  { label: 'Đà Nẵng' },
  { label: 'Đà Lạt' },
  { label: 'Nghệ An' },
  { label: 'Phú Quốc' },
  { label: 'Hà Giang' },
  { label: 'Nha Trang' },
  { label: 'Hội An' },
  { label: 'Sa Pa' }
];
setupAutocomplete(hotelDestinationInput, hotelDestinationOptions);
setupAutocomplete(comboHotelDestinationInput, hotelDestinationOptions);

const tripTypeInputs = document.querySelectorAll('input[name="tripType"]');
const returnDateField = document.querySelector('.return-date-field');
const departDateInput = document.getElementById('flightDepartDate');
const returnDateInput = document.getElementById('flightReturnDate');

function toLocalDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDaysToDateInputValue(value, days) {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toLocalDateInputValue(date);
}

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const dayAfterTomorrow = new Date(tomorrow);
dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
departDateInput.min = toLocalDateInputValue(today);
departDateInput.value = toLocalDateInputValue(tomorrow);
returnDateInput.min = toLocalDateInputValue(tomorrow);
returnDateInput.value = toLocalDateInputValue(dayAfterTomorrow);

const hotelCheckInInput = document.getElementById('hotelCheckIn');
const hotelCheckOutInput = document.getElementById('hotelCheckOut');
const hotelNightCount = document.querySelector('.hotel-night-count');
const hotelToday = toLocalDateInputValue(today);
const hotelTomorrow = toLocalDateInputValue(tomorrow);
hotelCheckInInput.min = hotelToday;
hotelCheckInInput.value = hotelTomorrow;
hotelCheckOutInput.min = addDaysToDateInputValue(hotelTomorrow, 1);
hotelCheckOutInput.value = addDaysToDateInputValue(hotelTomorrow, 1);

function updateHotelNightCount() {
  if (!hotelCheckInInput.value || !hotelCheckOutInput.value) {
    hotelNightCount.textContent = '';
    return;
  }

  const checkIn = new Date(`${hotelCheckInInput.value}T00:00:00`);
  const checkOut = new Date(`${hotelCheckOutInput.value}T00:00:00`);
  const nights = Math.round((checkOut - checkIn) / 86400000);
  hotelNightCount.textContent = `${Math.max(0, nights)} đêm`;
}

hotelCheckInInput.addEventListener('change', () => {
  hotelCheckOutInput.min = addDaysToDateInputValue(hotelCheckInInput.value, 1);
  if (hotelCheckOutInput.value <= hotelCheckInInput.value) {
    hotelCheckOutInput.value = hotelCheckOutInput.min;
  }
  updateHotelNightCount();
});
hotelCheckOutInput.addEventListener('change', updateHotelNightCount);
updateHotelNightCount();

const comboFlightDepartInput = document.getElementById('comboFlightDepartDate');
const comboFlightReturnInput = document.getElementById('comboFlightReturnDate');
const comboHotelCheckInInput = document.getElementById('comboHotelCheckIn');
const comboHotelCheckOutInput = document.getElementById('comboHotelCheckOut');
comboFlightDepartInput.min = hotelToday;
comboFlightDepartInput.value = hotelTomorrow;
comboFlightReturnInput.min = addDaysToDateInputValue(hotelTomorrow, 1);
comboFlightReturnInput.value = addDaysToDateInputValue(hotelTomorrow, 1);
comboHotelCheckInInput.min = hotelToday;
comboHotelCheckInInput.value = hotelTomorrow;
comboHotelCheckOutInput.min = addDaysToDateInputValue(hotelTomorrow, 1);
comboHotelCheckOutInput.value = addDaysToDateInputValue(hotelTomorrow, 1);

comboFlightDepartInput.addEventListener('change', () => {
  comboFlightReturnInput.min = addDaysToDateInputValue(comboFlightDepartInput.value, 1);
  if (comboFlightReturnInput.value <= comboFlightDepartInput.value) {
    comboFlightReturnInput.value = comboFlightReturnInput.min;
  }
});
comboHotelCheckInInput.addEventListener('change', () => {
  comboHotelCheckOutInput.min = addDaysToDateInputValue(comboHotelCheckInInput.value, 1);
  if (comboHotelCheckOutInput.value <= comboHotelCheckInInput.value) {
    comboHotelCheckOutInput.value = comboHotelCheckOutInput.min;
  }
});

departDateInput.addEventListener('change', () => {
  returnDateInput.min = departDateInput.value;
  if (returnDateInput.value < departDateInput.value) {
    returnDateInput.value = departDateInput.value;
  }
});

tripTypeInputs.forEach((input) => {
  input.addEventListener('change', () => {
    const isRoundTrip = input.value === 'roundtrip' && input.checked;
    returnDateField.hidden = !isRoundTrip;
    returnDateInput.disabled = !isRoundTrip;
  });
});

const passengerCounts = { adult: 2, child: 0, infant: 0 };
const passengerToggle = document.querySelector('.passenger-toggle');
const passengerOptionsPanel = document.getElementById('passengerOptions');

function updatePassengerPicker() {
  Object.entries(passengerCounts).forEach(([type, count]) => {
    document.querySelector(`[data-passenger-count="${type}"]`).textContent = count;
    document.querySelector(`[data-passenger-value="${type}"]`).textContent = count;
  });

  document.querySelectorAll('[data-passenger-change]').forEach((button) => {
    const type = button.dataset.passengerType;
    const change = Number(button.dataset.passengerChange);
    const total = Object.values(passengerCounts).reduce((sum, count) => sum + count, 0);
    const minimumReached = type === 'adult'
      ? passengerCounts.adult <= Math.max(1, passengerCounts.infant)
      : passengerCounts[type] === 0;
    const maximumReached = change > 0 && (
      total >= 9 || (type === 'infant' && passengerCounts.infant >= passengerCounts.adult)
    );
    button.disabled = change < 0 ? minimumReached : maximumReached;
  });
}

updatePassengerPicker();
passengerToggle.addEventListener('click', () => {
  const isOpen = passengerToggle.getAttribute('aria-expanded') === 'true';
  passengerToggle.setAttribute('aria-expanded', String(!isOpen));
  passengerOptionsPanel.hidden = isOpen;
});

passengerOptionsPanel.addEventListener('click', (event) => {
  const button = event.target.closest('[data-passenger-change]');
  if (!button) return;

  const type = button.dataset.passengerType;
  const change = Number(button.dataset.passengerChange);
  passengerCounts[type] += change;
  updatePassengerPicker();
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.passenger-picker')) {
    passengerToggle.setAttribute('aria-expanded', 'false');
    passengerOptionsPanel.hidden = true;
  }
});

const hotelGuestCounts = { rooms: 1, adults: 2, children: 0 };
const hotelGuestToggle = document.querySelector('.hotel-guest-toggle');
const hotelGuestOptions = document.getElementById('hotelGuestOptions');

function updateHotelGuestPicker() {
  Object.entries(hotelGuestCounts).forEach(([type, count]) => {
    document.querySelector(`[data-hotel-guest-count="${type}"]`).textContent = count;
    document.querySelector(`[data-hotel-guest-value="${type}"]`).textContent = count;
  });

  const totalGuests = hotelGuestCounts.adults + hotelGuestCounts.children;
  document.querySelectorAll('[data-hotel-guest-change]').forEach((button) => {
    const type = button.dataset.hotelGuestType;
    const change = Number(button.dataset.hotelGuestChange);
    const minimum = type === 'rooms' || type === 'adults' ? 1 : 0;
    const maximum = type === 'rooms' ? 9 : 16;
    const currentCount = hotelGuestCounts[type];
    const limitReached = type === 'rooms'
      ? currentCount >= maximum
      : totalGuests >= maximum;
    button.disabled = change < 0
      ? currentCount <= minimum
      : (type === 'rooms' ? currentCount >= maximum : limitReached);
  });
}

updateHotelGuestPicker();
hotelGuestToggle.addEventListener('click', () => {
  const isOpen = hotelGuestToggle.getAttribute('aria-expanded') === 'true';
  hotelGuestToggle.setAttribute('aria-expanded', String(!isOpen));
  hotelGuestOptions.hidden = isOpen;
});

hotelGuestOptions.addEventListener('click', (event) => {
  const button = event.target.closest('[data-hotel-guest-change]');
  if (!button) return;

  const type = button.dataset.hotelGuestType;
  hotelGuestCounts[type] += Number(button.dataset.hotelGuestChange);
  updateHotelGuestPicker();
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.hotel-guest-picker')) {
    hotelGuestToggle.setAttribute('aria-expanded', 'false');
    hotelGuestOptions.hidden = true;
  }
});

document.querySelector('.hotel-search-btn').addEventListener('click', () => {
  const message = document.querySelector('.hotel-search-message');
  const destination = hotelDestinationInput.value.trim();

  if (!destination) {
    message.textContent = 'Vui lòng nhập điểm đến hoặc tên khách sạn.';
    return;
  }
  if (!hotelCheckInInput.value || !hotelCheckOutInput.value
      || hotelCheckOutInput.value <= hotelCheckInInput.value) {
    message.textContent = 'Ngày trả phòng phải sau ngày nhận phòng.';
    return;
  }

  message.textContent = 'Thông tin tìm phòng đã sẵn sàng. Tra cứu phòng trống cần kết nối hệ thống khách sạn.';
});

const comboGuestCounts = { rooms: 1, adults: 1, children: 0, infants: 0 };
const comboGuestToggle = document.querySelector('.combo-guest-toggle');
const comboGuestOptions = document.getElementById('comboGuestOptions');

function updateComboGuestPicker() {
  Object.entries(comboGuestCounts).forEach(([type, count]) => {
    document.querySelector(`[data-combo-guest-count="${type}"]`).textContent = count;
    document.querySelector(`[data-combo-guest-value="${type}"]`).textContent = count;
  });

  const totalPassengers = comboGuestCounts.adults + comboGuestCounts.children + comboGuestCounts.infants;
  document.querySelectorAll('[data-combo-guest-change]').forEach((button) => {
    const type = button.dataset.comboGuestType;
    const change = Number(button.dataset.comboGuestChange);
    const currentCount = comboGuestCounts[type];
    const minimum = type === 'rooms' || type === 'adults'
      ? Math.max(1, type === 'adults' ? comboGuestCounts.infants : 1)
      : 0;
    const limitReached = type === 'rooms'
      ? currentCount >= 9
      : totalPassengers >= 9 || (type === 'infants' && currentCount >= comboGuestCounts.adults);
    button.disabled = change < 0
      ? currentCount <= minimum
      : (type === 'rooms' ? currentCount >= 9 : limitReached);
  });
}

updateComboGuestPicker();
comboGuestToggle.addEventListener('click', () => {
  const isOpen = comboGuestToggle.getAttribute('aria-expanded') === 'true';
  comboGuestToggle.setAttribute('aria-expanded', String(!isOpen));
  comboGuestOptions.hidden = isOpen;
});

comboGuestOptions.addEventListener('click', (event) => {
  const button = event.target.closest('[data-combo-guest-change]');
  if (!button) return;

  const type = button.dataset.comboGuestType;
  comboGuestCounts[type] += Number(button.dataset.comboGuestChange);
  updateComboGuestPicker();
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.combo-guest-picker')) {
    comboGuestToggle.setAttribute('aria-expanded', 'false');
    comboGuestOptions.hidden = true;
  }
});

document.querySelector('.combo-flight-route .swap-route').addEventListener('click', () => {
  const currentOrigin = comboFlightOriginInput.value;
  comboFlightOriginInput.value = comboFlightDestinationInput.value;
  comboFlightDestinationInput.value = currentOrigin;
});

document.querySelector('.combo-search-btn').addEventListener('click', () => {
  const message = document.querySelector('.combo-search-message');
  const origin = comboFlightOriginInput.value.trim();
  const flightDestination = comboFlightDestinationInput.value.trim();
  const hotelDestination = comboHotelDestinationInput.value.trim();

  if (!origin || !flightDestination || !hotelDestination) {
    message.textContent = 'Vui lòng nhập điểm đi, điểm đến và địa điểm khách sạn.';
    return;
  }
  if (normalizePlace(origin) === normalizePlace(flightDestination)) {
    message.textContent = 'Điểm đi và điểm đến phải khác nhau.';
    return;
  }
  if (comboFlightReturnInput.value <= comboFlightDepartInput.value) {
    message.textContent = 'Ngày về phải sau ngày đi.';
    return;
  }
  if (comboHotelCheckOutInput.value <= comboHotelCheckInInput.value) {
    message.textContent = 'Ngày trả phòng phải sau ngày nhận phòng.';
    return;
  }

  message.textContent = 'Thông tin vé máy bay và khách sạn đã sẵn sàng. Tra cứu giá và phòng trống cần kết nối hệ thống đặt dịch vụ.';
});

document.querySelector('.swap-route').addEventListener('click', () => {
  const currentOrigin = flightOriginInput.value;
  flightOriginInput.value = flightDestinationInput.value;
  flightDestinationInput.value = currentOrigin;
});

document.querySelector('.flight-search-btn').addEventListener('click', () => {
  const message = document.querySelector('.flight-search-message');
  const origin = flightOriginInput.value.trim();
  const destination = flightDestinationInput.value.trim();
  const isRoundTrip = document.querySelector('input[name="tripType"]:checked').value === 'roundtrip';

  if (!origin || !destination) {
    message.textContent = 'Vui lòng chọn điểm đi và điểm đến.';
    return;
  }
  if (normalizePlace(origin) === normalizePlace(destination)) {
    message.textContent = 'Điểm đi và điểm đến phải khác nhau.';
    return;
  }
  if (isRoundTrip && returnDateInput.value < departDateInput.value) {
    message.textContent = 'Ngày về không thể trước ngày đi.';
    return;
  }

  message.textContent = 'Thông tin chuyến bay đã sẵn sàng. Tra cứu giá vé cần kết nối hệ thống đặt vé.';
});
