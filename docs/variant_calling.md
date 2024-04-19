# Variant calling

# Tutorial para Procesamiento de Secuencias Genómicas con SLURM y Herramientas de Bioinformática

## Introducción
Este tutorial te guiará a través del procesamiento de secuencias genómicas utilizando una serie de herramientas bioinformáticas bajo un entorno SLURM. Aprenderás a configurar y ejecutar un script que maneja desde la calidad del control de secuencias hasta el análisis de alineamiento.

## Requisitos
- Acceso a un cluster con SLURM.
- Módulos de bioinformática instalados (FastQC, Trimmomatic, BWA, Samtools, Picard, etc.).
- Datos de secuenciación en formato `.fq.gz`.

## Configuración del Trabajo en SLURM
El script comienza configurando el entorno de trabajo para ejecutar en un sistema que utiliza SLURM como gestor de trabajos. Aquí explicamos cómo se configuran las solicitudes de recursos:

```bash
#!/bin/bash
#SBATCH --nodes=2                               # Número de nodos solicitados.
#SBATCH --ntasks-per-node=2                     # Número de tareas por nodo.
#SBATCH --time=06:00:00                         # Tiempo máximo de ejecución.
#SBATCH --cpus-per-task=6                       # Número de núcleos por tarea.
#SBATCH --partition=cola-corta                  # Nombre de la partición en la que se ejecutará el trabajo.
#SBATCH --mem-per-cpu=6G                        # Memoria por núcleo solicitada para el trabajo.
#SBATCH --mail-type=BEGIN,END,FAIL              # Tipo de correo a enviar cuando inicie, termine o falle el trabajo.
#SBATCH --mail-user=example@email.com           # Dirección de correo electrónico para recibir las notificaciones.
#SBATCH --job-name=PARENT22076                  # Nombre del trabajo.
#SBATCH --output=/path/to/output_jobs/slurm.%x.%N.%j.out  # Nombre del archivo de salida del trabajo.
#SBATCH --error=/path/to/output_jobs/slurm.%x.%N.%j.err   # Nombre del archivo de error del trabajo.
```

## Preparación de datos

### Creación de enlaces simbólicos
Crearemos enlaces simbolicos al...

```bash 
ln -s $LUSTRE/genotipado_rodaballos/X204SC23053088-Z01-F001/01.RawData/raw_seqs/PARENT22076_EKDN230022081-1A_HF5F7DSX7_L3_1.fq.gz ${OUTPUT_DIR}/PARENT22076_L3_1.gz
ln -s $LUSTRE/genotipado_rodaballos/X204SC23053088-Z01-F001/01.RawData/raw_seqs/PARENT22076_EKDN230022081-1A_HF5F7DSX7_L3_2.fq.gz ${OUTPUT_DIR}/PARENT22076_L3_2.gz
```

## Control de calidad inicial con FastQC

FastQC realiza un análisis de calidad de los datos de secuenciación para identificar problemas potenciales.

```bash
module load fastqc/0.12.1
mkdir -p ${OUTPUT_DIR}/PARENT22076_fastqc
fastqc ${OUTPUT_DIR}/PARENT22076_L3_1.gz ${OUTPUT_DIR}/PARENT22076_L3_2.gz -o ${OUTPUT_DIR}/PARENT22076_fastqc
```

* `${OUTPUT_DIR}/PARENT22076_L3_1.gz` y `${OUTPUT_DIR}/PARENT22076_L3_2.gz`. Archivos de entrada que contienen las lecturas de secuenciación.
* `-o ${OUTPUT_DIR}/PARENT22076_fastqc`. Especifica el directorio de salida donde FastQC guardará los reportes y archivos de resultados.


## Limpieza de secuencias con Trimmomatic

Trimmomatic es una herramienta utilizada para preprocesar datos de secuenciación de ADN. Este proceso es fundamental para mejorar la calidad de los datos antes de realizar análisis posteriores, como el mapeo de secuencias o la llamada de variantes. Trimmomatic realiza operaciones como el recorte de adaptadores, la eliminación de secuencias de baja calidad y la eliminación de lecturas demasiado cortas.

