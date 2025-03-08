import { auth, db } from './firebase.js';
import { addDoc, collection } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function() {
  const emergencyForm = document.getElementById('emergencyForm');
  const downloadPdfButton = document.getElementById('downloadPdfButton');
  const loader = document.getElementById('loader');
  const overlay = document.getElementById('overlay');
  const successModal = document.getElementById('successModal');
  const continueButton = document.getElementById('continueButton');

  // Función para validar si un campo está vacío o contiene solo espacios en blanco
  function isValidField(value) {
    return value && value.trim() !== ''; // Verifica si el campo no está vacío o no contiene solo espacios en blanco
  }

  if (emergencyForm) {
    emergencyForm.addEventListener('submit', async function(event) {
      event.preventDefault();

      const user = auth.currentUser;
      if (!user) {
        alert('Debes iniciar sesión para registrar un motivo');
        return;
      }

      const formData = new FormData(event.target);
      const data = {
        uid: user.uid,
        nombre: formData.get('nombre'),
        fechaNacimiento: formData.get('fecha-nacimiento'),
        identificacion: formData.get('identificacion'),
        direccion: formData.get('direccion'),
        telefono: formData.get('telefono'),
        email: formData.get('email'),
        contactoNombre: formData.get('contacto-nombre'),
        contactoRelacion: formData.get('contacto-relacion'),
        contactoTelefono: formData.get('contacto-telefono'),
        fechaEmergencia: formData.get('fecha-emergencia'),
        descripcion: formData.get('descripcion'),
        duracion: formData.get('duracion'),
        gravedad: formData.get('gravedad'),
        localizacion: formData.get('localizacion'),
        alergias: formData.get('alergias'),
        medicamentos: formData.get('medicamentos'),
        condiciones: formData.get('condiciones'),
        cirugias: formData.get('cirugias'),
        hospitalizaciones: formData.get('hospitalizaciones'),
        consentimiento: formData.get('consentimiento') === 'on',
        autorizacion: formData.get('autorizacion') === 'on'
      };

      // Validar campos obligatorios
      const camposObligatorios = [
        { campo: data.nombre, mensaje: 'Por favor, ingresa el nombre completo.' },
        { campo: data.fechaNacimiento, mensaje: 'Por favor, ingresa la fecha de nacimiento.' },
        { campo: data.identificacion, mensaje: 'Por favor, ingresa el número de identificación.' },
        { campo: data.direccion, mensaje: 'Por favor, ingresa la dirección.' },
        { campo: data.telefono, mensaje: 'Por favor, ingresa el teléfono de contacto.' },
        { campo: data.email, mensaje: 'Por favor, ingresa el correo electrónico.' },
        { campo: data.contactoNombre, mensaje: 'Por favor, ingresa el nombre del contacto de emergencia.' },
        { campo: data.contactoRelacion, mensaje: 'Por favor, ingresa la relación con el paciente.' },
        { campo: data.contactoTelefono, mensaje: 'Por favor, ingresa el teléfono del contacto de emergencia.' },
        { campo: data.fechaEmergencia, mensaje: 'Por favor, ingresa la fecha y hora de la emergencia.' },
        { campo: data.descripcion, mensaje: 'Por favor, ingresa la descripción del problema.' },
        { campo: data.duracion, mensaje: 'Por favor, ingresa la duración de los síntomas.' },
        { campo: data.gravedad, mensaje: 'Por favor, selecciona la gravedad de los síntomas.' },
        { campo: data.alergias, mensaje: 'Por favor, ingresa las alergias conocidas.' },
        { campo: data.medicamentos, mensaje: 'Por favor, ingresa los medicamentos actuales.' },
        { campo: data.condiciones, mensaje: 'Por favor, ingresa las condiciones médicas preexistentes.' },
        { campo: data.cirugias, mensaje: 'Por favor, ingresa las cirugías previas.' },
        { campo: data.hospitalizaciones, mensaje: 'Por favor, ingresa el historial de hospitalizaciones.' },
      ];

      // Verificar si algún campo obligatorio está vacío o contiene solo espacios en blanco
      for (const { campo, mensaje } of camposObligatorios) {
        if (!campo || campo.trim() === '') {
          alert(mensaje);
          return; // Detener el envío del formulario si hay un campo inválido
        }
      }

      try {
        // Mostrar el cargador y el overlay
        overlay.style.display = 'block';

        // Registrar la emergencia en Firebase
        await addDoc(collection(db, 'emergencies'), data);

        // Mostrar el modal de éxito
        successModal.style.display = 'block';

        // Asignar la función de continuar al botón del modal de éxito
        continueButton.onclick = async () => {
          successModal.style.display = 'none';
          await sendDataToIA(data);
        };
      } catch (error) {
        console.error('Error al registrar el motivo:', error);
        alert('Error al registrar el motivo');
        
        // Ocultar el cargador y el overlay en caso de error
        loader.style.display = 'none';
        overlay.style.display = 'none';
      }
    });
  } else {
    console.error('Formulario de motivo no encontrado');
  }

  // Función para enviar los datos a la IA
  async function sendDataToIA(data) {
    try {
      // Mostrar el cargador y el overlay
      loader.style.display = 'flex';
      overlay.style.display = 'block';

      // Enviar los datos del formulario al backend
      const response = await fetch('https://emergencies-gf.onrender.com/submit-emergency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      // Ocultar el cargador y el overlay
      loader.style.display = 'none';
      overlay.style.display = 'none';

      if (result.success) {
        alert(`Recomendación de Gemini AI: ${result.geminiResponse}`);
        
        // Mostrar el botón de descarga
        hiddenSubmitButton.style.display = 'none';
        downloadPdfButton.style.display = 'block';

        // Asignar la función de descarga del PDF al botón
        downloadPdfButton.onclick = () => {
          generatePDF(data.nombre, result.geminiResponse);
          emergencyForm.reset();
          hiddenSubmitButton.style.display = 'block';
          downloadPdfButton.style.display = 'none';
        };
      } else {
        alert('Error al obtener la respuesta de Gemini AI');
      }
    } catch (error) {
      console.error('Error al enviar los datos a la IA:', error);
      alert('Error al enviar los datos a la IA');
      
      // Ocultar el cargador y el overlay en caso de error
      loader.style.display = 'none';
      overlay.style.display = 'none';
    }
  }

  // Ocultar el modal de éxito al hacer clic en el botón de continuar
  continueButton.addEventListener('click', () => {
    successModal.style.display = 'none';
  });
});

