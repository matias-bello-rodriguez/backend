import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { InspectionSection } from '../src/entities/InspectionSection.entity';
import { InspectionSubsection } from '../src/entities/InspectionSubsection.entity';
import { Question } from '../src/entities/Question.entity';
import { AnswerOption } from '../src/entities/AnswerOption.entity';

dotenv.config({ path: join(__dirname, '../.env') });

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'rayen123%',
  database: process.env.DB_DATABASE || 'auto_box',
  entities: [InspectionSection, InspectionSubsection, Question, AnswerOption],
  synchronize: false,
});

const INSPECTION_DATA = [
  {
    id: '1',
    title: '1. Revisión carrocería, exteriores y parte inferior',
    questions: [
      {
        id: '1.1',
        text: '1.1. Revisar que la pintura del auto sea de la misma tonalidad en sus distintos paneles',
        options: [
          { value: 'a', label: 'a) Posee la misma tonalidad de manera total.', score: 10 },
          { value: 'b', label: 'b) Posee algunas piezas con diferente tonalidad (reparación localizada).', score: 5 },
          { value: 'c', label: 'c) Posee gran parte de la carrocería con tonalidades variables (repintados importantes).', score: 1 },
          { value: 'd', label: 'd) No es posible verificar (suciedad/condiciones de luz).', score: 0 },
        ]
      },
      {
        id: '1.2',
        text: '1.2. Revisar líneas de paneles, luces, plásticos y ajuste de puertas',
        options: [
          { value: 'a', label: 'a) Paneles alineados correctamente; puertas/capó/baúl cierran bien.', score: 10 },
          { value: 'b', label: 'b) Pequeños descuadres sin evidencia de choque grave.', score: 5 },
          { value: 'c', label: 'c) Descuidos o descuadres relevantes que sugieren choque o reparación mayor.', score: 1 },
          { value: 'd', label: 'd) Piezas faltantes o rotas (luces, plásticos).', score: 0 },
        ]
      },
      {
        id: '1.3',
        text: '1.3. Revisar descuadres en trenes delantero/lateral/trasero',
        options: [
          { value: 'a', label: 'a) Sin descuadres ni señales de choque.', score: 10 },
          { value: 'b', label: 'b) Descuidos menores en cierres; posible golpe leve.', score: 5 },
          { value: 'c', label: 'c) Evidencia clara de choque de consideración (cierres, estructura).', score: 1 },
        ]
      },
      {
        id: '1.4',
        text: '1.4. Evidencia de uso de masilla o repintados (medición espesor / auto-lak test)',
        options: [
          { value: 'a', label: 'a) No hay evidencia de repintado o masilla (espesor homogéneo).', score: 10 },
          { value: 'b', label: 'b) Pequeñas reparaciones con masilla / repintados puntuales.', score: 5 },
          { value: 'c', label: 'c) Reparaciones extensas con masilla o repintados (paneles múltiples).', score: 1 },
        ]
      },
      {
        id: '1.5',
        text: '1.5. Estado general de la carrocería y techo (abollones significativos)',
        options: [
          { value: 'a', label: 'a) Carrocería en buen estado, sin abollones significativos.', score: 10 },
          { value: 'b', label: 'b) Abollones menores o imperfecciones reparables.', score: 5 },
          { value: 'c', label: 'c) Abollones significativos que afectan estructura/estética.', score: 1 },
        ]
      },
      {
        id: '1.6',
        text: '1.6. Estado de llantas y discos de freno',
        options: [
          { value: 'a', label: 'a) Llantas en buen estado; discos sin borde prominente.', score: 10 },
          { value: 'b', label: 'b) Llantas con raspones/modificaciones; desgaste moderado.', score: 5 },
          { value: 'c', label: 'c) Llantas en mal estado o desgaste disparejo; discos con desgaste prominente.', score: 1 },
          { value: 'd', label: 'd) Llanta de repuesto ausente o en mal estado.', score: 0 },
        ]
      },
      {
        id: '1.7',
        text: '1.7. Prueba de suspensión (empujar lateralmente y observar rebote)',
        options: [
          { value: 'a', label: 'a) Suspensión firme y con rebote normal.', score: 10 },
          { value: 'b', label: 'b) Suspensión algo dura o blanda (desgaste moderado).', score: 5 },
          { value: 'c', label: 'c) Suspensión en mal estado (rebote excesivo o sin amortiguación).', score: 1 },
        ]
      },
      {
        id: '1.8',
        text: '1.8. Desgaste y condición de los neumáticos',
        options: [
          { value: 'a', label: 'a) Desgaste uniforme y sin grietas.', score: 10 },
          { value: 'b', label: 'b) Desgaste leve o algún indicio de agrietamiento.', score: 5 },
          { value: 'c', label: 'c) Desgaste severo o desgaste disparejo (alineación/rodamiento).', score: 1 },
          { value: 'd', label: 'd) Neumáticos no aptos o no verificables.', score: 0 },
        ]
      },
      {
        id: '1.9',
        text: '1.9. Inspección parte inferior: chasis, filtraciones, óxido',
        options: [
          { value: 'a', label: 'a) Sin filtraciones ni óxido significativo; chasis íntegro.', score: 10 },
          { value: 'b', label: 'b) Filtraciones menores o óxido superficial sin riesgo inmediato.', score: 5 },
          { value: 'c', label: 'c) Filtraciones, roturas o óxido avanzado que requieren revisión.', score: 1 },
        ]
      },
      {
        id: '1.10',
        text: '1.10. Estado de vidrios y verificación de grabado de la patente',
        options: [
          { value: 'a', label: 'a) Vidrios en buen estado; grabado de patente presente y correcto.', score: 10 },
          { value: 'b', label: 'b) Vidrios con pequeñas astillas; grabado parcialmente legible.', score: 5 },
          { value: 'c', label: 'c) Vidrios con roturas/ausencia de grabado (posible irregularidad).', score: 1 },
        ]
      },
      {
        id: '1.11',
        text: '1.11. Disponibilidad y estado de rueda de repuesto, gata hidráulica y accesorios',
        options: [
          { value: 'a', label: 'a) Todos los accesorios presentes y en buen estado.', score: 10 },
          { value: 'b', label: 'b) Accesorios presentes, pero en mal estado/uso.', score: 5 },
          { value: 'c', label: 'c) Faltan accesorios importantes (sin rueda de repuesto/gata).', score: 1 },
        ]
      },
    ]
  },
  {
    id: '2',
    title: '2. Revisión de interiores, tablero, luces y accesorios',
    questions: [
      {
        id: '2.1',
        text: '2.1. Revisión del maletero: buscar descuadres que indiquen choque oculto',
        options: [
          { value: 'a', label: 'a) Maletero sin descuadres ni evidencia de choque.', score: 10 },
          { value: 'b', label: 'b) Descuidos leves detectados (deformaciones menores).', score: 5 },
          { value: 'c', label: 'c) Evidencia clara de choque en el maletero.', score: 1 },
        ]
      },
      {
        id: '2.2',
        text: '2.2. Dirección hidráulica: ruido o resistencia al girar',
        options: [
          { value: 'a', label: 'a) Dirección suave y sin ruidos anormales.', score: 10 },
          { value: 'b', label: 'b) Dirección con ruido leve al girar (recomendable revisar).', score: 5 },
          { value: 'c', label: 'c) Ruidos o fallas que indican problema en la dirección hidráulica.', score: 1 },
          { value: 'd', label: 'd) Vehículo sin dirección hidráulica / no aplicable.', score: 0 },
        ]
      },
      {
        id: '2.3',
        text: '2.3. Test de testigos del tablero al girar la llave',
        options: [
          { value: 'a', label: 'a) Todos los testigos encienden y se apagan correctamente al arrancar.', score: 10 },
          { value: 'b', label: 'b) Algunos testigos permanecen encendidos (posible fallo).', score: 5 },
          { value: 'c', label: 'c) Testigos faltantes o comportamiento anormal del tablero.', score: 1 },
        ]
      },
      {
        id: '2.4',
        text: '2.4. Pedal de embrague: fuerza y corrección',
        options: [
          { value: 'a', label: 'a) Pedal con respuesta normal y fuerza adecuada.', score: 10 },
          { value: 'b', label: 'b) Pedal algo flojo o con recorrido largo (desgaste moderado).', score: 5 },
          { value: 'c', label: 'c) Pedal sin respuesta o al final de su vida útil (reparación necesaria).', score: 1 },
          { value: 'd', label: 'd) Vehículo automático / no aplicable.', score: 0 },
        ]
      },
      {
        id: '2.5',
        text: '2.5. Aire acondicionado: funcionamiento y enfriamiento',
        options: [
          { value: 'a', label: 'a) A/C enfría correctamente.', score: 10 },
          { value: 'b', label: 'b) Enfría débilmente (posible falta de gas o mantenimiento).', score: 5 },
          { value: 'c', label: 'c) No enfría (requiere revisión especializada).', score: 1 },
          { value: 'd', label: 'd) Vehículo no cuenta con A/C', score: 0 },
        ]
      },
      {
        id: '2.6',
        text: '2.6. Cinturones de seguridad: estado y funcionamiento',
        options: [
          { value: 'a', label: 'a) Cinturones en buen estado y funcionan correctamente.', score: 10 },
          { value: 'b', label: 'b) Algunos cinturones con desgaste, pero funcionales.', score: 5 },
          { value: 'c', label: 'c) Cinturones dañados o no funcionan (riesgo grave).', score: 1 },
        ]
      },
      {
        id: '2.7',
        text: '2.7. Cierre centralizado, alarma, alza vidrios y demás eléctricos',
        options: [
          { value: 'a', label: 'a) Todos los sistemas eléctricos funcionan correctamente.', score: 10 },
          { value: 'b', label: 'b) Fallas menores en algunos elementos (recomendable reparar).', score: 5 },
          { value: 'c', label: 'c) Fallas graves en sistemas eléctricos (alarma, cierre central).', score: 1 },
        ]
      },
      {
        id: '2.8',
        text: '2.8. Bocina, espejos, guantera y viseras',
        options: [
          { value: 'a', label: 'a) Funcionamiento correcto de bocina y elementos.', score: 10 },
          { value: 'b', label: 'b) Fallas leves en alguno de los elementos.', score: 5 },
          { value: 'c', label: 'c) Fallas graves o elementos faltantes.', score: 1 },
        ]
      },
      {
        id: '2.9',
        text: '2.9. Tapices y paneles interiores (remover cubreasientos si aplica)',
        options: [
          { value: 'a', label: 'a) Tapicería y paneles en buen estado.', score: 10 },
          { value: 'b', label: 'b) Desgaste o manchas moderadas.', score: 5 },
          { value: 'c', label: 'c) Daños importantes (roturas, quemaduras).', score: 1 },
        ]
      },
      {
        id: '2.10',
        text: '2.10. Luces direccionales, intermitentes y limpiaparabrisas (con agua)',
        options: [
          { value: 'a', label: 'a) Funcionan correctamente.', score: 10 },
          { value: 'b', label: 'b) Funcionan parcialmente (una o más no operativas).', score: 5 },
          { value: 'c', label: 'c) No funcionan o presentan fallas graves.', score: 1 },
        ]
      },
      {
        id: '2.11',
        text: '2.11. Tapa de combustible: estado y cierre',
        options: [
          { value: 'a', label: 'a) Cierre correcto y tapa en buen estado.', score: 10 },
          { value: 'b', label: 'b) Cierre con dificultad o desgaste moderado.', score: 5 },
          { value: 'c', label: 'c) Falla completa o ausencia de tapa.', score: 1 },
          { value: 'd', label: 'd) No se verificó.', score: 0 },
        ]
      },
      {
        id: '2.12',
        text: '2.12. Conexión del scanner y registro OBD',
        options: [
          { value: 'a', label: 'a) Scanner conectado y códigos OBD registrados sin errores relevantes.', score: 10 },
          { value: 'b', label: 'b) Códigos de advertencia menores encontrados (recomendable diagnóstico).', score: 5 },
          { value: 'c', label: 'c) Códigos críticos encontrados (recomendar diagnóstico especializado).', score: 1 },
          { value: 'd', label: 'd) Scanner no disponible o no se pudo conectar.', score: 0 },
        ]
      },
      {
        id: '2.13',
        text: '2.13. Registro fotográfico del panel que muestre el kilometraje',
        options: [
          { value: 'a', label: 'a) Foto tomada y legible.', score: 10 },
          { value: 'b', label: 'b) Foto tomada pero no legible (suciedad/ángulo).', score: 5 },
          { value: 'c', label: 'c) No se tomó la foto del odómetro.', score: 1 },
        ]
      },
    ]
  },
  {
    id: '3',
    title: '3. Revisión de motor, componentes bajo capó y verificación en reposo',
    questions: [
      {
        id: '3.1',
        text: '3.1. Filtraciones, sellos o reparaciones artesanales (silicona, parches)',
        options: [
          { value: 'a', label: 'a) Sin filtraciones ni reparaciones artesanales.', score: 10 },
          { value: 'b', label: 'b) Filtraciones menores o sellos reparados parcialmente.', score: 5 },
          { value: 'c', label: 'c) Reparaciones artesanales o filtraciones importantes.', score: 1 },
        ]
      },
      {
        id: '3.2',
        text: '3.2. Estado del aceite (varilla): nivel y aspecto',
        options: [
          { value: 'a', label: 'a) Nivel y aspecto del aceite correcto (limpio y en rango).', score: 10 },
          { value: 'b', label: 'b) Nivel algo bajo o aceite sucio (recomendar cambio).', score: 5 },
          { value: 'c', label: 'c) Nivel muy bajo o aceite con indicios de contaminación/combustión.', score: 1 },
        ]
      },
      {
        id: '3.3',
        text: '3.3. Estado del refrigerante (depósito de expansión)',
        options: [
          { value: 'a', label: 'a) Nivel y aspecto correctos; sin residuos.', score: 10 },
          { value: 'b', label: 'b) Nivel bajo o residuos leves (recomendable mantenimiento).', score: 5 },
          { value: 'c', label: 'c) Residuos o nivel muy bajo (posible problema grave).', score: 1 },
        ]
      },
      {
        id: '3.4',
        text: '3.4. Estado de correas de accesorios (visual)',
        options: [
          { value: 'a', label: 'a) Correas en buen estado, sin grietas.', score: 10 },
          { value: 'b', label: 'b) Correas con desgaste leve, pero operativas.', score: 5 },
          { value: 'c', label: 'c) Correas dañadas o que requieren cambio inmediato.', score: 1 },
          { value: 'd', label: 'd) No se verificó.', score: 0 },
        ]
      },
      {
        id: '3.5',
        text: '3.5. Mangueras: flexibilidad y estado (no endurecidas ni agrietadas)',
        options: [
          { value: 'a', label: 'a) Mangueras en buen estado y flexibles.', score: 10 },
          { value: 'b', label: 'b) Mangueras con rigidez leve o pequeñas grietas.', score: 5 },
          { value: 'c', label: 'c) Mangueras endurecidas/agrietadas (riesgo de fallo).', score: 1 },
        ]
      },
      {
        id: '3.6',
        text: '3.6. Revisar conectores eléctricos y componentes bajo capó (sin desconectarlos)',
        options: [
          { value: 'a', label: 'a) Conectores en buen estado, sin corrosión ni manipulación.', score: 10 },
          { value: 'b', label: 'b) Conectores con suciedad o leve corrosión.', score: 5 },
          { value: 'c', label: 'c) Conectores manipulados o en mal estado (riesgo de fallo).', score: 1 },
        ]
      },
      {
        id: '3.7',
        text: '3.7. Tornillería y pernos: originales y sin sujeciones alternativas',
        options: [
          { value: 'a', label: 'a) Tornillería original y en buen estado.', score: 10 },
          { value: 'b', label: 'b) Tornillería con repuestos/ajustes no originales menores.', score: 5 },
          { value: 'c', label: 'c) Tornillería sustituida con sujeciones impropias (posible reparación).', score: 1 },
        ]
      },
      {
        id: '3.8',
        text: '3.8. Líneas y componentes frontales (signos de choque en interior del capó)',
        options: [
          { value: 'a', label: 'a) Sin signos de choque o reparaciones en área frontal.', score: 10 },
          { value: 'b', label: 'b) Reparaciones menores detectadas en el interior del capó.', score: 5 },
          { value: 'c', label: 'c) Signos de choque significativos en el interior del capó.', score: 1 },
        ]
      },
      {
        id: '3.9',
        text: '3.9. Humos de escape al arrancar (color y persistencia)',
        options: [
          { value: 'a', label: 'a) Humo ausente o color normal (vapor ocasional por temperatura).', score: 10 },
          { value: 'b', label: 'b) Humo negro ocasional (mezcla rica) - revisar sistema de inyección.', score: 5 },
          { value: 'c', label: 'c) Humo azulado (quema aceite) o blanco persistente (posible falla grave).', score: 1 },
        ]
      },
      {
        id: '3.10',
        text: '3.10. Nivel y consistencia de líquidos (dirección / frenos) con tester',
        options: [
          { value: 'a', label: 'a) Líquidos dentro de rango y con consistencia adecuada.', score: 10 },
          { value: 'b', label: 'b) Líquidos con nivel algo bajo o ligera contaminación.', score: 5 },
          { value: 'c', label: 'c) Mezcla o contaminación de fluidos (riesgo inmediato).', score: 1 },
        ]
      },
      {
        id: '3.11',
        text: '3.11. Radiador y electroventiladores: estado y funcionamiento',
        options: [
          { value: 'a', label: 'a) Radiador sin filtraciones y electroventiladores operativos.', score: 10 },
          { value: 'b', label: 'b) Filtraciones menores o ventiladores con funcionamiento intermitente.', score: 5 },
          { value: 'c', label: 'c) Filtraciones evidentes o fallo de ventiladores.', score: 1 },
        ]
      },
      {
        id: '3.12',
        text: '3.12. Números de serie (motor / VIN / chasis): manipulación o intervención',
        options: [
          { value: 'a', label: 'a) Números originales y sin intervención aparente.', score: 10 },
          { value: 'b', label: 'b) Números con señales menores de manipulación (requiere revisión).', score: 5 },
          { value: 'c', label: 'c) Números intervenidos o faltantes (alarma de fraude).', score: 1 },
        ]
      },
      {
        id: '3.13',
        text: '3.13. Batería y bornes: corrosión y estado general',
        options: [
          { value: 'a', label: 'a) Bornes limpios y batería en buen estado.', score: 10 },
          { value: 'b', label: 'b) Bornes con algo de corrosión, pero operativos.', score: 5 },
          { value: 'c', label: 'c) Bornes sulfatados o batería en mal estado (reemplazo sugerido).', score: 1 },
        ]
      },
      {
        id: '3.14',
        text: '3.14. Sistema de carga (batería/alternador) - medición con tester',
        options: [
          { value: 'a', label: 'a) Sistema de carga dentro de parámetros normales.', score: 10 },
          { value: 'b', label: 'b) Carga algo por debajo de lo normal (recomendable verificar).', score: 5 },
          { value: 'c', label: 'c) Sistema de carga fuera de rango (fallo probable).', score: 1 },
        ]
      },
    ]
  },
  {
    id: '4',
    title: '4. Prueba de conducción en ruta prediseñada',
    questions: [
      {
        id: '4.1',
        text: '4.1. Aceleración y vibraciones a velocidad',
        options: [
          { value: 'a', label: 'a) Aceleración adecuada; sin vibraciones anormales.', score: 10 },
          { value: 'b', label: 'b) Vibraciones leves que requieren seguimiento.', score: 5 },
          { value: 'c', label: 'c) Vibraciones fuertes (posible problema de balanceo o tren delantero).', score: 1 },
        ]
      },
      {
        id: '4.2',
        text: '4.2. Frenos: respuesta y recorrido del pedal',
        options: [
          { value: 'a', label: 'a) Frenos firmes y recorrido de pedal normal.', score: 10 },
          { value: 'b', label: 'b) Pedal algo esponjoso o recorrido largo (ajuste necesario).', score: 5 },
          { value: 'c', label: 'c) Fallo en frenos (alto riesgo) - no apto para conducción segura.', score: 1 },
        ]
      },
      {
        id: '4.3',
        text: '4.3. Dirección y estabilidad (soltar volante brevemente)',
        options: [
          { value: 'a', label: 'a) Dirección estable; se mantiene recto.', score: 10 },
          { value: 'b', label: 'b) Ligera desviación que requiere alineación.', score: 5 },
          { value: 'c', label: 'c) Desvío marcado o problemas de alineación/ruedas.', score: 1 },
        ]
      },
      {
        id: '4.4',
        text: '4.4. Temperatura del motor en conducción (aguja)',
        options: [
          { value: 'a', label: 'a) Temperatura estable en rango medio.', score: 10 },
          { value: 'b', label: 'b) Temperatura algo alta en subidas o congestión.', score: 5 },
          { value: 'c', label: 'c) Sobrecalentamiento o fluctuaciones graves.', score: 1 },
        ]
      },
      {
        id: '4.5',
        text: '4.5. Cambio de marchas y embrague (suavidad)',
        options: [
          { value: 'a', label: 'a) Cambios suaves y sin ruidos.', score: 10 },
          { value: 'b', label: 'b) Dificultad en algún cambio (síntoma leve).', score: 5 },
          { value: 'c', label: 'c) Cambios con ruidos o trabas (revisión urgente).', score: 1 },
          { value: 'd', label: 'd) Vehículo automático / prueba no aplicable.', score: 0 },
        ]
      },
      {
        id: '4.6',
        text: '4.6. Prueba de fuerza en subida',
        options: [
          { value: 'a', label: 'a) Motor mantiene potencia en subida.', score: 10 },
          { value: 'b', label: 'b) Pérdida leve de potencia en subida.', score: 5 },
          { value: 'c', label: 'c) Pérdida de potencia significativa (fallo motor/transmisión).', score: 1 },
        ]
      },
      {
        id: '4.7',
        text: '4.7. Ruidos y signos inusuales (golpeteos, zumbidos)',
        options: [
          { value: 'a', label: 'a) Sin ruidos anormales.', score: 10 },
          { value: 'b', label: 'b) Ruidos leves detectados (monitorizar).', score: 5 },
          { value: 'c', label: 'c) Ruidos considerables que requieren diagnóstico.', score: 1 },
        ]
      },
    ]
  }
];

