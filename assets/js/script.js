let navLinks = document.querySelectorAll('a.inner-link');

navLinks.forEach((item) => {
  item.addEventListener('click', function (e) {
    const href = item.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();

      const currentActiveLink = document.querySelector('nav ul li a.active');
      if (currentActiveLink) currentActiveLink.classList.remove('active');

      const targetLink = document.querySelector(`nav ul li a[href='${href}']`);
      if (targetLink) targetLink.classList.add('active');

      const currentSection = document.querySelector('main > section.active');
      if (currentSection) currentSection.classList.remove('active');

      const targetSection = document.querySelector(`main > section${href}`);
      if (targetSection) targetSection.classList.add('active');
    }
  });
});




document.querySelector('#sidebar .toggle-sidebar').addEventListener('click', function () {
    document.querySelector('#sidebar').classList.toggle('open')
})



var options = {
    strings: ['SaaS', 'IT Infrastructure Solutions', 'Web Application Development', 'Cloud Computing Services'],
    loop: true,
    typeSpeed: 60,    
    backSpeed: 40,    
    startDelay: 500,   
    backDelay: 1500,   
    cursorChar: '|',    
    showCursor: true,   
    smartBackspace: false,
};

new Typed('.field h2', options);



for (let i = 1; i <= 15; i++) {
    let meteor = document.createElement('span');
    meteor.classList = 'meteor'
    document.querySelector('#home .meteor-shower').append(meteor);
}



const shuffleInstance = new Shuffle(document.querySelector('#my_work .work-items'), {
    itemSelector: '.item'
});

const filterButtons = document.querySelectorAll('#my_work .filters button')

filterButtons.forEach((item) => {
  item.addEventListener('click', workFilter);
});

function workFilter(e) {
  const clickedButton = e.currentTarget;
  const clickedButtonGroup = clickedButton.getAttribute('data-group');
  const activeButton = document.querySelector('#my_work .filters button.active');

  if (activeButton) activeButton.classList.remove('active');
  clickedButton.classList.add('active');

  shuffleInstance.filter(clickedButtonGroup);
}


var workModal = new bootstrap.Modal(document.getElementById('workModal'))
const workElements = document.querySelectorAll("#my_work .work-items .wrap");

workElements.forEach((item) => {
    item.addEventListener('click', function () {
        document.querySelector('#workModal .modal-body img').setAttribute('src', item.getAttribute('data-image'))
        document.querySelector('#workModal .modal-body .title').innerText = item.getAttribute('data-title')
        document.querySelector('#workModal .modal-body .description').innerText = item.getAttribute('data-description')
        document.querySelector('#workModal .modal-body .client .value').innerText = item.getAttribute('data-client')
        document.querySelector('#workModal .modal-body .completed .value').innerText = item.getAttribute('data-completed')
        document.querySelector('#workModal .modal-body .skills .value').innerText = item.getAttribute('data-skills')
        
        const projectLink = item.getAttribute('data-project-link');
const projectLinkBox = document.querySelector('#workModal .modal-body .project-link');

if (projectLink) {
    projectLinkBox.style.display = 'block';
    projectLinkBox.querySelector('a').setAttribute('href', projectLink);
    projectLinkBox.querySelector('a').setAttribute('target', '_blank');
} else {
    projectLinkBox.style.display = 'none';
}


        workModal.show();
    })
})

var workModalElement = document.getElementById('workModal')
workModalElement.addEventListener('show.bs.modal', function (event) {
    document.getElementById('my_work').classList.add('blur');
    document.getElementById('sidebar').classList.add('blur');
})

workModalElement.addEventListener('hide.bs.modal', function (event) {
    document.getElementById('my_work').classList.remove('blur');
    document.getElementById('sidebar').classList.remove('blur');
})





let testimonialImages = document.querySelectorAll('#testimonial .images img');

