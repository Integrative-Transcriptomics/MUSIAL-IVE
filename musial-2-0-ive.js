/**
    MUSIAL-v2.0-IVE
    Author: Simon Hackl
    Contact: simon.hackl@uni-tuebingen.de
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/*
[1] Definition of biological/bioinformatics related data and variables.
*/
/* TODO: Update PRISMEM15 scores.
// Matrix of pairwise residue interaction scores respecting their observed frequency in a set of 100 membrane proteins, each with a pairwise identitiy of at most 15% to each other.
*/
// Scaled Kyte-Doolittle Hyropathicity scores (DOI: 10.1016/0022-2836(82)90515-0).
var SCALED_KD_HYDROP = {
    "ALA": 0.700,
    "ARG": 0.000,
    "ASN": 0.111,
    "ASP": 0.111,
    "CYS": 0.778,
    "GLN": 0.111,
    "GLU": 0.111,
    "GLY": 0.456,
    "HIS": 0.144,
    "ILE": 1.000,
    "LEU": 0.922,
    "LYS": 0.067,
    "MET": 0.711,
    "PHE": 0.811,
    "PRO": 0.322,
    "SER": 0.411,
    "THR": 0.422,
    "TRP": 0.400,
    "TYR": 0.356,
    "VAL": 0.967
};
// Mapping of three letter amino acid codes to one letter amino acid codes. Includes any amino acid (XXX), termination (TER) and ambiguous amino acid (AMB).
var AA_3TO1 = {
    "ALA": "A",
    "ARG": "R",
    "ASN": "N",
    "ASP": "D",
    "CYS": "C",
    "GLU": "E",
    "GLN": "Q",
    "GLY": "G",
    "HIS": "H",
    "ILE": "I",
    "LEU": "L",
    "LYS": "K",
    "MET": "M",
    "PHE": "F",
    "PRO": "P",
    "SER": "S",
    "THR": "T",
    "TRP": "W",
    "TYR": "Y",
    "VAL": "V",
    "ANY": "X",
    "TER": "Z",
    "INC": "U"
};
// Mapping used to invert nucleotide symbols. Includes lower-case characters and _ (insertion starts), deletion (-) and any nucleotide (N).
var INVERT_BASE = {
    "A": "T",
    "C": "G",
    "G": "C",
    "T": "A",
    "-": "-",
    "N": "N"
};
// Style specifications used for 3D protein models, for more information see: https://3dmol.csb.pitt.edu/doc/types.html
var STYLES_3DMOL = {
    "LINE_FADED": {
        colorfunc: (atom) => {
            return COLORS[atom.resn];
        },
        radius: 0.01
    },
    "LINE_HIGHLIGHT": {
        colorfunc: (atom) => {
            return COLORS[atom.resn];
        },
        radius: 0.2
    },
    "CARTOON_FADED_VARIABILITY": {
        colorfunc: (atom) => {
            let resi = atom.resi;
            let chain = atom.chain;
            return STRCcomputeVariabilityColor(chain, resi);
        },
        opacity: 0.5,
        thickness: 0.2,
        arrows: true
    },
    "CARTOON_HIGHLIGHT_VARIABILITY": {
        colorfunc: (atom) => {
            let resi = atom.resi;
            let chain = atom.chain;
            return STRCcomputeVariabilityColor(chain, resi);
        },
        opacity: 0.9,
        thickness: 0.2,
        arrows: true
    },
    "CARTOON_FADED_HYDROPATHICITY": {
        colorfunc: (atom) => {
            let resi = atom.resi;
            let chain = atom.chain;
            return STRCcomputeScaledKDHydropColor(chain, resi);
        },
        opacity: 0.5,
        thickness: 0.2,
        arrows: true
    },
    "CARTOON_HIGHLIGHT_HYDROPATHICITY": {
        colorfunc: (atom) => {
            let resi = atom.resi;
            let chain = atom.chain;
            return STRCcomputeScaledKDHydropColor(chain, resi);
        },
        opacity: 0.9,
        thickness: 0.2,
        arrows: true
    }
};
// Color specification of all components used for visualizations.
var COLORS = {
    // Nucleotides
    "A": "#DB5461",
    "C": "#0471A6",
    "G": "#E8C547",
    "T": "#3E885B",
    "N": "#75551d",
    "-": "#212121",
    // Secondary Structure
    "coil": "#c9c9c9",
    "helix": "#d13917",
    "sheet": "#1771d1",
    // Amino Acids
    "HIS": "#27269A",   // Polar (positive), Basic
    "LYS": "#2F49B1",
    "ARG": "#3874C8",
    "ASP": "#F75050",   // Polar (negative), Acidic
    "GLU": "#FB6581",
    "SER": "#1EAB13",   // Polar (neutral)
    "THR": "#38B42B",
    "ASN": "#51BC43",
    "GLN": "#6AC55B",
    "CYS": "#DEC443",   // Sulfur bridge forming
    "PHE": "#5826ED",   // Aromatic
    "TRP": "#653CEF",
    "TYR": "#7352F1",
    "ALA": "#239E90",   // Aliphatic
    "VAL": "#34A597",
    "LEU": "#45AD9E",
    "ILE": "#55B4A5",
    "MET": "#66BCAC",
    "PRO": "#77C3B4",
    "GLY": "#88CABC",
    "TER": "#E61090",   // Termination
    "ANY": "#75551D",   // Unknown amino acid
    "INC": "#75551D",   // Incomplete amino acid.
    "DEL": "#212121",   // Deletion
    "NONE": "#E4E5ED"
};
var VARIABILITY_COLOR_LIST = [...Array(101).keys()].map(value => {
    if (value == 0) {
        return "rgb(200,200,200)";
    } else {
        let c1 = Math.round(230 - (((230 - 115) / 100) * (value - 1)));
        let c2 = Math.round(169 - ((169 / 100) * (value - 1)));
        let c3 = Math.round(27 + (((255 - 27) / 100) * (value - 1)));
        return "rgb(" + c1 + "," + c2 + "," + c3 + ")";
    }
});
// Encoding of string contents, i.e. nucleotides and amino-acids, used for internal representation in visualizations.
let c = 0;
var CONTENT_ENCODING = {}
for (const key of Object.keys(COLORS)) {
    CONTENT_ENCODING[key] = c;
    c += 1;
}
// Decoding of string contents, i.e. nucleotides and amino-acids, used for internal representation in visualizations.
var CONTENT_DECODING = {};
for (const [key, value] of Object.entries(CONTENT_ENCODING)) {
    CONTENT_DECODING[value] = key;
}

/*
[2] Definition of runtime variables that hold data or the state of single components.
    The single components will use the following abbreviations for variable names:
    - structureView > STRC
    - variantsView > VARC
    - compositionView > COMC
    - info > INFC
*/
// The main object to hold data.
var DATA = new Object();
// The view height set for eChart elements.
var VARC_ECHART_VIEW_HEIGHT = 0;
var VARC_ECHART_VIEW_WIDTH = 0;
var COMC_ECHART_VIEW_HEIGHT = 0;
var COMC_ECHART_VIEW_WIDTH = 0;
window.onload = _ => {
    VARC_ECHART_VIEW_HEIGHT = ((window.innerHeight * (1 - 0.516)) - 60).toString() + "px";
    VARC_ECHART_VIEW_WIDTH = (window.innerWidth - 8).toString() + "px";
    document.getElementById('variantsViewContent').style.height = VARC_ECHART_VIEW_HEIGHT;
    document.getElementById('variantsViewContent').style.width = VARC_ECHART_VIEW_WIDTH;
    new ResizeObserver((_) => {
        VARC_ECHART_VIEW_HEIGHT = ((window.innerHeight * (1 - 0.516)) - 60).toString() + "px";
        VARC_ECHART_VIEW_WIDTH = (window.innerWidth - 8).toString() + "px";
        document.getElementById("variantsViewContent").style.height = VARC_ECHART_VIEW_HEIGHT;
        document.getElementById("variantsViewContent").style.width = VARC_ECHART_VIEW_WIDTH;
        if (typeof (VARC_ECHART) !== "undefined") {
            VARC_ECHART.resize();
        }
    }).observe(document.getElementById("main"));

    COMC_ECHART_VIEW_HEIGHT = (window.innerHeight * 0.513).toString() + "px";
    COMC_ECHART_VIEW_WIDTH = (window.innerWidth * 0.3).toString() + "px";
    document.getElementById('compositionViewContent').style.height = COMC_ECHART_VIEW_HEIGHT;
    document.getElementById('compositionViewContent').style.width = COMC_ECHART_VIEW_WIDTH;
    new ResizeObserver((_) => {
        COMC_ECHART_VIEW_HEIGHT = (window.innerHeight * 0.513).toString() + "px";
        COMC_ECHART_VIEW_WIDTH = (window.innerWidth * 0.3).toString() + "px";
        document.getElementById("compositionViewContent").style.height = COMC_ECHART_VIEW_HEIGHT;
        document.getElementById("compositionViewContent").style.width = COMC_ECHART_VIEW_WIDTH;
        if (typeof (COMC_ECHART) !== "undefined") {
            COMC_ECHART.resize();
        }
    }).observe(document.getElementById("main"));
};
// The variantViews eChart element.
var VARC_ECHART;
// The variantViews eChart options object, i.e. the chart specification object, for more information see: https://echarts.apache.org/en/option.html#title
var VARC_ECHART_OPTION;
// The compositionView eChart element.
var COMC_ECHART;
// The compositionViews eChart options object, i.e. the chart specification object, for more information see: https://echarts.apache.org/en/option.html#title
var COMC_ECHART_OPTION;
// If all components finished initialising.
var IS_LOADED = false;
// Timeout in ms for tooltip display delay.
var TIMEOUT = 150;
// Whether the variantView is currently in merged genotypes mode.
var VARC_GENTYPES_MERGED = true;
// The names of present samples.
var SAMPLE_LABELS = [];
// List of available chains.
var CHAIN_IDENTIFIERS = [];
// The currently selected chain.
var SELECTED_CHAIN = "";
// The .pdb file as File object.
var PDB_FILE;
// The .pdb files content as string.
var PDB_STRING;
// The 3DMol structure viewer.
var STRUCTURE_VIEWER;
// JS object containing per residue information, e.g. secondary-structure and hydropathicity.
var PROTEIN_RESIDUES = new Object();
// Variables used to compute scaled hydropathicity values as done by Expasy/ProtScale, for more information see: https://web.expasy.org/protscale/protscale-doc.html
var HYDROPATHICITY_WINDOW = 3;
var HYDROPATHICITY_WEIGHT = 0.5;
var HYDROPATHICITY_MIN_VAL = 0;
var HYDROPATHICITY_MAX_VAL = 1;
// Variables to store VARC heatmap data and meta-information.
var VARC_REF_PROTEIN_CONTENT = new Object();
var VARC_REF_PROTEIN_SS = [];
var VARC_REF_PROTEIN_HYDROP = [];
var VARC_REF_PROTEIN_VARIABILITY = [];
var VARC_REF_TRANSLATED_FEATURE_CONTENT = new Object();
var VARC_VARIANTS_CONTENT = new Object();
var VARC_VARIANTS_CONTENT_AMBIGUOUS = new Object();
var VARC_VARIANTS_LABELS = [];
var VARC_PROTEOFORM_ACCESSOR_MAP = new Object();
var VARC_GENOTYPE_ACCESSOR_MAP = new Object();
var VARC_PER_SUPERPOSITION_VARIANT_ENTRIES = new Object();
var VARC_AGGREGATION_MODE = 'PROTEOFORM'; // SAMPLE, GENOTYPE or PROTEOFORM
var VARC_AMBIGUITY_MODE = 'MASK'; // MASK, SHOW
// Variables to store STRC meta-information.
var STRC_HIGHLIGHTED_REGION = [];
var STRC_COLOR_SCHEME = "VARIABILITY";
var STRC_SELECTED_RESIDUES = [];
var STRC_SHOW_CONTACTS = false; // TODO: Set default to true once PRISMEM15 scores are updated.
// Variables to store COMC meta-information.
var COMC_DISPLAYED_POSITION = -1;
var COMC_SHOW_REFERENCE = false;
// Variables to store INFC meta-information.
var INFC_SUBSTITUTION = "None";
// Variables to store PV meta-information.
var PROTEIN_VIEWER_CONTACT_LABELS = [];
var PV_SNV_HIGHLIGHTED = [];
var PV_SNV_IS_HIGHLIGHTED = false;
var PV_SNV_HIGHLIGHT_MIN = 0;
var PV_TERMINI_HIGHLIGHTED = [];
var PV_TERMINI_IS_HIGHLIGHTED = false;
var PV_BACKBONE_COLOR = "_variants";
var PV_SHOW_CONTACTS = false;
// Variable to store error log.
var IS_ERROR = false;
var ERROR_LOG = [];

/**
 * Closes the specified element.
 * 
 * @param {Text} elementId 
 */
function closeElement(elementId) {
    document.getElementById(elementId) ? document.getElementById(elementId).style.display = "none" : null;
}

/**
 * Shows the specified element with the specified display style.
 * 
 * @param {Text} elementId 
 * @param {Text} style 
 */
function showElement(elementId, style) {
    document.getElementById(elementId) ? document.getElementById(elementId).style.display = style : null;
}

/**
 * Handles the user selection of a directory.
 * 
 * @param {Event} event: A filedrop event. The target of the event has to be a `FileList` instance. 
 */
