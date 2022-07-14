# **MUSIAL IVE - MUSIAL Integrative Visualization Extension**

`Author:   Simon Hackl`
`Contact:   simon.hackl@uni-tuebingen.de`

---
## **Description**:
`MUSIAL IVE` is a companion tool for [`MUSIAL`](https://github.com/Integrative-Transcriptomics/MUSIAL) and offers a web-based novel and unique interactive visualization of SNVs and indels that were identified for a single gene and allocated to a reference protein structure of this gene using `MUSIAL`.

![MUSIALIVE with example data](media/example.gif)

- The header bar on top grants access to an expandable side-panel which holds any configurable options of the tool and a link to the tools GitHub repository on the right side.
- The Information Component at the top left yields information about the reference gene and protein position and contents as well as sample and contacting residue information. It is updated once a position in the Variants View or residue in the Structure View is selected (by clicking on it).
- The Composition Component in the center at top offers users a so called sunburst chart, displaying both the associated aminoacid and nucleotide contents for each sample.
- The Structure View component at the top right depicts a three-dimensional structure of the respective protein used as input for the analysis. While single residues will be depicted in a thin stick model, the backbone of the protein is displayed with three-dimensional representations of the proteins secondary structure; this backbone is highlighted according to the positions zoomed in to with the Variants View x-axis zoom (see below). If the selected position is allocated to a protein position the respective residue and all its contacting residues are highlighted with an increased radius and labeled with their chain, position and residue type. The component can be expanded to fill the full dashboard and users can pan and rotate the model in each dimension and zoom into and out of it. The backbone coloring can be set to computed variability or hydropathicity values and the display of contacts can be disabled.
- The Variants View component at the bottom offers a heatmap diagram split into two parts. The upper part displays computed variability and hydropathicity values together with the aminoacids of the reference protein’s sequence and translated nucleotides of the reference gene’s sequence per superposition. The lower part depicts the detected missense mutations or ambiguous residues allocated during the structure allocation procedure of MUSIAL, in three selectable modes: The display on single sample level, grouped by genotype or grouped by proteoform. Ambiguous positions can be displayed in two distinct modes: Either the positions are masked, i.e. their opacity is reduced and they are not included in additional analyses, or the positions are displayed as unambiguous positions and included for additional analyses. The right side of the component provides an overview of the coloring scheme, which can be used to hide individual residue types by clicking on them. Below, the results of a Kolmogorov-Smirnov test (to test the deviation of the distribution of variable positions from an uniform one) can be retrieved in a popup and the component can be downloaded as an image. In addition the y- and x-axis is outfitted with a zoom bar while the x-axis features an additional axis that yields the global superpositions and an indication on which of those at least one missense mutation was detected.

---
## **Access**:
The tool is available via GitHub pages at [https://integrative-transcriptomics.github.io/MUSIAL-IVE/](https://integrative-transcriptomics.github.io/MUSIAL-IVE/
). __The current GitHub pages URL links to version 2.1! If you want to visualize the output of MUSIAL v2.0 please clone the respective branch and start the web page locally.__

---
## **Usage**:
The starting page of the tool offers a large upload panel. Once users click on it, it is asked to load a `MUSIAL` output directory. Ensure that the output directory of a single gene analysis with the optional structure allocation is selected. An example output directory can be downloaded from this repository `examples/treponema_pallidum_pallidum_bamA_Sun`.