testimonialImages.forEach((item, index) => {
    let position = index + 1;

    item.addEventListener('click', function () {
        document.querySelector('#testimonial .images img.active').classList.remove('active')
        document.querySelector(`#testimonial .images img:nth-child(${position})`).classList.add('active')

        document.querySelector('#testimonial .comments .item.active').classList.remove('active')
        document.querySelector(`#testimonial .comments .item:nth-child(${position})`).classList.add('active')
    })
})





let contactFromItems = document.querySelectorAll('#contact_me .form input, #contact_me .form textarea');

contactFromItems.forEach((item) => {
    item.addEventListener('focus', function () {
        item.parentElement.classList.add('focus')
    })

    item.addEventListener('blur', function () {
        if (!item.value) {
            item.parentElement.classList.remove('focus')
        }
    })
})





function toggleMode() {
    let theme = document.querySelector('html').getAttribute('theme');

    if(theme == "dark") {
        theme = "light";
        new Audio('./assets/audio/light.wav').play()
    } else {
        theme = "dark";
        new Audio('./assets/audio/dark.wav').play()
    }

    document.querySelector('html').setAttribute("theme", theme)
}

fetch('https://eugeniogiustitechsolutions.com/assets/blog/posts.json?v=20250819', { cache: 'no-store' })
  .then(res => res.json())
  .then(articles => {
    const container = document.getElementById('blog-articles');

    // Ordina articoli dalla data più recente alla più vecchia
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));

    articles.forEach(article => {
      const col = document.createElement('div');
      col.className = 'col-md-6 col-lg-4 mb-4';

      col.innerHTML = `
        <div class="card card-gradient h-100">
          <img src="${article.image}" class="card-img-top" alt="${article.title}">
          <div class="card-body">
            <h5 class="card-title">${article.title}</h5>
            <p class="card-text">${article.description}</p>
            <a href="${article.link}" target="_blank" class="btn btn-primary">Read more</a>
          </div>
          <div class="card-footer text-muted">${article.date}</div>
        </div>
      `;

      container.appendChild(col);
    });
  })
  .catch(error => console.error("Error loading blog posts:", error));

  // Handle direct URL access with #hash (deep linking)
window.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash;
  
    if (hash) {
      // Rimuove classe active da tutti
      document.querySelectorAll('nav ul li a.active').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('main > section.active').forEach(el => el.classList.remove('active'));
  
      // Aggiunge classe active all'elemento giusto
      const navLink = document.querySelector(`nav ul li a[href='${hash}']`);
      const targetSection = document.querySelector(`main > section${hash}`);
  
      if (navLink) navLink.classList.add('active');
      if (targetSection) targetSection.classList.add('active');
    }
});

window.addEventListener('DOMContentLoaded', () => {
  const pricingConfig = window.softwareDevelopmentPricing || {};
  const priceNodes = document.querySelectorAll('[data-software-dev-price]');
  const checkoutNodes = document.querySelectorAll('[data-software-dev-checkout]');

  priceNodes.forEach((node) => {
    const key = node.getAttribute('data-software-dev-price');
    const plan = pricingConfig[key];

    if (plan && typeof plan.price === 'number') {
      node.textContent = `€${plan.price.toLocaleString('en-US')}`;
    }
  });

  checkoutNodes.forEach((node) => {
    const key = node.getAttribute('data-software-dev-checkout');
    const plan = pricingConfig[key];

    if (plan && typeof plan.stripeLink === 'string' && plan.stripeLink.startsWith('https://')) {
      node.setAttribute('href', plan.stripeLink);
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    } else {
      node.setAttribute('href', '#contact_me');
    }
  });
});

  // === Mailto offuscato (per i bottoni con .js-mailto) ===
document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".js-mailto");
  links.forEach((el) => {
    const user = el.dataset.u || "";
    const domain = el.dataset.d || "";
    const subject = encodeURIComponent(el.dataset.subject || "");
    const body = encodeURIComponent(el.dataset.body || "");
    if (!user || !domain) return;

    const params = [];
    if (subject) params.push(`subject=${subject}`);
    if (body) params.push(`body=${body}`);

    const href = `mailto:${user}@${domain}${params.length ? "?" + params.join("&") : ""}`;
    el.setAttribute("href", href);
  });
});