function directoryInputHandler(event) {
    // Hide input placeholder text and show process loader.
    document.getElementById("directoryInput").style.display = "none";
    document.getElementById("directoryInputIcon").style.display = "none";
    document.getElementById("directoryInputText").style.display = "none";
    document.getElementById("directoryInputProcessLoader").style.display = "flex";
    var files = event.target.files;
    loadData(files, init);
}

/**
 * Replaces the loader with an error message.
 */
function showError() {
    document.getElementById("inputComponent").innerHTML = '<i id="directoryInputIcon" class="fas fa-exclamation-triangle"></i><br><br><b id="directoryInputText">An error occurred during initialization!</b><br><b>Please reload the page to continue.</b>';
    $('#inputComponent b').css('color', 'var(--error-color)');
    Swal.fire({
        icon: 'error',
        title: '<strong>Error during initialization!</strong>',
        html: "<p style='text-align: left;'>" + ERROR_LOG.join("<br>") + "</p>",
        background: '#EFF0F8',
        confirmButtonText: 'Ok',
        confirmButtonColor: '#607196'
    });
    throw Error("An error occured during initialization.")
}

/**
 * Parses the MUSIAL output files specified with the passed file list.
 * 
 * @param {FileList} fileList: A `FileList` instance that specifies the output files of a MUSIAL run.
 * @param {_callback} function: A function to call after relevant data has been loaded. The callback function has to accept exactly the fileList parameter.
 */
function loadData(fileList, _callback) {
    var file;
    var list = [];
    // Parse structure allocation data.
    window.setTimeout(
        function () {
            list = [...fileList].filter(s => s.name.startsWith("variantStructureAllocation"));
            if (list.length == 0) {
                IS_ERROR = true;
                ERROR_LOG.push("• No variantStructureAllocation.json file could be loaded!");
            } else {
                file = list[0];
                parseSuperposition(file);
            }
        },
        0
    );
    // Parse structure residues distance map.
    window.setTimeout(
        function () {
            list = [...fileList].filter(s => s.name.startsWith("residueDistanceMap"));
            if (list.length == 0) {
                IS_ERROR = true;
                ERROR_LOG.push("• No residueDistanceMap.tsv file could be loaded!");
            } else {
                file = list[0];
                parseDistanceMap(file);
            }
        },
        100
    );
    // Parse SNV table annotations.
    window.setTimeout(
        function () {
            list = [...fileList].filter(s => s.name.startsWith("variantAnnotationTable"));
            if (list.length == 0) {
                IS_ERROR = true;
                ERROR_LOG.push("• No variantAnnotationTable.tsv file could be loaded!");
            } else {
                file = list[0];
                parseAnnotationTable(file);
            }
        },
        200
    );
    // Run provided callback function to further process parsed data.
    window.setTimeout(
        function () {
            try {
                _callback(fileList);
            } catch (e) {
                IS_ERROR = true;
                ERROR_LOG.push("• Internal Error: " + e.name + " | " + e.message);
            }
        },
        300
    );
}

/**
 * Parses structure allocation data from a file.
 * 
 * @param {File} file: File object pointing to the structureAllocation.json file of a MUSIAL output directory.
 */
function parseSuperposition(file) {
    var fileReader = new FileReader();
    var fileContent;
    fileReader.onload = function (event) {
        fileContent = event.target.result;
        DATA = JSON.parse(fileContent);
    };
    fileReader.readAsText(file);
}

/**
 * Parses structure residues distance data from a file.
 * 
 * @param {File} file: File object pointing to the residueDistanceMap.tsv file of a MUSIAL output directory.
 */
function parseDistanceMap(file) {
    var fileReader = new FileReader();
    var fileContent;
    DATA["ProteinResidueDistanceMap"] = new Object();
    fileReader.onload = function (event) {
        fileContent = event.target.result;
        var results = fileContent.split("\r\n");
        results.shift();
        var residues = results.shift().split("\t");
        residues.shift();
        for (var residue of residues) {
            DATA["ProteinResidueDistanceMap"][residue] = [];
        }
        for (let r of results) {
            let row = r.split("\t");
            if (row.length > 1) {
                var residue = row[0];
                row.shift();
                for (var index = 0; index < row.length; index++) {
                    if (row[index] <= 5.0 && residues[index] !== residue) {
                        DATA["ProteinResidueDistanceMap"][residues[index]].push([residue, row[index]]);
                    }
                }
            }
        }
    };
    fileReader.readAsText(file);
}

/**
 * Parses per sample per variant position annotations from a file.
 * 
 * @param {File} file: File object pointing to the variantAnnotationTable.tsv file of a MUSIAL output directory.
 */
function parseAnnotationTable(file) {
    var fileReader = new FileReader();
    var fileContent;
    DATA["VariantAnnotationTable"] = new Object();
    fileReader.onload = function (event) {
        fileContent = event.target.result;
        var results = fileContent.split("\r\n");
        results.shift();
        var header = results.shift().split("\t");
        header.shift();
        header.shift();
        for (let r of results) {
            let row = r.split("\t");
            if (row.length > 1) {
                var position = row[0];
                // Multiply position with -1 if reference feature is located on the anti-sense strand and parse only one annotation for insertions.
                if (position.includes("+")) {
                    if (position.split("+")[1] === '1') {
                        if (DATA.GeneReferenceIsSense === 'false') {
                            position = (- parseInt(position.split("+")[0])).toString() + 'I';
                        } else {
                            position = position.split("+")[0] + 'I';
                        }
                    } else {
                        continue;
                    }
                } else if (DATA.GeneReferenceIsSense === 'false') {
                    position = (- parseInt(position.split("+")[0])).toString();
                }
                DATA["VariantAnnotationTable"][position] = {};
                row.shift();
                row.shift();
                for (var index = 0; index < row.length; index++) {
                    DATA["VariantAnnotationTable"][position][header[index]] = row[index];
                }
            }
        }
    };
    fileReader.readAsText(file);
}

/**
 * Initializes all visualizations from the passed file list and data object.
 * 
 * @param {FileList} files: List of file references to MUSIAL output files.
 */
function init(files) {
    // Access and store list of available chains of the protein structure.
    let chainId;
    for (let key of Object.keys(DATA)) {
        if (key.startsWith("SuperpositionChain")) {
            chainId = key.replace("SuperpositionChain", "");
            CHAIN_IDENTIFIERS.push(chainId);
        }
    }
    if (CHAIN_IDENTIFIERS.length == 0) {
        // If no chains are available, show an error popup.
        IS_ERROR = true;
        ERROR_LOG.push("• No protein chain data available!")
    } else {
        // Else the first chain is selected.
        SELECTED_CHAIN = CHAIN_IDENTIFIERS[0];
    }
    // Abort initialization if errors during loading input data occured.
    if (IS_ERROR) {
        showError();
    }

    // Access .pdb file from specified files.
    for (let file of files) {
        if (file.name.endsWith(".pdb")) {
            PDB_FILE = file;
        }
    }
    // Initialize the structure view component.
    window.setTimeout(function () { initSTRC(PDB_FILE); }, 0);
    // Initialize the composition summary component.
    window.setTimeout(function () { initCOMC(); }, 250);
    // Initialize alignment view component.
    window.setTimeout(function () { initVARC(VARC_AGGREGATION_MODE); }, 300);
    // Show all components if no error occured.
    window.setTimeout(function () {
        closeElement("inputComponent");
        showElement("structureViewComponent", "block");
        showElement("compositionViewComponent", "block");
        showElement("infoComponent", "block");
        showElement("variantsViewComponent", "block");
    },
        500
    );
    IS_LOADED = true;
}

/**
 * Initializes the structure view component.
 * 
 * @param {File} pdbFile: A file object pointing to a .pdb file.
 */
function initSTRC(pdbFile) {
    // In order to mark positions VARC variant labels have to be computed here?
    switch (VARC_AGGREGATION_MODE) {
        case 'SAMPLE':
            for (let proteoform of Object.keys(DATA["SuperpositionChain" + SELECTED_CHAIN]["Proteoforms"])) {
                for (let genotype of Object.values(DATA["SuperpositionChain" + SELECTED_CHAIN]["Proteoforms"][proteoform]["Genotypes"])) {
                    for (let sample of Object.values(DATA["SuperpositionChain" + SELECTED_CHAIN]["Genotypes"][genotype]["Samples"])) {
                        VARC_VARIANTS_LABELS.push(sample);
                    }
                }
            }
            break;
        case 'GENOTYPE':
            for (let proteoform of Object.keys(DATA["SuperpositionChain" + SELECTED_CHAIN]["Proteoforms"])) {
                for (let genotype of Object.values(DATA["SuperpositionChain" + SELECTED_CHAIN]["Proteoforms"][proteoform]["Genotypes"])) {
                    VARC_VARIANTS_LABELS.push(genotype);
                }
            }
            break;
        case 'PROTEOFORM':
            for (let proteoform of Object.keys(DATA["SuperpositionChain" + SELECTED_CHAIN]["Proteoforms"])) {
                VARC_VARIANTS_LABELS.push(proteoform);
            }
            break;
    }
    let fileReader = new FileReader();
    fileReader.readAsText(pdbFile);
    fileReader.onload = function (e) {
        PDB_STRING = fileReader.result;
        let element = $('#structureViewContent');
        let config = { backgroundColor: '#fafafc', id: 'structureViewCanvas', antialias: true, cartoonQuality: 6 };
        STRUCTURE_VIEWER = $3Dmol.createViewer(element, config);
        STRUCTURE_VIEWER.addModels(PDB_STRING, "pdb");
        STRUCTURE_VIEWER.setClickable(
            {},
            true,
            (sel) => {
                if (sel.chain != SELECTED_CHAIN) {
                    VARCSelectChain(sel.chain);
                }
                STRCSelectResidue(sel.chain, sel.resi, sel.resn, true, COLORS[sel.resn], COLORS[sel.resn], 0.7, 1);
                VARCMarkPosition(PROTEIN_RESIDUES[sel.chain][sel.resi]["superposition"]);
                STRCDisplayContacts();
                INFCSetReferenceInformation(PROTEIN_RESIDUES[sel.chain][sel.resi]["superposition"]);
                COMCDisplay(PROTEIN_RESIDUES[sel.chain][sel.resi]["superposition"]);
            }
        );
        STRUCTURE_VIEWER.zoomTo();
        STRUCTURE_VIEWER.render();
        STRUCTURE_VIEWER.zoom(0.95, TIMEOUT);
        // Gather list of residues for extended computations from 3DMol.js GLModel
        let residueIds = new Set();
        for (const atom of STRUCTURE_VIEWER.getInternalState().models[0].atoms) {
            let resi = atom.resi;
            let chain = atom.chain;
            let ss = atom.ss;
            if (!(chain in PROTEIN_RESIDUES)) {
                PROTEIN_RESIDUES[chain] = new Object();
            }
            if (residueIds.has(chain + resi)) {
                continue;
            } else {
                switch (ss) {
                    case 'c':
                        ss = 'coil';
                        break;
                    case 's':
                        ss = 'sheet';
                        break;
                    case 'h':
                        ss = 'helix';
                        break;
                }
                PROTEIN_RESIDUES[chain][resi] = { "resn": atom.resn, "ss": ss };
                residueIds.add(chain + resi);
            }
        }
        // Add superpositions to residues.
        var proteinPosition;
        for (const chain of CHAIN_IDENTIFIERS) {
            for (const superposition of Object.keys(DATA["SuperpositionChain" + chain])) {
                if (superposition === "ReferenceProteinLength" || superposition === "Genotypes" || superposition === "Proteoforms") {
                    continue;
                } else {
                    proteinPosition = DATA["SuperpositionChain" + chain][superposition]["ProteinPosition"];
                    if (proteinPosition !== -1) {
                        PROTEIN_RESIDUES[chain][proteinPosition]["superposition"] = superposition;
                    }
                }
            }
        }
        // Compute hydropathicity for collected residues.
        STRCcomputeScaledKDHydrop();
        // Compute uncertainty for collected residues.
        STRCcomputeVariability();
    };
}

/**
 * Computes uncertainty scores for each residue stored in `PROTEIN_RESIDUES` as the information entropy using the logarithm to the base 23 (as residues can have 23 types: The 20 naturally occuring residues, termination, any amino acid and ambiguous amino acid).
 * Residues with a low uncertainty, i.e. low variability, will achieve values close to zero and residues with a high uncertainty, i.e. high variability will achieve values close to one.
 */
