// Efecto Parallax simple para títulos y fondo
// Parallax solo en el título, sin afectar el resto de las secciones
window.addEventListener('scroll', function() {
	const scrolled = window.scrollY;
	const h1 = document.querySelector('.intro h1');
	if (h1) {
		h1.style.transform = `translateY(${scrolled * 0.15}px)`;
	}
});
