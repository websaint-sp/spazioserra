/**
 * Spazio Serra - Main JavaScript
 * Arquivo que controla todas as interações da landing page.
 * Utiliza Vanilla JS puro para performance máxima.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. Navbar Sticky
    // ==========================================
    const navbar = document.getElementById('navbar');
    let isScrolled = false;
    
    if (navbar) {
        window.addEventListener('scroll', () => {
            // Usa throttle simples apenas observando valor
            if (window.scrollY > 80) {
                if (!isScrolled) {
                    navbar.classList.add('navbar--scrolled');
                    isScrolled = true;
                }
            } else {
                if (isScrolled) {
                    navbar.classList.remove('navbar--scrolled');
                    isScrolled = false;
                }
            }
        }, { passive: true });
    }

    // ==========================================
    // 2. Mobile Menu Toggle
    // ==========================================
    const menuToggle = document.querySelector('.navbar__toggle');
    const menu = document.querySelector('.navbar__menu');
    const menuLinks = document.querySelectorAll('.navbar__menu a');

    if (menuToggle && menu) {
        const toggleMenu = () => {
            menu.classList.toggle('navbar__menu--open');
            // Previne rolagem do body quando menu está aberto no mobile (opcional, mas recomendado)
            if (menu.classList.contains('navbar__menu--open')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        };
        
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        // Fechar o menu ao clicar em qualquer link
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (menu.classList.contains('navbar__menu--open')) {
                    toggleMenu();
                }
            });
        });

        // Fechar ao clicar fora do menu
        document.addEventListener('click', (e) => {
            if (menu.classList.contains('navbar__menu--open') && 
                !menu.contains(e.target) && 
                !menuToggle.contains(e.target)) {
                toggleMenu();
            }
        });
    }

    // ==========================================
    // 3. Scroll Reveal (Intersection Observer)
    // ==========================================
    const revealElements = document.querySelectorAll('.reveal');
    
    if (revealElements.length > 0 && 'IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal--visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.05,
            rootMargin: '0px 0px 50px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
        
        // Força revelação dos elementos visíveis no topo no primeiro segundo
        setTimeout(() => {
            revealElements.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight) {
                    el.classList.add('reveal--visible');
                }
            });
        }, 100);
    } else {
        // Fallback: se não suportar IntersectionObserver, mostra tudo
        revealElements.forEach(el => el.classList.add('reveal--visible'));
    }

    // ==========================================
    // 4. Contadores Animados
    // ==========================================
    const counterElements = document.querySelectorAll('[data-count]');
    
    if (counterElements.length > 0) {
        const animateCounter = (el) => {
            const target = parseFloat(el.getAttribute('data-count'));
            const suffix = el.getAttribute('data-suffix') || '';
            const duration = 2000; // ~2000ms
            let startTimestamp = null;
            
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                
                // ease-out
                const easeOut = 1 - Math.pow(1 - progress, 3);
                
                // Formatação: se for int mostra sem casas decimais, senão com 1 ou 2 dependendo do original
                const isInteger = target % 1 === 0;
                const current = isInteger ? Math.floor(easeOut * target) : (easeOut * target).toFixed(1);
                
                el.textContent = current + suffix;
                
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    el.textContent = target + suffix;
                }
            };
            
            window.requestAnimationFrame(step);
        };

        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    // Garante que cada contador anime apenas uma vez
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counterElements.forEach(el => counterObserver.observe(el));
    }

    // ==========================================
    // 5. Lightbox da Galeria
    // ==========================================
    const lightbox = document.getElementById('lightbox');
    const galleryItems = document.querySelectorAll('.galeria__item');
    
    if (lightbox && galleryItems.length > 0) {
        const lightboxImg = lightbox.querySelector('.lightbox__image');
        const lightboxCaption = lightbox.querySelector('.lightbox__caption');
        const closeBtn = lightbox.querySelector('.lightbox__close');
        const prevBtn = lightbox.querySelector('.lightbox__prev');
        const nextBtn = lightbox.querySelector('.lightbox__next');
        
        let currentIndex = 0;

        const openLightbox = (index) => {
            const item = galleryItems[index];
            const img = item.querySelector('img');
            const label = item.querySelector('.galeria__item__label');
            
            if (img && lightboxImg) {
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt || '';
            }
            
            if (label && lightboxCaption) {
                lightboxCaption.textContent = label.textContent;
            } else if (lightboxCaption) {
                lightboxCaption.textContent = '';
            }
            
            lightbox.classList.add('lightbox--active');
            // Prevenir scroll do body quando lightbox estiver aberto
            document.body.style.overflow = 'hidden';
            currentIndex = index;
        };

        const closeLightbox = () => {
            lightbox.classList.remove('lightbox--active');
            // Restaurar scroll do body
            document.body.style.overflow = '';
        };

        const showPrev = (e) => {
            if (e) e.stopPropagation();
            currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
            openLightbox(currentIndex);
        };

        const showNext = (e) => {
            if (e) e.stopPropagation();
            currentIndex = (currentIndex + 1) % galleryItems.length;
            openLightbox(currentIndex);
        };

        // Adiciona evento em todos os itens da galeria
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                openLightbox(index);
            });
        });

        // Suporte para abrir imagens de planta no Lightbox
        const plantaImages = document.querySelectorAll('.planta-card__image');
        plantaImages.forEach(cardImg => {
            cardImg.addEventListener('click', (e) => {
                e.preventDefault();
                const src = cardImg.getAttribute('data-lightbox-src') || cardImg.querySelector('img').src;
                const caption = cardImg.getAttribute('data-caption') || '';
                
                if (lightboxImg) {
                    lightboxImg.src = src;
                    lightboxImg.alt = caption;
                }
                if (lightboxCaption) {
                    lightboxCaption.textContent = caption;
                }
                lightbox.classList.add('lightbox--active');
                document.body.style.overflow = 'hidden';
            });
        });

        // Controles via botão
        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
        if (prevBtn) prevBtn.addEventListener('click', showPrev);
        if (nextBtn) nextBtn.addEventListener('click', showNext);

        // Click no backdrop (fora da imagem) fecha o lightbox
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // Navegação pelo teclado
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('lightbox--active')) return;
            
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') showPrev();
            if (e.key === 'ArrowRight') showNext();
        });
    }

    // ==========================================
    // 6. Smooth Scroll
    // ==========================================
    const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    const headerOffset = 80; // Offset para compensar a navbar fixa
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const hash = link.getAttribute('href');
            const target = document.querySelector(hash);
            
            if (target) {
                e.preventDefault();
                
                // Fecha o menu mobile, se aberto
                if (menu && menu.classList.contains('navbar__menu--open')) {
                    menu.classList.remove('navbar__menu--open');
                    document.body.style.overflow = '';
                }
                
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==========================================
    // 7. Active Nav Link on Scroll
    // ==========================================
    const sections = document.querySelectorAll('section[id]');
    
    if (sections.length > 0 && menuLinks.length > 0) {
        const updateActiveLink = () => {
            let currentId = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                // Compensa o header e ativa um pouco antes de chegar na seção
                if (window.pageYOffset >= (sectionTop - headerOffset - 50)) {
                    currentId = section.getAttribute('id');
                }
            });

            menuLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentId}`) {
                    link.classList.add('active');
                }
            });
        };

        window.addEventListener('scroll', updateActiveLink, { passive: true });
        updateActiveLink(); 
    }

    // ==========================================
    // 8. Plantas Tabs Toggle
    // ==========================================
    const tabBtns = document.querySelectorAll('.plantas__tab-btn');
    const tabContents = document.querySelectorAll('.plantas__content');

    if (tabBtns.length > 0 && tabContents.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');
                
                // Remove active de todos os botões e conteúdos
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // Adiciona active ao botão clicado e ao conteúdo correspondente
                btn.classList.add('active');
                const activeContent = document.getElementById(`tab-${targetTab}`);
                if (activeContent) {
                    activeContent.classList.add('active');
                }
            });
        });
    }
});