function STRCcomputeVariability() {
    let noSamples = 0;
    let proteinPosition;
    let positionContentCounts = new Object();
    let proteoformContent;
    let variability;
    for (let chain of Object.keys(PROTEIN_RESIDUES)) {
        // First compute number of samples per proteoform.
        let perProteoformNoSamples = new Object();
        for (let proteoform of Object.keys(DATA["SuperpositionChain" + SELECTED_CHAIN]["Proteoforms"])) {
            perProteoformNoSamples[proteoform] = 0;
            for (let genotype of Object.values(DATA["SuperpositionChain" + SELECTED_CHAIN]["Proteoforms"][proteoform]["Genotypes"])) {
                for (let sample of Object.values(DATA["SuperpositionChain" + SELECTED_CHAIN]["Genotypes"][genotype]["Samples"])) {
                    perProteoformNoSamples[proteoform] += 1;
                }
            }
        }
        // Iterate over each superimposed position to access amino-acid counts.
        for (let index of Object.keys(DATA["SuperpositionChain" + chain])) {
            noSamples = 0;
            variability = 0;
            positionContentCounts = new Object();
            if (index === "ReferenceProteinLength" || index === "Genotypes" || index === "Proteoforms") {
                continue;
            }
            proteinPosition = DATA["SuperpositionChain" + chain][index]["ProteinPosition"];
            if (proteinPosition !== -1) {
                // Count residue types per proteoform and increase sample count wrt. ambiguity mode.
                for (let proteoform of Object.keys(perProteoformNoSamples)) {
                    proteoformContent = DATA["SuperpositionChain" + chain][index]["PerProteoformAminoAcidContent"][proteoform];
                    if (VARC_AMBIGUITY_MODE != 'SHOW' && proteoformContent === proteoformContent.toLowerCase()) {
                        continue;
                    } else {
                        proteoformContent = proteoformContent.toUpperCase();
                        if (proteoformContent === "INC") {
                            proteoformContent = "ANY";
                        }
                        if (proteoformContent in positionContentCounts) {
                            positionContentCounts[proteoformContent] += perProteoformNoSamples[proteoform];
                            noSamples += perProteoformNoSamples[proteoform];
                        } else {
                            positionContentCounts[proteoformContent] = perProteoformNoSamples[proteoform];
                            noSamples += perProteoformNoSamples[proteoform];
                        }
                    }
                }
                for (let value of Object.values(positionContentCounts)) {
                    variability += (value / noSamples) * (Math.log(value / noSamples) / Math.log(23));
                }
                PROTEIN_RESIDUES[chain][proteinPosition]["variability"] = parseFloat(-1 * variability).toFixed(2);
            }
        }
    }
}

/**
 * Computes a color based on a uncertainty score.
 * The color turns to a blue-green tone the more uncertain the corresponding residue position is.
 *
 * @param {string} chain: The chain identifier of the protein residue for which a color should be computed.
 * @param {string} resi: The residue identifier of the protein residue for which a color should be computed.
 * @returns RGB String of the computed color.
 */
function STRCcomputeVariabilityColor(chain, resi) {
    let value = PROTEIN_RESIDUES[chain][resi]["variability"] * 100;
    if (value == 0) {
        return "rgb(200,200,200)";
    } else {
        let c1 = Math.round(230 - (((230 - 115) / 100) * (value - 1)));
        let c2 = Math.round(169 - ((169 / 100) * (value - 1)));
        let c3 = Math.round(27 + (((255 - 27) / 100) * (value - 1)));
        return "rgb(" + c1 + "," + c2 + "," + c3 + ")";
    }
}

/**
 * Computes scaled Kyte-Doolittle Hyropathicity scores for each residue stored in `PROTEIN_RESIDUES` using the window and edge weights stored in `HYDROPATHICITY_WINDOW` and `HYDROPATHICITY_WEIGHT` respectively.
 * Hydrophobic residues will achieve a value of up to 1 while hydrophilic values will achieve a value of down to 0.
 */
function STRCcomputeScaledKDHydrop() {
    let shift = ((HYDROPATHICITY_WINDOW - 1) / 2);
    let normFactor;
    let f;
    let hydropathicity;
    var residueIndex;
    var residueIndexLeft;
    var residueIndexRight;
    var residueIndices;
    for (let chain of Object.keys(PROTEIN_RESIDUES)) {
        residueIndices = Object.keys(PROTEIN_RESIDUES[chain]);
        let firstIndex = Math.min(...residueIndices);
        let lastIndex = Math.max(...residueIndices);
        for (residueIndex of residueIndices) {
            hydropathicity = 0;
            normFactor = 0;
            for (residueIndexLeft = residueIndex - 1; residueIndexLeft >= Math.max(firstIndex, residueIndex - shift); residueIndexLeft--) {
                f = (HYDROPATHICITY_WEIGHT + (((1 - HYDROPATHICITY_WEIGHT) / shift) * (shift - Math.abs(residueIndex - residueIndexLeft))));
                hydropathicity += SCALED_KD_HYDROP[PROTEIN_RESIDUES[chain][residueIndexLeft].resn] * f;
                normFactor += f;
            }
            f = 1;
            hydropathicity += SCALED_KD_HYDROP[PROTEIN_RESIDUES[chain][residueIndex].resn] * f;
            normFactor += 1;
            for (residueIndexRight = residueIndex + 1; residueIndexRight <= Math.min(lastIndex, residueIndex + shift); residueIndexRight++) {
                f = (HYDROPATHICITY_WEIGHT + (((1 - HYDROPATHICITY_WEIGHT) / shift) * (shift - Math.abs(residueIndex - residueIndexRight))));
                hydropathicity += SCALED_KD_HYDROP[PROTEIN_RESIDUES[chain][residueIndexRight].resn] * f;
                normFactor += f;
            }
            PROTEIN_RESIDUES[chain][residueIndex]["scKDH"] = parseFloat(hydropathicity / normFactor).toFixed(2);
        }
    }
}

/**
 * Computes a color based on a scaled Kyte-Doolittle Hyropathicity score.
 * Hydrophobic residues will be assigned a brownish color while hydrophilic residues will be assigned a blueish color.
 * 
 * @param {string} chain: The chain identifier of the protein residue for which a color should be computed.
 * @param {string} resi: The residue identifier of the protein residue for which a color should be computed.
 * @returns RGB String of the computed color.
 */
function STRCcomputeScaledKDHydropColor(chain, resi) {
    function STRCcomputeColorDiff(to, from, val) {
        return parseFloat(from + ((to - from) * val)).toFixed(0);
    }
    let scKDHValue = PROTEIN_RESIDUES[chain][resi]["scKDH"];
    if (scKDHValue > 0.5) {
        return "rgb(" + STRCcomputeColorDiff(184, 230, (scKDHValue - 0.5) / 0.5) + "," + STRCcomputeColorDiff(119, 230, (scKDHValue - 0.5) / 0.5) + "," + STRCcomputeColorDiff(55, 230, (scKDHValue - 0.5) / 0.5) + ")";
    } else if (scKDHValue < 0.5) {
        return "rgb(" + STRCcomputeColorDiff(69, 230, scKDHValue / 0.5) + "," + STRCcomputeColorDiff(167, 230, scKDHValue / 0.5) + "," + STRCcomputeColorDiff(237, 230, scKDHValue / 0.5) + ")";
    } else {
        return "rgb(230, 230, 230)"
    }
}

/**
 * Clears any selection visual effects and internal references.
 */
function STRCClearSelection() {
    // Remove existing selection.
    if (STRC_SELECTED_RESIDUES.length != 0) {
        for (let selectedResidue of STRC_SELECTED_RESIDUES) {
            if (selectedResidue !== undefined) {
                if ((STRC_HIGHLIGHTED_REGION[0] <= selectedResidue[1]) && (selectedResidue[1] <= STRC_HIGHLIGHTED_REGION[1])) {
                    STRUCTURE_VIEWER.setStyle(
                        {
                            chain: selectedResidue[0],
                            resi: selectedResidue[1]
                        },
                        {
                            cartoon: STYLES_3DMOL["CARTOON_HIGHLIGHT_" + STRC_COLOR_SCHEME],
                            stick: STYLES_3DMOL.LINE_FADED
                        }
                    );
                } else {
                    STRUCTURE_VIEWER.setStyle(
                        {
                            chain: selectedResidue[0],
                            resi: selectedResidue[1]
                        },
                        {
                            cartoon: STYLES_3DMOL["CARTOON_FADED_" + STRC_COLOR_SCHEME],
                            stick: STYLES_3DMOL.LINE_FADED
                        }
                    );
                }
                STRUCTURE_VIEWER.removeLabel(selectedResidue[3]);
            }
        }
        STRC_SELECTED_RESIDUES = [];
    }
}

/**
 * Selects the specified residue in the protein structure, i.e. displays a label and stores an internal reference.
 * 
 * @param {string} chain The chain identifier of the residue to select.
 * @param {string} resi The residue number of the residue to select.
 * @param {string} resn The residue type of the residue to select.
 * @param {boolean} clear Whether to clear previous selection.
 * @param {string} labelBackgroundColor RGB or HEX string specifying the label background color of selected residue.
 * @param {string} labelBorderColor RGB or HEX string specifying the label border color of selected residue.
 * @param {Float} backgroundOpacity The oapcity of the label.
 * @param {Integer} borderThickness The thickness of the label border.
 */
function STRCSelectResidue(chain, resi, resn, clear, labelBackgroundColor, labelBorderColor, backgroundOpacity, borderThickness) {
    // Remove existing selection if specified.
    if (clear) {
        STRCClearSelection();
        STRUCTURE_VIEWER.center({ chain: chain, resi: resi }, 300);
    }
    STRUCTURE_VIEWER.addStyle(
        {
            chain: chain,
            resi: resi
        },
        {
            stick: STYLES_3DMOL.LINE_HIGHLIGHT
        }
    );
    var label = STRUCTURE_VIEWER.addLabel(
        chain + " " + resi + ": " + resn,
        {
            backgroundColor: labelBackgroundColor,
            backgroundOpacity: backgroundOpacity,
            borderColor: labelBorderColor,
            borderThickness: borderThickness,
            fontColor: "#292926",
            fontSize: 10,
            alignment: "topLeft"
        },
        {
            chain: chain,
            resi: resi
        },
        false
    );
    STRC_SELECTED_RESIDUES.push([chain, resi, resn, label]);
    STRUCTURE_VIEWER.render();
}

/**
 * Sets the structure backbone coloring scheme to the specified scheme and applies the style.
 * 
 * @param {String} scheme One of `VARIABILITY` and `HYDROP` is currently supported.
 */
function STRCSetColorScheme(scheme) {
    let colorVariabilityBtn = document.getElementById('menuSTRCColorVariabilityBtn');
    let colorHydropathicityBtn = document.getElementById('menuSTRCColorHydropathicityBtn');
    switch (scheme) {
        case 'VARIABILITY':
            if (STRC_COLOR_SCHEME != 'VARIABILITY') {
                STRC_COLOR_SCHEME = 'VARIABILITY';
                colorVariabilityBtn.classList.add("menuBtnActive");
                colorHydropathicityBtn.classList.remove("menuBtnActive");
            }
            break;
        case 'HYDROPATHICITY':
            if (STRC_COLOR_SCHEME != 'HYDROPATHICITY') {
                STRC_COLOR_SCHEME = 'HYDROPATHICITY';
                colorHydropathicityBtn.classList.add("menuBtnActive");
                colorVariabilityBtn.classList.remove("menuBtnActive");
            }
            break;
    }
    STRCApplyStyle();
}

/**
 * Applies the currently specified structure model style.
 */
function STRCApplyStyle() {
    let highlightChain = SELECTED_CHAIN;
    let highlightFrom = STRC_HIGHLIGHTED_REGION[0];
    let highlightTo = STRC_HIGHLIGHTED_REGION[1];
    // Apply default style.
    STRUCTURE_VIEWER.setStyle(
        {},
        { cartoon: STYLES_3DMOL["CARTOON_FADED_" + STRC_COLOR_SCHEME], stick: STYLES_3DMOL.LINE_FADED }
    );
    // Apply membrane style.
    STRUCTURE_VIEWER.setStyle(
        {
            chain: ["x", "y", "z"],
            resn: "DUM"
        },
        {
            cross: {
                radius: 0.8,
                colorfunc: (atom) => {
                    if (atom.elem == "O") {
                        return "#a86d71";
                    } else if (atom.elem == "N") {
                        return "#6d8ba8";
                    }
                }
            }
        }
    );
    // Apply backbone highlighting.
    STRUCTURE_VIEWER.setStyle(
        {
            chain: highlightChain,
            resi: highlightFrom.toString() + "-" + highlightTo.toString()
        },
        {
            cartoon: STYLES_3DMOL["CARTOON_HIGHLIGHT_" + STRC_COLOR_SCHEME],
            stick: STYLES_3DMOL.LINE_FADED
        }
    );
    // Apply selection style.
    for (let selectedResidue of STRC_SELECTED_RESIDUES) {
        if (selectedResidue !== undefined) {
            STRUCTURE_VIEWER.addStyle(
                { chain: selectedResidue[0], resi: selectedResidue[1] },
                { stick: STYLES_3DMOL.LINE_HIGHLIGHT }
            );
        }
    }
    STRUCTURE_VIEWER.render();
}

/**
 * Displays visual contact information of the selected residue and stores internal references.
 */