// Función para generar y descargar el PDF
function generatePDF(nombrePaciente, respuestaIA) {
  console.log('Generando PDF para:', nombrePaciente);
  console.log('Respuesta de la IA:', respuestaIA);
  console.log('Respuesta de la IA:', data.alergias);
  const docDefinition = {
    content: [
      { text: 'Informe de Emergencia', style: 'header' },
      { text: `Paciente: ${nombrePaciente}`, style: 'subheader' },
      { text: 'Recomendación de Gemini AI:', style: 'subheader' },
      { text: respuestaIA, style: 'body' },
      { text: ' ', margin: [0, 20] }, // Espacio en blanco
      {
        text: 'Firma y sello del médico:',
        style: 'subheader',
        margin: [0, 10, 0, 5],
      },
      {
        canvas: [
          {
            type: 'line',
            x1: 0,
            y1: 0,
            x2: 100, // Ancho de la línea (ajusta según el tamaño de la página)
            y2: 0,
            lineWidth: 1, // Grosor de la línea
            lineColor: '#000000', // Color de la línea (negro)
          },
        ],
        margin: [0, 10, 0, 30], // Margen superior e inferior
      },
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10],
      },
      subheader: {
        fontSize: 14,
        bold: true,
        margin: [0, 10, 0, 5],
      },
      body: {
        fontSize: 12,
        margin: [0, 0, 0, 10],
      },
    },
  };

  // Crear y descargar el PDF
  pdfMake.createPdf(docDefinition).download(`Informe_${nombrePaciente}.pdf`);
}