// Admin client-side JS
document.addEventListener('DOMContentLoaded', () => {
  // Auto-generate slug from title
  const titleInput = document.querySelector('input[name="title"]');
  const slugInput = document.querySelector('input[name="slug"]');
  if (titleInput && slugInput && !slugInput.value) {
    titleInput.addEventListener('input', () => {
      slugInput.value = titleInput.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    });
  }

  // Auto-generate artist slug
  const nameInput = document.querySelector('input[name="name"]');
  const artistSlug = document.querySelector('input[name="slug"]');
  if (nameInput && artistSlug && !artistSlug.value && !titleInput) {
    nameInput.addEventListener('input', () => {
      artistSlug.value = nameInput.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    });
  }

  // Confirm deletes
  document.querySelectorAll('form[action*="/delete"]').forEach(form => {
    if (!form.getAttribute('onsubmit')) {
      form.addEventListener('submit', (e) => {
        if (!confirm('Are you sure you want to delete this?')) {
          e.preventDefault();
        }
      });
    }
  });
});