function STRCDisplayContacts() {
    if (STRC_SELECTED_RESIDUES.length != 0 && STRC_SHOW_CONTACTS) {
        let selResChain = STRC_SELECTED_RESIDUES[0][0]
        let selResResi = STRC_SELECTED_RESIDUES[0][1]
        let selResType = STRC_SELECTED_RESIDUES[0][2]
        let selResStruc = PROTEIN_RESIDUES[selResChain][selResResi]["ss"];
        selResStruc = selResStruc.charAt(0).toUpperCase() + selResStruc.slice(1);
        let resDistanceMapkey = selResResi + selResChain;
        if (resDistanceMapkey in DATA["ProteinResidueDistanceMap"]) {
            let residuesInContact = DATA["ProteinResidueDistanceMap"][resDistanceMapkey];
            if (residuesInContact.length > 0) {
                let contactInformationHtmlString = "";
                for (let residueInContact of residuesInContact) {
                    let conResChain = residueInContact[0].slice(-1);
                    let conResResi = residueInContact[0].slice(0, -1);
                    let conResType = PROTEIN_RESIDUES[conResChain][conResResi]["resn"];
                    let conResStruc = PROTEIN_RESIDUES[conResChain][conResResi]["ss"];
                    let conResColor;
                    let conResStrucColor;
                    let distance = residueInContact[1];
                    conResColor = COLORS[conResType];
                    switch (conResStruc) {
                        case "sheet":
                            conResStrucColor = COLORS["sheet"];
                            break;
                        case "helix":
                            conResStrucColor = COLORS["helix"];
                            break;
                        case "coil":
                            conResStrucColor = COLORS["coil"];
                            break;
                    }
                    conResStruc = conResStruc.charAt(0).toUpperCase() + conResStruc.slice(1);
                    STRCSelectResidue(conResChain, conResResi, conResType, false, "#E4E5ED", "", 0.5, 0.0);
                    contactInformationHtmlString += "<br>&bull; " + conResChain + conResResi + " | " + "<span style='color: " + conResColor + "'>&#9724; </span> " + conResType + " | " + "<span style='color: " + conResStrucColor + "'>&#9724; </span>" + conResStruc + "</i><br>";
                    contactInformationHtmlString += "Distance (SCM): " + parseFloat(distance).toFixed(2) + " Å<br>";
                    /* Assing PRI15 scores */
                    let PRISMEM15WT = PRISMEM15_SCORES[selResType + "-" + selResStruc + "/" + conResType + "-" + conResStruc];
                    if (PRISMEM15WT == "-Infinity") {
                        PRISMEM15WT = "Not observed."
                    } else {
                        PRISMEM15WT = parseInt(PRISMEM15WT);
                    }
                    contactInformationHtmlString += "Score Wildtype (PRISMEM15): " + PRISMEM15WT + "<br>";
                    if (INFC_SUBSTITUTION != "None" && INFC_SUBSTITUTION != "Termination" && INFC_SUBSTITUTION != "Ambiguous") {
                        let PRISMEM15MT = PRISMEM15_SCORES[INFC_SUBSTITUTION + "-" + selResStruc + "/" + conResType + "-" + conResStruc];
                        if (PRISMEM15MT == "-Infinity") {
                            PRISMEM15MT = "Not observed."
                        } else {
                            PRISMEM15MT = parseInt(PRISMEM15MT);
                        }
                        contactInformationHtmlString += "Score Mutation (PRISMEM15): " + PRISMEM15MT + "<br>";
                    }
                }
                STRUCTURE_VIEWER.render();
                INFCSetContactInformation(contactInformationHtmlString);
            } else {
                INFCSetContactInformation("<br><b style='color: #cbd0e0'>No contacts.</b><br>");
            }
        }
    } else {
        // Remove all contact information.
        for (let i = 1; i < STRC_SELECTED_RESIDUES.length; i++) {
            STRUCTURE_VIEWER.removeLabel(STRC_SELECTED_RESIDUES[i][3]);
        }
        if (STRC_SELECTED_RESIDUES.length !== 0) {
            STRC_SELECTED_RESIDUES = [STRC_SELECTED_RESIDUES[0]];
        } else {
            STRC_SELECTED_RESIDUES = [];
        }
        STRCApplyStyle();
        if (STRC_SHOW_CONTACTS) {
            INFCSetContactInformation("<br><b style='color: #cbd0e0'>No information available.</b><br>");
        } else {
            INFCSetContactInformation("<b style='color: #E4E5ED'>Display of contact information disabled.</b>");
        }
    }
}

/**
 * Toggles the option to display contact information.
 */
function STRCToggleDisplayContacts() {
    // TODO: Uncomment code once PRISMEM15 scores are updated.
    alert( "The option to display contact information is currently disabled." )
    /*
    let STRCDisplayContactsBtn = document.getElementById("menuSTRCDisplayContactsBtn");
    if (STRC_SHOW_CONTACTS) {
        STRC_SHOW_CONTACTS = false;
        STRCDisplayContacts();
        STRCDisplayContactsBtn.classList.remove("menuBtnActive");
    } else {
        STRC_SHOW_CONTACTS = true;
        STRCDisplayContacts();
        STRCDisplayContactsBtn.classList.add("menuBtnActive");
    }
    */
}

/**
 * Expands the structure view component.
 */
function STRCExpand() {
    document.getElementById("STRCExpandBtn").innerHTML = '<i class="fas fa-compress"></i>';
    document.getElementById("STRCExpandBtn").onclick = STRCCompress;
    document.getElementById("structureViewComponent").style.width = "99.7%";
    document.getElementById("structureViewComponent").style.height = "calc( 98% - 40px )";
}

/**
 * Collapses the structure view component.
 */
function STRCCompress() {
    document.getElementById("STRCExpandBtn").innerHTML = '<i class="fas fa-expand">';
    document.getElementById("STRCExpandBtn").onclick = STRCExpand;
    document.getElementById("structureViewComponent").style.width = "51.2%";
    document.getElementById("structureViewComponent").style.height = "51.3%";
}

/**
 * Initializes the position composition component.
 */
function initCOMC() {
    var chartDom = document.getElementById('compositionViewContent');
    COMC_ECHART = echarts.init(chartDom, { "renderer": "canvas" });
}

/**
 * Initializes the variants view component.
 */
