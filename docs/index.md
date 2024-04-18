# Genómica

For full documentation visit [mkdocs.org](https://www.mkdocs.org).

## Code Annotation Examples

### Codeblocks

Some `code` goes here

### Plan codeblock

A plain code here

If a Nextflow module script contains multiple `process` definitions they can also be imported using a single `include` statement as shown in the example below:

```bash linenums="1" title="hello.nf"
#!/usr/bin/env nextflow

# Solo SNPs
module load cesga/2020 gatk/4.2.6.1
gatk SelectVariants \
  -R ${REF_GENOME} \
  -V ${OUTPUT_DIR}/PARENT23626.g.vcf.gz \
  --select-type-to-include SNP \
  -O ${OUTPUT_DIR}/PARENT23626_SNPs.g.vcf.gz 
bcftools stats ${OUTPUT_DIR}/PARENT23626_SNPs.g.vcf.gz > ${OUTPUT_DIR}/PARENT23626_SNPs.g.vcf_stats.txt
```

<div align="center">
    <img src="./assets/logo.png">
    <p><em>Imagen modificada de <a href="https://www.genome.gov/genetics-glossary/Microbiome">https://www.genome.gov/genetics-glossary/Microbiome</a></em></p>
</div>


# Icons and Emojis

:smile:

:fontawesome-regular-face-laugh-wink:

# Uno

# Dos

# Tres

# Cuatro
## Lalal
## Lililili
### Lalilialw

## Commands

* `mkdocs new [dir-name]` - Create a new project.
* `mkdocs serve` - Start the live-reloading docs server.
* `mkdocs build` - Build the documentation site.
* `mkdocs -h` - Print help message and exit.

## Project layout

    mkdocs.yml    # The configuration file.
    docs/
        index.md  # The documentation homepage.
        ...       # Other markdown pages, images and other files.


# Otra

!!! note "Phasellus posuere in sem ut cursus"

    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et euismod
    nulla. Curabitur feugiat, tortor non consequat finibus, justo purus auctor
    massa, nec semper lorem quam in massa.