async function run() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const sectionRepo = AppDataSource.getRepository(InspectionSection);
    const subsectionRepo = AppDataSource.getRepository(InspectionSubsection);
    const questionRepo = AppDataSource.getRepository(Question);
    const answerRepo = AppDataSource.getRepository(AnswerOption);

    // Clear existing data (optional, but safer for development)
    // Be careful in production!
    await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    await AppDataSource.query('TRUNCATE TABLE respuesta');
    await AppDataSource.query('TRUNCATE TABLE pregunta');
    await AppDataSource.query('TRUNCATE TABLE subseccion_inspeccion');
    await AppDataSource.query('TRUNCATE TABLE seccion_inspeccion');
    await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Cleared existing inspection form data');

    for (const sectionData of INSPECTION_DATA) {
      const section = sectionRepo.create({
        nombre: sectionData.title,
        posicion: parseInt(sectionData.id),
      });
      const savedSection = await sectionRepo.save(section);
      console.log(`Created Section: ${savedSection.nombre}`);

      // Split questions into subsections of 10
      const questions = sectionData.questions;
      const chunkSize = 10;
      
      for (let i = 0; i < questions.length; i += chunkSize) {
        const chunk = questions.slice(i, i + chunkSize);
        const subsectionIndex = Math.floor(i / chunkSize) + 1;
        
        const subsection = subsectionRepo.create({
          nombre: `Subsección ${sectionData.id}.${subsectionIndex}`,
          seccion: savedSection,
          posicion: subsectionIndex,
        });
        const savedSubsection = await subsectionRepo.save(subsection);
        console.log(`  Created Subsection: ${savedSubsection.nombre}`);

        for (const [index, qData] of chunk.entries()) {
          const question = questionRepo.create({
            pregunta: qData.text,
            subseccion: savedSubsection,
            posicion: i + index + 1,
            escala: 10, // Default scale
          });
          const savedQuestion = await questionRepo.save(question);
          
          for (const opt of qData.options) {
            const answer = answerRepo.create({
              pregunta: savedQuestion,
              respuestaTexto: opt.label,
              calificacion: opt.score,
            });
            await answerRepo.save(answer);
          }
        }
      }
    }

    console.log('Seeding completed successfully');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

run();