function initVARC() {
    var chartDom = document.getElementById('variantsViewContent');
    VARC_ECHART = echarts.init(chartDom, { "renderer": "canvas" });
    // Empty lists holding possibly existent VARC data.
    VARC_REF_PROTEIN_CONTENT = {
        "AA_CLUSTER_POLAR": [],
        "AA_CLUSTER_UNPOLAR": [],
        "AA_CLUSTER_OTHER": []
    };
    VARC_REF_PROTEIN_SS = [];
    VARC_REF_PROTEIN_HYDROP = [];
    VARC_REF_PROTEIN_VARIABILITY = [];
    VARC_REF_TRANSLATED_FEATURE_CONTENT = {
        "AA_CLUSTER_POLAR": [],
        "AA_CLUSTER_UNPOLAR": [],
        "AA_CLUSTER_OTHER": []
    };
    VARC_VARIANTS_CONTENT = {
        "AA_CLUSTER_POLAR": [],
        "AA_CLUSTER_UNPOLAR": [],
        "AA_CLUSTER_OTHER": []
    };
    VARC_VARIANTS_CONTENT_AMBIGUOUS = {
        "AA_CLUSTER_POLAR": [],
        "AA_CLUSTER_UNPOLAR": [],
        "AA_CLUSTER_OTHER": []
    };
    VARC_VARIANTS_LABELS = [];
    VARC_PROTEOFORM_ACCESSOR_MAP = new Object();
    VARC_GENOTYPE_ACCESSOR_MAP = new Object();
    // Dependent on the specified mode fill variants data labels.
    switch (VARC_AGGREGATION_MODE) {
        case 'SAMPLE':
            for (let proteoform of Object.keys(DATA["SuperpositionChain" + SELECTED_CHAIN]["Proteoforms"])) {
                for (let genotype of Object.values(DATA["SuperpositionChain" + SELECTED_CHAIN]["Proteoforms"][proteoform]["Genotypes"])) {
                    for (let sample of Object.values(DATA["SuperpositionChain" + SELECTED_CHAIN]["Genotypes"][genotype]["Samples"])) {
                        VARC_VARIANTS_LABELS.push(sample);
                        VARC_PROTEOFORM_ACCESSOR_MAP[sample] = proteoform;
                        VARC_GENOTYPE_ACCESSOR_MAP[sample] = genotype;
                    }
                }
            }
            break;
        case 'GENOTYPE':
            for (let proteoform of Object.keys(DATA["SuperpositionChain" + SELECTED_CHAIN]["Proteoforms"])) {
                for (let genotype of Object.values(DATA["SuperpositionChain" + SELECTED_CHAIN]["Proteoforms"][proteoform]["Genotypes"])) {
                    VARC_VARIANTS_LABELS.push(genotype);
                    VARC_PROTEOFORM_ACCESSOR_MAP[genotype] = proteoform;
                    VARC_GENOTYPE_ACCESSOR_MAP[genotype] = genotype;
                }
            }
            break;
        case 'PROTEOFORM':
            for (let proteoform of Object.keys(DATA["SuperpositionChain" + SELECTED_CHAIN]["Proteoforms"])) {
                VARC_VARIANTS_LABELS.push(proteoform);
                VARC_PROTEOFORM_ACCESSOR_MAP[proteoform] = proteoform;
            }
            break;
    }

    // Iterate over protein positions of selected chain and fill 2D-lists (i.e. heatmap data matrices).
    var c = 0;
    let proteinPosition;
    let refProteinContent;
    let refTransNucContent;
    let variantContent;
    var superpositions = [];
    var variantsEditedLabels = [];
    var variantYAxisName = 'Samples';
    var referenceCategoricalDataLabels = [];
    var referenceCategoricalsCount = 3;
    var referenceNumericalDataLabels = [];
    var referenceNumericalsCount = 2;
    var variantPositionsIndicatorData = new Set();
    var lastSuperposition = 0;
    for (let superposition of Object.keys(DATA["SuperpositionChain" + SELECTED_CHAIN])) {
        if (superposition === 'ReferenceProteinLength' || superposition === 'Genotypes' || superposition === 'Proteoforms') {
            continue;
        } else {
            proteinPosition = DATA["SuperpositionChain" + SELECTED_CHAIN][superposition]["ProteinPosition"];
            lastSuperposition = superposition;
        }
        refProteinContent = DATA["SuperpositionChain" + SELECTED_CHAIN][superposition]["ProteinContent"];
        if (refProteinContent !== "None" && proteinPosition !== -1) {
            refProteinContent = CONTENT_ENCODING[refProteinContent];
            if (refProteinContent > 28) {
                VARC_REF_PROTEIN_CONTENT["AA_CLUSTER_OTHER"].push([c, 1, refProteinContent]);
            } else if (refProteinContent > 18) {
                VARC_REF_PROTEIN_CONTENT["AA_CLUSTER_UNPOLAR"].push([c, 1, refProteinContent]);
            } else if (refProteinContent > 8) {
                VARC_REF_PROTEIN_CONTENT["AA_CLUSTER_POLAR"].push([c, 1, refProteinContent]);
            }
            VARC_REF_PROTEIN_SS.push(
                [c, 0, CONTENT_ENCODING[PROTEIN_RESIDUES[SELECTED_CHAIN][proteinPosition]["ss"]]]
            );
            VARC_REF_PROTEIN_HYDROP.push(
                [c, 0, PROTEIN_RESIDUES[SELECTED_CHAIN][proteinPosition]["scKDH"]]
            );
            VARC_REF_PROTEIN_VARIABILITY.push(
                [c, 1, PROTEIN_RESIDUES[SELECTED_CHAIN][proteinPosition]["variability"]]
            );
        }
        refTransNucContent = DATA["SuperpositionChain" + SELECTED_CHAIN][superposition]["ReferenceFeatureTranslatedContent"];
        if (refTransNucContent !== "None") {
            refTransNucContent = CONTENT_ENCODING[refTransNucContent];
            if (refTransNucContent > 28) {
                VARC_REF_TRANSLATED_FEATURE_CONTENT["AA_CLUSTER_OTHER"].push([c, 2, refTransNucContent]);
            } else if (refTransNucContent > 18) {
                VARC_REF_TRANSLATED_FEATURE_CONTENT["AA_CLUSTER_UNPOLAR"].push([c, 2, refTransNucContent]);
            } else if (refTransNucContent > 8) {
                VARC_REF_TRANSLATED_FEATURE_CONTENT["AA_CLUSTER_POLAR"].push([c, 2, refTransNucContent]);
            }
        }
        let hasUnambiguousVariant = false;
        let labelIndex = 0;

        for (let label of VARC_VARIANTS_LABELS) {
            variantContent = DATA["SuperpositionChain" + SELECTED_CHAIN][superposition]["PerProteoformAminoAcidContent"][VARC_PROTEOFORM_ACCESSOR_MAP[label]];
            labelIndex = VARC_VARIANTS_LABELS.indexOf(label);
            if (CONTENT_ENCODING[variantContent] !== refTransNucContent) {
                if (variantContent == variantContent.toUpperCase()) {
                    // CASE: Unambiguous variant.
                    variantContent = CONTENT_ENCODING[variantContent];
                    if (variantContent > 28) {
                        VARC_VARIANTS_CONTENT["AA_CLUSTER_OTHER"].push([c, labelIndex, variantContent]);
                    } else if (variantContent > 18) {
                        VARC_VARIANTS_CONTENT["AA_CLUSTER_UNPOLAR"].push([c, labelIndex, variantContent]);
                    } else if (variantContent > 8) {
                        VARC_VARIANTS_CONTENT["AA_CLUSTER_POLAR"].push([c, labelIndex, variantContent]);
                    }
                    hasUnambiguousVariant = true;
                    variantPositionsIndicatorData.add(c);
                } else {
                    // CASE: Ambiguous variant.
                    if (VARC_AMBIGUITY_MODE === 'SHOW' || VARC_AMBIGUITY_MODE === 'MASK') {
                        variantContent = CONTENT_ENCODING[variantContent.toUpperCase()];
                        if (variantContent > 28) {
                            VARC_VARIANTS_CONTENT_AMBIGUOUS["AA_CLUSTER_OTHER"].push([c, labelIndex, variantContent]);
                        } else if (variantContent > 18) {
                            VARC_VARIANTS_CONTENT_AMBIGUOUS["AA_CLUSTER_UNPOLAR"].push([c, labelIndex, variantContent]);
                        } else if (variantContent > 8) {
                            VARC_VARIANTS_CONTENT_AMBIGUOUS["AA_CLUSTER_POLAR"].push([c, labelIndex, variantContent]);
                        }
                    }
                    if (VARC_AMBIGUITY_MODE === 'SHOW') {
                        variantPositionsIndicatorData.add(c);
                    }
                }
            }
        }
        superpositions.push(superposition);
        c += 1;
    }

    // Edit variant entry labels to display sample counts.
    if (VARC_AGGREGATION_MODE !== 'SAMPLE') {
        let noSamples;
        switch (VARC_AGGREGATION_MODE) {
            case 'GENOTYPE':
                variantYAxisName = "Genotypes";
                let perGenotypeNoSamples = new Object();
                // Compute number of samples per proteoform.
                for (let genotype of Object.keys(DATA["SuperpositionChain" + SELECTED_CHAIN]["Genotypes"])) {
                    perGenotypeNoSamples[genotype] = 0;
                    for (let sample of Object.values(DATA["SuperpositionChain" + SELECTED_CHAIN]["Genotypes"][genotype]["Samples"])) {
                        perGenotypeNoSamples[genotype] += 1;
                    }
                }
                for (let label of VARC_VARIANTS_LABELS) {
                    noSamples = perGenotypeNoSamples[label];
                    variantsEditedLabels.push((VARC_VARIANTS_LABELS.indexOf(label) + 1).toString() + " (" + noSamples + (noSamples == 1 ? " Sample)" : " Samples)"));
                }
                break;
            case 'PROTEOFORM':
                variantYAxisName = "Proteoforms";
                let perProteoformNoSamples = new Object();
                // Compute number of samples per proteoform.
                for (let proteoform of Object.keys(DATA["SuperpositionChain" + SELECTED_CHAIN]["Proteoforms"])) {
                    perProteoformNoSamples[proteoform] = 0;
                    for (let genotype of Object.values(DATA["SuperpositionChain" + SELECTED_CHAIN]["Proteoforms"][proteoform]["Genotypes"])) {
                        for (let sample of Object.values(DATA["SuperpositionChain" + SELECTED_CHAIN]["Genotypes"][genotype]["Samples"])) {
                            perProteoformNoSamples[proteoform] += 1;
                        }
                    }
                }
                for (let label of VARC_VARIANTS_LABELS) {
                    noSamples = perProteoformNoSamples[label];
                    variantsEditedLabels.push((VARC_VARIANTS_LABELS.indexOf(label) + 1).toString() + " (" + noSamples + (noSamples == 1 ? " Sample)" : " Samples)"));
                }
                break;
        }
    } else {
        variantsEditedLabels = VARC_VARIANTS_LABELS;
    }
    referenceNumericalDataLabels = ["Hydropathicity", "Variability"];
    referenceCategoricalDataLabels = ["Secondary Structure", DATA["ReferenceProteinName"] + " (Seq.)", DATA["ReferenceFeatureName"] + " (Transl. Seq.)"];
    // Add buttons to select chains
    for (let chainIdentifier of CHAIN_IDENTIFIERS) {
        let existingBtn = document.getElementById("menuVARCChainSelect" + chainIdentifier + "Btn");
        if (existingBtn == null) {
            let btn = document.createElement("button");
            btn.innerHTML = "Chain " + chainIdentifier;
            btn.id = "menuVARCChainSelect" + chainIdentifier + "Btn";
            if (chainIdentifier == SELECTED_CHAIN) {
                btn.classList.add("menuBtnActive");
            }
            btn.onclick = () => { VARCSelectChain(chainIdentifier); };
            document.getElementById("menuVARCChainSelectContent").appendChild(btn);
        }
    }
    // Compute Kolmogorov-Smirnov test p-value for significance of variant distances deviation from uniform distances. 
    variantPositionsIndicatorData = Array.from(variantPositionsIndicatorData);
    var ksTestResults = VARCComputeKSPValue(lastSuperposition, variantPositionsIndicatorData.map(x => x + 1));
    variantPositionsIndicatorData = variantPositionsIndicatorData.map(x => [x, 0, 1]);
    VARC_ECHART_OPTION = {
        animation: false,
        title: [
            {
                text: 'Reference Information',
                textStyle: {
                    fontSize: 11
                },
                left: 'center',
                top: '0'
            },
            {
                text: 'Variants Information',
                textStyle: {
                    fontSize: 11
                },
                left: 'center',
                top: (7 + (referenceNumericalsCount * 4) + (referenceCategoricalsCount * 4)).toString() + '%',
            },
            {
                text: 'Color Scheme',
                textStyle: {
                    fontSize: 11
                },
                right: '70px',
                top: '0',
            },
            {
                text: 'Variability',
                textStyle: {
                    fontSize: 9
                },
                right: '70px',
                top: '255px',
            },
            {
                text: 'Hydropathicity',
                textStyle: {
                    fontSize: 9
                },
                right: '60px',
                top: '305px',
            }
        ],
        grid: [
            {   // Grid to display numerical reference information.
                top: '5%',
                bottom: (95 - (referenceNumericalsCount * 4)).toString() + '%',
                left: '9%',
                right: '230px',
                show: true
            },
            {   // Grid to display categorical reference information.
                top: (5 + (referenceNumericalsCount * 4)).toString() + '%',
                bottom: (95 - (referenceNumericalsCount * 4) - (referenceCategoricalsCount * 4)).toString() + '%',
                left: '9%',
                right: '230px',
                show: true
            },
            {   // Grid to display variants information.
                top: (12 + (referenceNumericalsCount * 4) + (referenceCategoricalsCount * 4)).toString() + '%',
                bottom: '19%',
                left: '9%',
                right: '230px',
                show: true
            },
            {   // Grid to display position zoom and summary information.
                top: '93.5%',
                bottom: '20px',
                left: '9%',
                right: '230px',
                show: true
            }
        ],
        xAxis: [
            {   // X axis to display numerical reference information.
                type: 'category',
                data: superpositions,
                splitLine: {
                    show: true,
                    interval: 0
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    show: false
                },
                axisLine: {
                    show: false
                },
                show: true,
                gridIndex: 0
            },
            {   // X axis to display categorical reference information.
                type: 'category',
                data: superpositions,
                splitLine: {
                    show: true,
                    interval: 0
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    show: false
                },
                axisLine: {
                    show: false
                },
                show: true,
                gridIndex: 1
            },
            {   // Primary X axis to display variants information.
                type: 'category',
                data: superpositions,
                name: 'Superimposed Protein Position',
                nameLocation: 'middle',
                nameTextStyle: {
                    fontSize: 11,
                    fontWeight: 'bold'
                },
                axisLabel: {
                    fontSize: 10
                },
                nameGap: 25,
                offset: 0,
                splitLine: {
                    show: true,
                    interval: 0
                },
                show: true,
                gridIndex: 2
            },
            {   // Secondary X axis to display position zoom and summary information (not affected by data zoom).
                type: 'category',
                data: superpositions,
                axisLabel: {
                    fontSize: 10
                },
                position: 'bottom',
                show: true,
                gridIndex: 3
            }
        ],
        yAxis: [
            {   // Y axis to display numerical reference information.
                type: 'category',
                data: referenceNumericalDataLabels,
                splitArea: {
                    show: false
                },
                axisTick: {
                    alignWithLabel: true
                },
                axisLabel: {
                    fontSize: 10,
                    align: 'right'
                },
                gridIndex: 0
            },
            {   // Y axis to display categorical reference information.
                type: 'category',
                data: referenceCategoricalDataLabels,
                splitArea: {
                    show: false
                },
                axisTick: {
                    alignWithLabel: true
                },
                axisLabel: {
                    fontSize: 10,
                    align: 'right'
                },
                gridIndex: 1,
                inverse: true
            },
            {   // Y axis to display variants information.
                type: 'category',
                data: variantsEditedLabels,
                name: variantYAxisName,
                nameLocation: 'middle',
                nameTextStyle: {
                    fontSize: 11,
                    fontWeight: 'bold'
                },
                nameGap: 110,
                splitArea: {
                    show: false
                },
                axisTick: {
                    alignWithLabel: true
                },
                axisLabel: {
                    fontSize: 10,
                    align: 'right'
                },
                gridIndex: 2,
                inverse: true
            },
            {   // Hidden Y axis to display position zoom and summary information.
                type: 'category',
                data: ["Variant"],
                show: false,
                gridIndex: 3,
                inverse: true
            }
        ],
        legend: { // Disable default legend.
            show: false
        },
        dataZoom: [
            {   // Data zoom to zoom into position intervals.
                id: "positionZoom",
                type: 'slider',
                xAxisIndex: [0, 1, 2],
                realtime: false,
                throttle: 100,
                height: "8px",
                bottom: "21px",
                id: "positionZoom",
                showDataShadow: 'auto',
                backgroundColor: "transparent",
                fillerColor: "#60719645",
                borderColor: "#E4E5ED",
                handleStyle: {
                    borderColor: "#607196",
                    borderWidth: 3
                },
                moveHandleSize: 0,
                brushStyle: {
                    color: '#60719685',
                    borderCap: 'round',
                    opacity: 1
                }
            },
            {   // Data zoom to zoom into single samples.
                type: 'slider',
                yAxisIndex: [2],
                realtime: false,
                throttle: 5,
                width: "6px",
                left: '0',
                labelFormatter: "",
                backgroundColor: "transparent",
                fillerColor: "#60719645",
                borderColor: "#E4E5ED",
                handleStyle: {
                    borderColor: "#607196",
                    borderWidth: 3
                },
                moveHandleSize: 0,
                brushStyle: {
                    color: '#60719685',
                    borderCap: 'round',
                    opacity: 1
                }
            }
        ],
        visualMap: [
            // Visual maps to color categorical heatmap components.
            { // Cluster one, polar amino acids.
                type: 'piecewise',
                pieces: [
                    // Amino Acids, Polar (positive), Basic
                    { min: 9, max: 9, color: "#27269A" },
                    { min: 10, max: 10, color: "#2F49B1" },
                    { min: 11, max: 11, color: "#3874C8" },
                    // Polar (negative), Acidic
                    { min: 12, max: 12, color: "#F75050" },
                    { min: 13, max: 13, color: "#FB6581" },
                    // Amino Acids, Polar (neutral)
                    { min: 14, max: 14, color: "#1EAB13" },
                    { min: 15, max: 15, color: "#38B42B" },
                    { min: 16, max: 16, color: "#51BC43" },
                    { min: 17, max: 17, color: "#6AC55B" },
                    // Amino Acids, Sulfur bridge forming
                    { min: 18, max: 18, color: "#DEC443" }
                ],
                seriesIndex: [3, 6, 9, 12],
                show: true,
                orient: 'vertical',
                align: 'right',
                top: '25px',
                right: '170px',
                itemHeight: 8,
                itemWidth: 10,
                itemSymbol: 'rect',
                textStyle: {
                    fontSize: 10
                },
                formatter: function (value) {
                    return CONTENT_DECODING[value];
                }
            },
            { // Cluster two, unpolar amino acids.
                type: 'piecewise',
                pieces: [
                    // Amino Acids, Aromatic
                    { min: 19, max: 19, color: "#5826ED" },
                    { min: 20, max: 20, color: "#653CEF" },
                    { min: 21, max: 21, color: "#7352F1" },
                    // Amino Acids, Aliphatic
                    { min: 22, max: 22, color: "#239E90" },
                    { min: 23, max: 23, color: "#34A597" },
                    { min: 24, max: 24, color: "#45AD9E" },
                    { min: 25, max: 25, color: "#55B4A5" },
                    { min: 26, max: 26, color: "#66BCAC" },
                    { min: 27, max: 27, color: "#77C3B4" },
                    { min: 28, max: 28, color: "#88CABC" }
                ],
                seriesIndex: [4, 7, 10, 13],
                show: true,
                orient: 'vertical',
                align: 'right',
                top: '25px',
                right: '120px',
                itemHeight: 8,
                itemWidth: 10,
                itemSymbol: 'rect',
                textStyle: {
                    fontSize: 10
                },
                formatter: function (value) {
                    return CONTENT_DECODING[value];
                }
            },
            { // Cluster three, other amino acids.
                type: 'piecewise',
                pieces: [
                    // Amino Acids, Other
                    { min: 29, max: 29, color: "#E61090" },
                    { min: 30, max: 30, color: "#75551D" },
                    { min: 31, max: 31, color: "#75551D" },
                    { min: 32, max: 32, color: "#212121" }
                ],
                seriesIndex: [5, 8, 11, 14],
                show: true,
                orient: 'vertical',
                align: 'right',
                top: '25px',
                right: '20px',
                itemHeight: 8,
                itemWidth: 10,
                itemSymbol: 'rect',
                textStyle: {
                    fontSize: 10
                },
                formatter: function (value) {
                    let content = CONTENT_DECODING[value];
                    switch (content) {
                        case 'DEL':
                            return 'Deletion';
                        case 'INC':
                            return 'Incomplete';
                        case 'ANY':
                            return 'Any';
                        case 'TER':
                            return 'Termination';
                    }
                }
            },
            { // Secondary structures.
                type: 'piecewise',
                pieces: [
                    { min: 6, max: 6, color: COLORS[CONTENT_DECODING[6]] },
                    { min: 7, max: 7, color: COLORS[CONTENT_DECODING[7]] },
                    { min: 8, max: 8, color: COLORS[CONTENT_DECODING[8]] }
                ],
                seriesIndex: [2],
                show: true,
                orient: 'vertical',
                align: 'right',
                top: '125px',
                right: '20px',
                itemHeight: 8,
                itemWidth: 10,
                itemSymbol: 'rect',
                textStyle: {
                    fontSize: 10
                },
                formatter: function (value) {
                    let content = CONTENT_DECODING[value];
                    switch (content) {
                        case 'sheet':
                            return 'Sheet';
                        case 'helix':
                            return 'Helix';
                        case 'coil':
                            return 'Coil';
                    }
                }
            },
            { // Variant position indicator.
                type: 'piecewise',
                pieces: [
                    { min: 1, max: 1, color: '#607196' }
                ],
                seriesIndex: [15],
                show: false
            },
            {   // Visual map for numerical variability series.
                min: 0 - Math.pow(10, -6),
                max: 1,
                range: [0, 1],
                calculable: false,
                inRange: {
                    color: VARIABILITY_COLOR_LIST
                },
                outOfRange: {
                    color: [
                        '#EFF0F8'
                    ]
                },
                seriesIndex: [0],
                show: true,
                orient: 'horizontal',
                align: 'right',
                top: '270px',
                right: '25px',
                precision: 2,
                textStyle: {
                    fontSize: 10
                }
            },
            {   // Visual map for numerical hydropathicity series.
                min: HYDROPATHICITY_MIN_VAL - Math.pow(10, -6),
                max: HYDROPATHICITY_MAX_VAL,
                range: [HYDROPATHICITY_MIN_VAL, HYDROPATHICITY_MAX_VAL],
                calculable: false,
                inRange: {
                    color: [
                        '#45a7e6',
                        '#e6e6e6',
                        '#b87737'
                    ]
                },
                outOfRange: {
                    color: [
                        '#EFF0F8'
                    ]
                },
                seriesIndex: [1],
                show: true,
                orient: 'horizontal',
                align: 'right',
                top: '320px',
                right: '25px',
                precision: 2,
                textStyle: {
                    fontSize: 10
                }
            }
        ],
        series: [
            {
                name: 'RefVariability',
                type: 'heatmap',
                progressive: 500,
                progressiveThreshold: 1000,
                data: VARC_REF_PROTEIN_VARIABILITY,
                xAxisIndex: 0,
                yAxisIndex: 0,
                itemStyle: {
                    borderColor: "#fafafc",
                    borderWidth: 0.1
                }
            },
            {
                name: 'RefHydropathicity',
                type: 'heatmap',
                progressive: 500,
                progressiveThreshold: 1000,
                data: VARC_REF_PROTEIN_HYDROP,
                xAxisIndex: 0,
                yAxisIndex: 0,
                itemStyle: {
                    borderColor: "#fafafc",
                    borderWidth: 0.1
                }
            },
            {
                name: 'RefSecStruc',
                type: 'heatmap',
                progressive: 500,
                progressiveThreshold: 1000,
                data: VARC_REF_PROTEIN_SS,
                xAxisIndex: 1,
                yAxisIndex: 1,
                itemStyle: {
                    borderColor: "#fafafc",
                    borderWidth: 0.1
                }
            },
            {
                name: 'RefProteinCont_Polar',
                type: 'heatmap',
                progressive: 500,
                progressiveThreshold: 1000,
                data: VARC_REF_PROTEIN_CONTENT["AA_CLUSTER_POLAR"],
                xAxisIndex: 1,
                yAxisIndex: 1,
                itemStyle: {
                    borderColor: "#fafafc",
                    borderWidth: 0.1
                }
            },
            {
                name: 'RefProteinCont_Unpolar',
                type: 'heatmap',
                progressive: 500,
                progressiveThreshold: 1000,
                data: VARC_REF_PROTEIN_CONTENT["AA_CLUSTER_UNPOLAR"],
                xAxisIndex: 1,
                yAxisIndex: 1,
                itemStyle: {
                    borderColor: "#fafafc",
                    borderWidth: 0.1
                }
            },
            {
                name: 'RefProteinCont_Other',
                type: 'heatmap',
                progressive: 500,
                progressiveThreshold: 1000,
                data: VARC_REF_PROTEIN_CONTENT["AA_CLUSTER_OTHER"],
                xAxisIndex: 1,
                yAxisIndex: 1,
                itemStyle: {
                    borderColor: "#fafafc",
                    borderWidth: 0.1
                }
            },
            {
                name: 'RefTransFeatureCont_Polar',
                type: 'heatmap',
                progressive: 500,
                progressiveThreshold: 1000,
                data: VARC_REF_TRANSLATED_FEATURE_CONTENT["AA_CLUSTER_POLAR"],
                xAxisIndex: 1,
                yAxisIndex: 1,
                itemStyle: {
                    borderColor: "#fafafc",
                    borderWidth: 0.1
                }
            },
            {
                name: 'RefTransFeatureCont_Unpolar',
                type: 'heatmap',
                progressive: 500,
                progressiveThreshold: 1000,
                data: VARC_REF_TRANSLATED_FEATURE_CONTENT["AA_CLUSTER_UNPOLAR"],
                xAxisIndex: 1,
                yAxisIndex: 1,
                itemStyle: {
                    borderColor: "#fafafc",
                    borderWidth: 0.1
                }
            },
            {
                name: 'RefTransFeatureCont_Other',
                type: 'heatmap',
                progressive: 500,
                progressiveThreshold: 1000,
                data: VARC_REF_TRANSLATED_FEATURE_CONTENT["AA_CLUSTER_OTHER"],
                xAxisIndex: 1,
                yAxisIndex: 1,
                itemStyle: {
                    borderColor: "#fafafc",
                    borderWidth: 0.1
                }
            },
            {
                name: 'VariantsUnamb_Polar',
                type: 'heatmap',
                progressive: 500,
                progressiveThreshold: 1000,
                data: VARC_VARIANTS_CONTENT["AA_CLUSTER_POLAR"],
                xAxisIndex: 2,
                yAxisIndex: 2,
                itemStyle: {
                    borderColor: "#fafafc",
                    borderWidth: 0.1
                }
            },
            {
                name: 'VariantsUnamb_Unpolar',
                type: 'heatmap',
                progressive: 500,
                progressiveThreshold: 1000,
                data: VARC_VARIANTS_CONTENT["AA_CLUSTER_UNPOLAR"],
                xAxisIndex: 2,
                yAxisIndex: 2,
                itemStyle: {
                    borderColor: "#fafafc",
                    borderWidth: 0.1
                }
            },
            {
                name: 'VariantsUnamb_Other',
                type: 'heatmap',
                progressive: 500,
                progressiveThreshold: 1000,
                data: VARC_VARIANTS_CONTENT["AA_CLUSTER_OTHER"],
                xAxisIndex: 2,
                yAxisIndex: 2,
                itemStyle: {
                    borderColor: "#fafafc",
                    borderWidth: 0.1
                }
            },
            {
                name: 'VariantsAmb_Polar',
                type: 'heatmap',
                data: VARC_AMBIGUITY_MODE !== 'HIDE' ? VARC_VARIANTS_CONTENT_AMBIGUOUS["AA_CLUSTER_POLAR"] : [],
                xAxisIndex: 2,
                yAxisIndex: 2,
                itemStyle: {
                    borderColor: "#fafafc",
                    borderWidth: 0.1,
                    opacity: VARC_AMBIGUITY_MODE !== 'MASK' ? 1.0 : 0.2
                }
            },
            {
                name: 'VariantsAmb_Unpolar',
                type: 'heatmap',
                data: VARC_AMBIGUITY_MODE !== 'HIDE' ? VARC_VARIANTS_CONTENT_AMBIGUOUS["AA_CLUSTER_UNPOLAR"] : [],
                xAxisIndex: 2,
                yAxisIndex: 2,
                itemStyle: {
                    borderColor: "#fafafc",
                    borderWidth: 0.1,
                    opacity: VARC_AMBIGUITY_MODE !== 'MASK' ? 1.0 : 0.2
                }
            },
            {
                name: 'VariantsAmb_Other',
                type: 'heatmap',
                data: VARC_AMBIGUITY_MODE !== 'HIDE' ? VARC_VARIANTS_CONTENT_AMBIGUOUS["AA_CLUSTER_OTHER"] : [],
                xAxisIndex: 2,
                yAxisIndex: 2,
                itemStyle: {
                    borderColor: "#fafafc",
                    borderWidth: 0.1,
                    opacity: VARC_AMBIGUITY_MODE !== 'MASK' ? 1.0 : 0.2
                }
            },
            {
                name: 'PositionIndicator',
                type: 'heatmap',
                progressive: 500,
                progressiveThreshold: 1000,
                data: variantPositionsIndicatorData,
                xAxisIndex: 3,
                yAxisIndex: 3,
                itemStyle: {
                    borderColor: "#fafafc",
                    borderWidth: 0.1
                }
            },
            {
                name: 'PositionLine',
                type: 'line',
                data: [],
                xAxisIndex: 2,
                yAxisIndex: 2
            }
        ],
        toolbox: {
            show: true,
            right: '1%',
            bottom: '1%',
            feature: {
                myTool1: {
                    show: true,
                    icon: 'path://M512,460.77A12.81,12.81,0,0,1,506.88,471l-51.2,38.42a12.8,12.8,0,0,1-15.36-20.49l20.48-15.37H51.2a12.8,12.8,0,0,1-12.8-12.81V50.94L23,71.43A12.8,12.8,0,1,1,2.56,56.06L41,4.83c4.82-6.44,15.65-6.44,20.47,0l38.4,51.23A12.8,12.8,0,1,1,79.36,71.43L64,50.94V448H460.8l-20.48-15.37a12.8,12.8,0,0,1,15.36-20.49l51.2,38.42A12.81,12.81,0,0,1,512,460.77ZM140.8,358.31a38.38,38.38,0,0,0,35.66-52.62l47.94-42a38.3,38.3,0,0,0,40.09-1.5L309,295.59a38.41,38.41,0,1,0,68.29-10.26L437.06,203A38.44,38.44,0,1,0,416.36,188l-59.83,82.31a38.26,38.26,0,0,0-32.22,4.84l-44.47-33.37a38.41,38.41,0,1,0-72.31,2.71l-47.94,42a38.41,38.41,0,1,0-18.8,71.9Z',
                    title: 'Kolmogorov-Smirnov\nTest',
                    onclick: function () {
                        Swal.fire({
                            icon: 'info',
                            title: '<strong>Kolmogorov-Smirnov Test Results</strong>',
                            html: "<p style='text-align: left;'><i>p</i>-value: " + ksTestResults.p + "</p>" +
                                "<p style='text-align: left;'>Test-value: " + ksTestResults.d + "</p>" +
                                "<p style='text-align: left;'>Theoretical uniform distance: " + ksTestResults.uniformDistance + "</p>" +
                                "<b style='text-align: center;'>Observed Distances</b><div id='observedDistancesCanvas'></div>",
                            background: '#EFF0F8',
                            confirmButtonText: 'Ok',
                            confirmButtonColor: '#607196'
                        });
                        var observedDistancesDom = document.getElementById('observedDistancesCanvas');
                        observedDistancesDom.style.height = "300px";
                        observedDistancesDom.style.width = "100%";
                        var observedDistancesEChart = echarts.init(observedDistancesDom, { "renderer": "canvas" });
                        let observedDistancesCounts = {};
                        for (const n of ksTestResults.observedDistances) {
                            observedDistancesCounts[n] = observedDistancesCounts[n] ? observedDistancesCounts[n] + 1 : 1;
                        }
                        observedDistancesEChart.setOption({
                            xAxis: {
                                type: 'category',
                                data: Object.keys(observedDistancesCounts),
                                name: 'Distance',
                                nameLocation: 'center',
                                nameGap: 30
                            },
                            yAxis: {
                                type: 'value',
                                name: 'Occurrences',
                                nameLocation: 'center',
                                nameGap: 30
                            },
                            series: [
                                {
                                    data: Object.values(observedDistancesCounts),
                                    type: 'bar',
                                    showBackground: true,
                                    backgroundStyle: {
                                        color: 'rgba(180, 180, 180, 0.2)'
                                    },
                                    color: 'hsla(0, 99%, 64%, 0.8)'
                                }
                            ]
                        });
                    }
                },
                saveAsImage: {
                    pixelRatio: 4,
                    title: 'Save\nImage'
                }
            }
        }
    };
    VARC_ECHART.on('datazoom', function (params) {
        if (params.dataZoomId == "positionZoom") {
            let maxMatchedPosition = superpositions.at(-1);
            let fromIndex = Math.floor((params.start / 100) * maxMatchedPosition);
            if (fromIndex === 0) {
                fromIndex = 1;
            }
            let from = DATA["SuperpositionChain" + SELECTED_CHAIN][fromIndex]["ProteinPosition"];
            let toIndex = Math.floor((params.end / 100) * maxMatchedPosition);
            let to = DATA["SuperpositionChain" + SELECTED_CHAIN][toIndex]["ProteinPosition"];
            while (from === -1 && fromIndex <= toIndex) {
                fromIndex += 1;
                from = DATA["SuperpositionChain" + SELECTED_CHAIN][fromIndex]["ProteinPosition"];
            }
            while (to === -1 && toIndex >= fromIndex) {
                toIndex -= 1;
                to = DATA["SuperpositionChain" + SELECTED_CHAIN][toIndex]["ProteinPosition"];
            }
            STRC_HIGHLIGHTED_REGION = [];
            STRC_HIGHLIGHTED_REGION.push(from);
            STRC_HIGHLIGHTED_REGION.push(to);
            STRCApplyStyle();
        }
    });
    VARC_ECHART.on('click', function (params) {
        VARCMarkPosition(params.data[0]);
        STRCClearSelection();
        if (DATA["SuperpositionChain" + SELECTED_CHAIN][params.data[0] + 1]["ProteinContent"] !== "None") {
            let resi = parseInt(DATA["SuperpositionChain" + SELECTED_CHAIN][params.data[0] + 1]["ProteinPosition"]);
            let resn = DATA["SuperpositionChain" + SELECTED_CHAIN][params.data[0] + 1]["ProteinContent"];
            STRCSelectResidue(SELECTED_CHAIN, resi, resn, true, COLORS[resn], COLORS[resn], 0.6, 1);
        }
        COMCDisplay(params.data[0] + 1);
        INFCSetReferenceInformation(params.data[0] + 1);
        INFCSetVariantInformation(
            params.data[0] + 1,
            params.seriesName.startsWith("Variants") ? variantsEditedLabels[params.data[1]] : false,
            params.seriesName.startsWith("Variants") ? VARC_VARIANTS_LABELS[params.data[1]] : false,
            VARC_PROTEOFORM_ACCESSOR_MAP[VARC_VARIANTS_LABELS[params.data[1]]],
            VARC_GENOTYPE_ACCESSOR_MAP[VARC_VARIANTS_LABELS[params.data[1]]]
        );
        STRCDisplayContacts();
        STRCApplyStyle();
    });
    VARC_ECHART.setOption(VARC_ECHART_OPTION);
    STRC_HIGHLIGHTED_REGION.push(1);
    STRC_HIGHLIGHTED_REGION.push(superpositions.at(-1));
    STRCApplyStyle();
}

