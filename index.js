const express = require("express");
const cors = require("cors");
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const excelPath = path.join(__dirname, "excel", "registros.xlsx");
const hojaNombre = "Formulario";

async function guardarRegistro(data) {
  const workbook = new ExcelJS.Workbook();
  let worksheet;

  if (fs.existsSync(excelPath)) {
    await workbook.xlsx.readFile(excelPath);
    worksheet = workbook.getWorksheet(hojaNombre);

    // Si no existe la hoja, la crea
    if (!worksheet) {
      worksheet = workbook.addWorksheet(hojaNombre);
      worksheet.addRow([
        "Nombre", "Apellido", "Deporte favorito", "Género", "Departamento", "Mayor de 21", "Modelos de autos"
      ]);
    }
  } else {
    // Crear nuevo archivo y hoja
    worksheet = workbook.addWorksheet(hojaNombre);
    worksheet.addRow([
      "Nombre", "Apellido", "Deporte favorito", "Género", "Departamento", "Mayor de 21", "Modelos de autos"
    ]);
  }

  // Añadir nueva fila
  worksheet.addRow([
    data.nombre,
    data.apellido,
    data.deporte,
    data.genero,
    data.departamento,
    data.mayorEdad,
    data.autos
  ]);

  // Ajustar automáticamente el ancho de las columnas
  worksheet.columns.forEach(col => {
    let maxLength = 10;
    col.eachCell({ includeEmpty: true }, cell => {
      const value = cell.value ? cell.value.toString() : "";
      maxLength = Math.max(maxLength, value.length);
    });
    col.width = maxLength + 2;
  });

  // Estilo: bordes y negrita para encabezado
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.eachCell(cell => {
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" }
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFDCE775" }
    };
  });

  await workbook.xlsx.writeFile(excelPath);
}

app.post("/guardar", async (req, res) => {
  const datos = req.body;
  console.log("📥 Recibido:", datos);

  try {
    await guardarRegistro(datos);
    res.status(200).send("✅ Registro guardado correctamente");
  } catch (error) {
    console.error("❌ Error al guardar:", error);
    res.status(500).send("Error al guardar");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});