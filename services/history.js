import { db } from './firebase.js';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

export async function consultar() {
  const opcion = document.getElementById('opcion').value;
  const buscador = document.getElementById('buscador').value;
  const resultadoConsulta = document.getElementById('resultado-consulta');
  resultadoConsulta.innerHTML = '';

  let field;
  switch (opcion) {
    case '1':
      field = 'identificacion';
      break;
    case '2':
      field = 'nombre';
      break;
    case '3':
      field = 'empresa';
      break;
    case '4':
      field = 'numeroHistoria';
      break;
    case '5':
      field = 'codigoTrabajador';
      break;
    default:
      alert('Opción no válida');
      return;
  }

  const q = query(collection(db, 'emergencies'), where(field, '==', buscador));
  try {
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      resultadoConsulta.innerHTML = '<p>no se encuentran resultados</p>';
    } else {
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        resultadoConsulta.innerHTML += `<p>UID: ${data.uid}, Nombre: ${data.nombre}, email: ${data.email}</p>`;
      });
    }
  } catch (error) {
    console.error('Error al consultar:', error);
    resultadoConsulta.innerHTML = '<p>Error al consultar</p>';
  }
}