/**
 * Sets the mode of displaying ambiguous positions.
 * 
 * @param {string} mode Either MASK or SHOW; specifies the display mode of ambiguous positions.
 */
function VARCSetAmbiguityMode(mode) {
    if (VARC_AMBIGUITY_MODE !== mode) {
        VARC_AMBIGUITY_MODE = mode;
        document.getElementById("menuVARCAmbiguityModeSelectMaskBtn").classList.remove("menuBtnActive");
        document.getElementById("menuVARCAmbiguityModeSelectShowBtn").classList.remove("menuBtnActive");
        // document.getElementById( "menuVARCAmbiguityModeSelectHideBtn" ).classList.remove( "menuBtnActive" );
        switch (mode) {
            case "MASK":
                document.getElementById("menuVARCAmbiguityModeSelectMaskBtn").classList.add("menuBtnActive");
                break;
            case "SHOW":
                document.getElementById("menuVARCAmbiguityModeSelectShowBtn").classList.add("menuBtnActive");
                break;
            // case "HIDE":
            //    document.getElementById("menuVARCAmbiguityModeSelectHideBtn").classList.add("menuBtnActive");
            //    break;
        }
        STRCcomputeVariability();
        initVARC();
        COMCDisplay( COMC_DISPLAYED_POSITION );
    }
}

