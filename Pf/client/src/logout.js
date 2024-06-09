
function logout({setlogout}){
  // Redirigir al usuario a la página de inicio de sesión
  alert("¿estas segur@ de cerrar sesion?")
  window.location.href = '/login';
  setlogout(true)
};

export default logout;