```bash
module load cesga/system miniconda3/22.11.1-1
conda activate trimmomatic_0.38
trimmomatic PE -phred33 \
  ${INPUT_DIR}/PARENT22076_L3_1.gz \
  ${INPUT_DIR}/PARENT22076_L3_2.gz \
  ${OUTPUT_DIR}/PARENT22076_L3_1.trimmed.fq.gz \
  ${OUTPUT_DIR}/PARENT22076_L3_1.unpaired.fq.gz \
  ${OUTPUT_DIR}/PARENT22076_L3_2.trimmed.fq.gz \
  ${OUTPUT_DIR}/PARENT22076_L3_2.unpaired.fq.gz \
  ILLUMINACLIP:${ADAPTERS}:2:30:10 SLIDINGWINDOW:4:15 MINLEN:36 \
  &> ${OUTPUT_DIR}/trimmomatic.log
```
  * `PE` - Indica que las lecturas son emparejadas (paired-end).
  * `-phred33` - Especifica que los valores de calidad están codificados usando Phred+33.
  * `${INPUT_DIR}/PARENT22076_L3_1.gz` y `${INPUT_DIR}/PARENT22076_L3_2.gz` - Rutas a los archivos de entrada que contienen las lecturas emparejadas.
  * `${OUTPUT_DIR}/PARENT22076_L3_1.trimmed.fq.gz` y `${OUTPUT_DIR}/PARENT22076_L3_2.trimmed.fq.gz` - Rutas a los archivos de salida para las lecturas recortadas que siguen emparejadas.
  * `${OUTPUT_DIR}/PARENT22076_L3_1.unpaired.fq.gz` y `${OUTPUT_DIR}/PARENT22076_L3_2.unpaired.fq.gz` - Rutas a los archivos de salida para las lecturas que se han quedado sin pareja tras el recorte.
  * `ILLUMINACLIP:${ADAPTERS}:2:30:10` - Parámetro para el recorte de adaptadores. `${ADAPTERS}` debe ser la ruta al archivo de adaptadores. Los números indican el umbral de semilla para el emparejamiento, el umbral de   coincidencia palindrómica y el umbral de coincidencia simple, respectivamente.
  * `SLIDINGWINDOW:4:15` - Indica que se debe usar una ventana deslizante de 4 bases y recortar cuando el promedio de calidad caiga por debajo de 15.
  * `MINLEN:36` - Descarta las lecturas que, después del recorte, son más cortas de 36 bases.
  * `&> ${OUTPUT_DIR}/trimmomatic.log` - Redirige la salida estándar y los errores al archivo especificado para registro.



# Alineamiento con bwa

El comando `bwa mem` se utiliza para el mapeo de las lecturas al genoma de referencia

```bash
# Cargamos módulo de bwa
module load cesga/2020 gcccore/system bwa/0.7.17

# Ejecutamos bwa
bwa mem -M -t $(nproc) -R '@RG\tID:A00709:660:HF5F7DSX7:3\tPL:ILLUMINA\tLB:EKDN230022081\tSM:PARENT22076' \
  ${REF_GENOME} \
  ${OUTPUT_DIR}/PARENT22076_L3_1.trimmed.fq.gz \
  ${OUTPUT_DIR}/PARENT22076_L3_2.trimmed.fq.gz \
  > ${OUTPUT_DIR}/PARENT22076-pe.sam
```
Los parámetros utilizados son:
+ `-M`: Marca las divisiones más cortas como secundarias (recomendado cuando se usan herramientas que no procesan bien las alineaciones secundarias).
+ `-t $(nproc)`: Especifica el número de hilos (threads) para usar durante el alineamiento. `$(nproc)` automáticamente usa todos los procesadores disponibles en el nodo de cálculo.
- `-R`: Adjunta un grupo de lectura (read group) en el encabezado SAM. Los read groups son fundamentales para el análisis de variantes, ya que identifican cada conjunto de lecturas que provienen del mismo experimento.
    * `ID`: Identificador único del read group.
    * `PL`: Plataforma de secuenciación utilizada (en este caso, ILLUMINA).
    * `LB`: Etiqueta de la biblioteca de ADN.
    * `SM`: Nombre de la muestra.
- `${REF_GENOME}`: Ruta al genoma de referencia.
* `${OUTPUT_DIR}/PARENT22076_L3_1.trimmed.fq.gz` y `${OUTPUT_DIR}/PARENT22076_L3_2.trimmed.fq.gz`: Rutas a los archivos de lecturas emparejadas procesadas previamente.
* `>${OUTPUT_DIR}/PARENT22076-pe.sam`: Redirige la salida a un archivo SAM en el directorio especificado.