/**
 * Sets the mode of displaying samples, i.e. either merged by genotype or proteoform or all samples are displayed.
 * 
 * @param {string} mode One of SAMPLE, GENOTYPE or PROTEOFORM; specifies the display mode of samples.
 */
function VARCSetAggregationMode(mode) {
    if (VARC_AGGREGATION_MODE !== mode) {
        VARC_AGGREGATION_MODE = mode;
        document.getElementById("menuVARCAggregationModeSelectSampleBtn").classList.remove("menuBtnActive");
        document.getElementById("menuVARCAggregationModeSelectGenotypeBtn").classList.remove("menuBtnActive");
        document.getElementById("menuVARCAggregationModeSelectProteoformBtn").classList.remove("menuBtnActive");
        switch (mode) {
            case "SAMPLE":
                document.getElementById("menuVARCAggregationModeSelectSampleBtn").classList.add("menuBtnActive");
                break;
            case "GENOTYPE":
                document.getElementById("menuVARCAggregationModeSelectGenotypeBtn").classList.add("menuBtnActive");
                break;
            case "PROTEOFORM":
                document.getElementById("menuVARCAggregationModeSelectProteoformBtn").classList.add("menuBtnActive");
                break;
        }
        initVARC();
    }
}

/**
 * Selects the specified chain as active chain.
 * 
 * @param {String} chainIdentifier 
 */
function VARCSelectChain(chainIdentifier) {
    if (chainIdentifier != SELECTED_CHAIN && IS_LOADED) {
        SELECTED_CHAIN = chainIdentifier;
        initVARC();
        VARC_ECHART.dispatchAction(
            {
                type: 'dataZoom',
                dataZoomIndex: 0,
                start: 0,
                end: 100
            }
        );
    }
    for (let cId of CHAIN_IDENTIFIERS) {
        let btn = document.getElementById("menuVARCChainSelect" + cId + "Btn");
        if (cId == SELECTED_CHAIN) {
            btn.classList.add("menuBtnActive");
        } else {
            btn.classList.remove("menuBtnActive");
        }
    }
}

/**
 * Marks a position on the variants view with a dashed line.
 * 
 * @param {Integer} position The position to mark.
 */
function VARCMarkPosition(position) {
    let d = []
    for (let label of VARC_VARIANTS_LABELS) {
        d.push([position, VARC_VARIANTS_LABELS.indexOf(label)]);
    }
    VARC_ECHART.setOption({
        series: [
            {
                name: 'PositionLine',
                type: 'line',
                data: d,
                xAxisIndex: 2,
                yAxisIndex: 2,
                symbol: 'none',
                lineStyle: {
                    type: 'dashed',
                    color: COLORS.DEL,
                    width: 0.8,
                    opacity: 0.8
                }
            }
        ]
    });
}

/**
 * Conduct Kolmogorov-Smirnov test.
 * 
 * The test compares the sample of observed variable position distances with a sample of the same size yielding
 * the theoretically expected distance when all variable positions would have uniform distance.
 * 
 * @param {integer} length The length of the reference, i.e. the number of superpositions.
 * @param {list} variantPositions The observed variable positions.
 * @returns JSON object yielding the p-value, d-value (test statistic), observed distances and uniform distance of the conducted test.
 */
function VARCComputeKSPValue(length, variantPositions) {
    let dUniform = Math.floor(length / (variantPositions.length + 1));
    let DObserved = [];
    let DTheoretical = [];
    for (let i = 1; i < variantPositions.length; i++) {
        let dObserved = variantPositions[i] - (variantPositions[i - 1] + 1);
        DObserved.push(dObserved);
        DTheoretical.push(dUniform);
    }
    DObserved.sort();
    DTheoretical.sort();
    var x = new jerzy.Vector(DObserved);
    var y = new jerzy.Vector(DTheoretical);
    var ksTestResults = new jerzy.Nonparametric.kolmogorovSmirnov(x, y)
    return {
        "p": Number.parseFloat(ksTestResults.p).toExponential(2),
        "d": Number.parseFloat(ksTestResults.d).toExponential(2),
        "uniformDistance": Number.parseFloat(dUniform),
        "observedDistances": DObserved
    };
}

/**
 * Loads information about the specified position into the composition view.
 * 
 * @param {integer} position The position which composition should be displayed. 
 */
function COMCDisplay(position) {
    if ( position == -1 ) {
        // Skip construction if no position was selected yet.
        return;
    }
    closeElement("compositionViewContentDummy");
    COMC_DISPLAYED_POSITION = position;
    var sunburstData = new Object();
    var referenceAminoAcidContent = DATA["SuperpositionChain" + SELECTED_CHAIN][position]["ReferenceFeatureTranslatedContent"].toUpperCase();
    var referenceNucleotideContent = DATA["SuperpositionChain" + SELECTED_CHAIN][position]["ReferenceFeatureContent"];
    //var totalSamples = 0;
    //var nonReferenceSamples = 0;
    for (var [proteoform, aminoAcidContent] of Object.entries(DATA["SuperpositionChain" + SELECTED_CHAIN][position]["PerProteoformAminoAcidContent"])) {
        if ( VARC_AMBIGUITY_MODE !== "SHOW" && (aminoAcidContent === aminoAcidContent.toLowerCase()) ) {
            continue;
        } else {
            aminoAcidContent = aminoAcidContent.toUpperCase();
        }
        if (!(aminoAcidContent in sunburstData)) {
            sunburstData[aminoAcidContent] = {
                "Proteoforms": [],
                "NucleotideContents": {}
            };
        };
        sunburstData[aminoAcidContent]["Proteoforms"].push(proteoform);
        for (let genotype of Object.values(DATA["SuperpositionChain" + SELECTED_CHAIN]["Proteoforms"][proteoform]["Genotypes"])) {
            let nucleotideContent = DATA["SuperpositionChain" + SELECTED_CHAIN][position]["PerGenotypeNucleotideContent"][genotype];
            if (!(nucleotideContent in sunburstData[aminoAcidContent]["NucleotideContents"])) {
                sunburstData[aminoAcidContent]["NucleotideContents"][nucleotideContent] = {
                    "Genotypes": [],
                    "Samples": []
                };
            };
            sunburstData[aminoAcidContent]["NucleotideContents"][nucleotideContent]["Genotypes"].push(genotype);
            for (let sample of Object.values(DATA["SuperpositionChain" + SELECTED_CHAIN]["Genotypes"][genotype]["Samples"])) {
                sunburstData[aminoAcidContent]["NucleotideContents"][nucleotideContent]["Samples"].push(sample);
                //totalSamples += 1;
            }
        }
    }
    var sunburstComponents = [];
    for (var [aminoAcidContent, obj] of Object.entries(sunburstData)) {
        if ( ! COMC_SHOW_REFERENCE && aminoAcidContent.toUpperCase( ) === referenceAminoAcidContent ) {
            continue;
        }
        let nucleotideContentObjects = [];
        for (var [nucleotideContent, obj] of Object.entries(sunburstData[aminoAcidContent]["NucleotideContents"])) {
            let sampleContentObjects = [];
            for (var sample of sunburstData[aminoAcidContent]["NucleotideContents"][nucleotideContent]["Samples"]) {
                sampleContentObjects.push({
                    name: sample,
                    value: 1,
                    itemStyle: {
                        color: '#cbd0e0'
                    }
                });
            }
            nucleotideContentObjects.push({
                name: (nucleotideContent === referenceNucleotideContent) ? nucleotideContent + "\nReference" : nucleotideContent,
                itemStyle: {
                    color: '#607196'
                },
                children: sampleContentObjects
            });
        }
        sunburstComponents.push({
            name: (aminoAcidContent === referenceAminoAcidContent) ? aminoAcidContent + "\nReference" : aminoAcidContent,
            itemStyle: {
                color: COLORS[aminoAcidContent]
            },
            children: nucleotideContentObjects
        });
    }
    // Generate and set ECharts option object.
    COMC_ECHART_OPTION = {
        title: [
            {
                text: 'Amino Acid and Nucleotide Composition\nPosition ' + position,
                textStyle: {
                    fontSize: 12
                },
                left: 'center',
                top: '4px'
            }
        ],
        series: [
            {
                type: 'sunburst',
                center: [
                    "50%",
                    "55%"
                ],
                radius: [0, '20%'],
                data: sunburstComponents,
                emphasis: {
                    focus: 'ancestor'
                },
                levels: [
                    {
                        r0: '0%',
                        r: '20%'
                    },
                    {
                        r0: '20%',
                        r: '40%',
                        itemStyle: {
                            borderWidth: 2
                        },
                        label: {
                            rotate: 'tangential',
                            fontSize: 10
                        }
                    },
                    {
                        r0: '40%',
                        r: '60%',
                        label: {
                            rotate: 'tangential',
                            fontSize: 9
                        }
                    },
                    {
                        r0: '60%',
                        r: '63%',
                        label: {
                            position: 'outside',
                            padding: 2,
                            silent: false,
                            fontSize: 8
                        },
                        itemStyle: {
                            borderWidth: 3
                        }
                    }
                ],
                itemStyle: {
                    color: '#607196'
                }
            }
        ]
    };
    COMC_ECHART.setOption(COMC_ECHART_OPTION);
}

/**
 * Toggles the option to display reference information in the composition view component.
 */
 function COMCToggleDisplayReference() {
    let COMCDisplayReferenceBtn = document.getElementById("menuCOMCDisplayReferenceBtn");
    if (COMC_SHOW_REFERENCE) {
        COMC_SHOW_REFERENCE = false;
        COMCDisplay( COMC_DISPLAYED_POSITION );
        COMCDisplayReferenceBtn.classList.remove("menuBtnActive");
    } else {
        COMC_SHOW_REFERENCE = true;
        COMCDisplay( COMC_DISPLAYED_POSITION );
        COMCDisplayReferenceBtn.classList.add("menuBtnActive");
    }
}

/**
 * Sets the contact information specified by the passed HTML string in the info component.
 * 
 * @param {string} htmlString HTML format string specifying the content to display. 
 */
function INFCSetContactInformation(htmlString) {
    closeElement("infoContentDummy");
    showElement("infoContent", "block");
    document.getElementById("infoContactContent").innerHTML = htmlString;
}

