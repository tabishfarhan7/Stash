// You can add interactivity here if needed
document.querySelector('.btn-neon.large').onclick = () => {
    alert('Welcome to Stash! (Demo action)');
  };

// Modal logic
const tryBtn = document.getElementById('tryBtn');
const modal = document.getElementById('travelModal');
const closeModal = document.getElementById('closeModal');
const travelForm = document.getElementById('travelForm');
const packingPlan = document.getElementById('packingPlan');

tryBtn.onclick = () => {
  modal.style.display = 'block';
};

closeModal.onclick = () => {
  modal.style.display = 'none';
  packingPlan.style.display = 'none';
  travelForm.reset();
};

window.onclick = (event) => {
  if (event.target === modal) {
    modal.style.display = 'none';
    packingPlan.style.display = 'none';
    travelForm.reset();
  }
};

travelForm.onsubmit = (e) => {
  e.preventDefault();
  packingPlan.style.display = 'block';
  packingPlan.innerHTML = '<em>AI packing plan will appear here...</em>';
};