/**
 * Sets the reference information specified by the passed HTML string in the info component.
 * 
 * @param {string} htmlString HTML format string specifying the content to display. 
 */
function INFCSetReferenceInformation(position) {
    closeElement("infoContentDummy");
    showElement("infoContent", "block");
    let htmlString = "";
    let genomePositions = DATA["SuperpositionChain" + SELECTED_CHAIN][position]["ReferenceFeaturePositions"];
    let genomeContent = DATA["SuperpositionChain" + SELECTED_CHAIN][position]["ReferenceFeatureContent"];
    let translatedGenomeContent = DATA["SuperpositionChain" + SELECTED_CHAIN][position]["ReferenceFeatureTranslatedContent"];
    let translatedGenomeContentColor;
    let proteinPosition = DATA["SuperpositionChain" + SELECTED_CHAIN][position]["ProteinPosition"];
    let proteinContent = DATA["SuperpositionChain" + SELECTED_CHAIN][position]["ProteinContent"];
    let proteinContentColor;
    let proteinStruc;
    let proteinStrucColor;
    if (genomeContent === "None") {
        htmlString += "<br><b style='color: #cbd0e0'>No superposition with genome.</b><br>"
    } else {
        htmlString += "<br>&bull; Genome Positions: " + genomePositions.join(", ") + "<br>";
        htmlString += "<br>&bull; Genome Content: " + genomeContent + "<br>";
        if (translatedGenomeContent === "ANY") {
            translatedGenomeContent = "Any (codon contains N)<br>"
            translatedGenomeContentColor = COLORS.ANY;
        } else if (translatedGenomeContent === "TER") {
            translatedGenomeContent = "Termination<br>"
            translatedGenomeContentColor = COLORS.TER;
        } else {
            translatedGenomeContentColor = COLORS[translatedGenomeContent];
        }
        htmlString += "<br>&bull; Transl. Aminoacid: " + "<span style='color: " + translatedGenomeContentColor + "'>&#9724; </span> " + translatedGenomeContent + "<br>";
    }
    if (proteinPosition === -1) {
        htmlString += "<br><b style='color: #cbd0e0'>No superposition with protein structure.</b><br>"
    } else {
        htmlString += "<br>&bull; Protein Position: " + proteinPosition + "<br>";
        proteinContentColor = COLORS[proteinContent];
        htmlString += "<br>&bull; Protein Content: " + "<span style='color: " + proteinContentColor + "'>&#9724; </span> " + proteinContent + "<br>";
        proteinStruc = PROTEIN_RESIDUES[SELECTED_CHAIN][proteinPosition]["ss"];
        proteinStrucColor = COLORS[proteinStruc];
        htmlString += "<br>&bull; Protein 2ry Structure: " + "<span style='color: " + proteinStrucColor + "'>&#9724; </span> " + proteinStruc.charAt(0).toUpperCase() + proteinStruc.slice(1) + "<br>";
    }
    document.getElementById("infoReferenceContent").innerHTML = htmlString;
}

/**
 * Sets the varint/variable position information specified by the passed HTML string in the info component.
 * 
 * @param {string} htmlString HTML format string specifying the content to display. 
 */
function INFCSetVariantInformation(position, label, variantId, proteoformId, genotypeId) {
    closeElement("infoContentDummy");
    showElement("infoContent", "block");
    let htmlString = "";
    INFC_SUBSTITUTION = "None";
    if (variantId === false) {
        htmlString = "<br><b style='color: #cbd0e0'>No variants data selected.</b><br>";
        document.getElementById("infoVariantContent").innerHTML = htmlString;
    } else {
        let genomePositions;
        let genomeContent;
        let translatedGenomeContent;
        let translatedGenomeContentColor;
        switch (VARC_AGGREGATION_MODE) {
            case 'SAMPLE':
                document.getElementById("infoVariantHeader").innerHTML = "<hr><b>Sample Information</b>";
                htmlString += "<br>&bull; Name: " + label + "<br>";
                genomePositions = DATA["SuperpositionChain" + SELECTED_CHAIN][position]["PerGenotypePositions"][genotypeId];
                if (JSON.stringify(genomePositions) == JSON.stringify([-1, -1, -1])) {
                    genomePositions = ["None"];
                }
                genomeContent = DATA["SuperpositionChain" + SELECTED_CHAIN][position]["PerGenotypeNucleotideContent"][genotypeId];
                htmlString += "<br>&bull; Genome Positions: " + genomePositions.join(", ") + "<br>";
                htmlString += "<br>&bull; Genome Content: " + genomeContent + "<br>";
                break;
            case 'GENOTYPE':
                document.getElementById("infoVariantHeader").innerHTML = "<hr><b>Genotype Information</b>";
                htmlString += "<br>&bull; Name: Genotype " + label + "<br>";
                genomePositions = DATA["SuperpositionChain" + SELECTED_CHAIN][position]["PerGenotypePositions"][genotypeId];
                if (JSON.stringify(genomePositions) == JSON.stringify([-1, -1, -1])) {
                    genomePositions = ["None"];
                }
                genomeContent = DATA["SuperpositionChain" + SELECTED_CHAIN][position]["PerGenotypeNucleotideContent"][genotypeId];
                htmlString += "<br>&bull; Genome Positions: " + genomePositions.join(", ") + "<br>";
                htmlString += "<br>&bull; Genome Content: " + genomeContent + "<br>";
                break;
            case 'PROTEOFORM':
                document.getElementById("infoVariantHeader").innerHTML = "<hr><b>Proteoform Information</b>";
                htmlString += "<br>&bull; Name: Proteoform " + label + "<br>";
                break;
        }
        translatedGenomeContent = DATA["SuperpositionChain" + SELECTED_CHAIN][position]["PerProteoformAminoAcidContent"][proteoformId];
        if (translatedGenomeContent === translatedGenomeContent.toLowerCase()) {
            document.getElementById("infoVariantHeader").innerHTML += " <i style='color: #cbd0e0;' class='fas fa-exclamation-circle'></i>";
            translatedGenomeContent = translatedGenomeContent.toUpperCase();
        }
        translatedGenomeContentColor;
        if (translatedGenomeContent === "ANY") {
            translatedGenomeContent = "Any (codon contains N)<br>"
            translatedGenomeContentColor = COLORS.ANY;
        } else if (translatedGenomeContent === "TER") {
            translatedGenomeContent = "Termination<br>"
            translatedGenomeContentColor = COLORS.TER;
        } else if (translatedGenomeContent === "INC") {
            translatedGenomeContent = "Incomplete (frameshift)<br>"
            translatedGenomeContentColor = COLORS.INC;
        } else if (translatedGenomeContent === "DEL") {
            translatedGenomeContent = "Deletion<br>"
            translatedGenomeContentColor = COLORS.DEL;
        } else {
            translatedGenomeContentColor = COLORS[translatedGenomeContent];
            INFC_SUBSTITUTION = translatedGenomeContent;
        }
        htmlString += "<br>&bull; Variant Aminoacid: " + "<span style='color: " + translatedGenomeContentColor + "'>&#9724; </span> " + translatedGenomeContent + "<br>";
        //
        document.getElementById("infoVariantContent").innerHTML = htmlString;
    }
}

function displayImpressum() {
    Swal.fire({
        icon: 'info',
        title: '<strong>Impressum</strong>',
        html: `
        <div style="font-size: x-small; background: #E4E5ED; border-radius: 5px; padding: 5px; text-align: left;">
            <p><u>Used third-party libraries and content:</u></p>
            <div style="margin: 10px; height: 150px; font-size: xx-small; border-radius: 5px; padding: 5px; text-align: left; overflow-y: scroll; background: #EFF0F8;">
                <p>• The visualization of protein structures is based on <a href="https://3dmol.csb.pitt.edu/">3Dmol.js</a></p>
                <p>• All other visualization are based on <a href="https://echarts.apache.org/en/index.html">Apache ECharts</a></p>
                <p>• Popups are generated with <a href="https://sweetalert2.github.io/">sweetalert2</a></p>
                <p>• Statistics are computed with <a href="https://www.npmjs.com/package/jerzy/v/0.2.1?activeTab=readme">jerzy</a></p>
                <p>• Internal DOM object handling utilizes <a href="https://jquery.com/">jQuery</a> and <a href="https://www.npmjs.com/package/resize-sensor">resize-sensor</a></p>
                <p>• Icons are free-icons from <a href="https://fontawesome.com/">fontawesome</a> or <a href="https://dryicons.com/free-icons/statistic">Dryicons</a></p>
                <p>• Popups are generated with <a href="https://sweetalert2.github.io/">sweetalert2</a></p>
                <p>• The tool's logo uses the <a href="github.com/googlefonts/genos">Genos</a> font</p>
                <p>• The loading animation is realized with <a href="https://tobiasahlin.com/spinkit/">Spinkit</a></p>
            </div>
        </div>
        <hr>
        <div style="font-size: x-small; background: #E4E5ED; border-radius: 5px; padding: 5px; text-align: left;">
            <p><u>Information according to § 5 TMG:</u></p>
            <p>Simon, Hackl</p>
            <p>Sand 14</p>
            <p>72076 Tübingen</p>
            <p><u>Contact:</u></p>
            <p>E-Mail: simon.hackl@uni-tuebingen.de</p>
            <p><u>Disclaimer:</u></p>
            <div style="margin: 10px; height: 100px; font-size: xx-small; border-radius: 5px; padding: 5px; text-align: left; overflow-y: scroll; background: #EFF0F8;">
                <p><b>Deutsch</b></p>
                <p><u>Haftung für Inhalte:</u></p>
                <p>Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.</p>
                <p><u>Haftung für Links:</u></p>
                <p>Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.</p>
                <p><u>Datenschutz:</u></p>
                <p>Die Nutzung unserer Webseite ist ohne Angabe personenbezogener Daten möglich und es werden keine verarbeiteten Daten gespeichert. Soweit auf unseren Seiten personenbezogene Daten (beispielsweise Name, Anschrift oder eMail-Adressen) erhoben werden, erfolgt dies, soweit möglich, stets auf freiwilliger Basis. Diese Daten werden ohne Ihre ausdrückliche Zustimmung nicht an Dritte weitergegeben. Wir weisen darauf hin, dass die Datenübertragung im Internet (z.B. bei der Kommunikation per E-Mail) Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der Daten vor dem Zugriff durch Dritte ist nicht möglich. Der Nutzung von im Rahmen der Impressumspflicht veröffentlichten Kontaktdaten durch Dritte zur Übersendung von nicht ausdrücklich angeforderter Werbung und Informationsmaterialien wird hiermit ausdrücklich widersprochen. Die Betreiber der Seiten behalten sich ausdrücklich rechtliche Schritte im Falle der unverlangten Zusendung von Werbeinformationen, etwa durch Spam-Mails, vor.</p>
                <p><u>Urheberrecht:</u></p>
                <p>Dieses Programm ist freie Software: Sie können es unter den Bedingungen der GNU General Public License, wie sie von der Free Software Foundation veröffentlicht wurde, weitergeben und/oder modifizieren, entweder gemäß Version 3 der Lizenz oder (nach Ihrer Wahl) jeder späteren Version. Dieses Programm wird in der Hoffnung verteilt, dass es nützlich ist, aber OHNE JEGLICHE GARANTIE; sogar ohne die implizite Garantie der MARKTREIFE oder der EIGNUNG FÜR EINEN BESTIMMTEN ZWECK.  Siehe die GNU General Public License für weitere Details (<a href="http://www.gnu.org/licenses">http://www.gnu.org/licenses</a>)</p>
                <p></p>
                <p><b>English</b></p>
                <p><u>Content liability:</u></p>
                <p>The contents of our pages were created with the utmost care. However, we cannot guarantee the accuracy, completeness and actuality of the content. As a service provider, we are responsible for our own content on these pages under the general laws according to § 7 para.1 TMG. According to §§ 8 to 10 TMG, however, we are not obligated as a service provider to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity. Obligations to remove or block the use of information under the general laws remain unaffected. However, liability in this regard is only possible from the point in time at which a concrete infringement of the law becomes known. If we become aware of such infringements, we will remove this content immediately.</p>
                <p><u>Link liability:</u></p>
                <p>This page may contain links to external websites of third parties, on whose contents we have no influence. We cannot take any liability for these external contents. The respective provider or operator of the pages is always responsible for the content of the linked pages. The linked pages were checked for possible legal violations at the time of linking. Illegal contents were not recognizable at the time of linking. However, a permanent control of the contents of the linked pages is not reasonable without concrete evidence of a violation of the law. If we become aware of any infringements, we will remove such links immediately.</p>
                <p><u>Data privacy:</u></p>
                <p>The use of our website is possible without providing personal data and no processed data is stored. As far as on our sides personal data (such as name, address or e-mail addresses) are collected, this is on a voluntary basis. This data will not be passed on to third parties without your express consent. We point out that data transmission over the Internet (eg communication by e-mail) may yield security gaps. Complete protection of data against access by third parties is not possible. The use of contact data published within the framework of the impressum by third parties for the purpose of sending advertising and information material is hereby expressly prohibited. The operators of the pages expressly reserve the right to take legal action in the event of the sending of advertising information, such as spam e-mails.</p>
                <p><u>Copyright :</u></p>
                <p>This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. (<a href="http://www.gnu.org/licenses">http://www.gnu.org/licenses</a>)</p>
            </div>
        </div>
        `,
        background: '#EFF0F8',
        confirmButtonText: 'Ok',
        confirmButtonColor: '#607196'
    });
}