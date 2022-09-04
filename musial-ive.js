/**
    MUSIAL-IVE v2.1
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

/* Import STATE and SETTINGS JSON objects. */
import { STATE, AMINO_ACID_ENCODING, AMINO_ACID_DECODING, AMINO_ACID_DESIGNATION, AMINO_ACID_COLOR } from './musial-ive-state.js';
import { SETTINGS } from './musial-ive-settings.js';

/* JSON Schema validator used to validate user input. */
var SCHEMA_VALIDATOR;

/* Definition of runtime variables that are not stored in the application state. */
var MAIN_VISUALIZE_OVERVIEW_ECHART_sizeObserver = new ResizeObserver( ( entries ) => {
    MAIN_VISUALIZE_OVERVIEW_ECHART.resize( { width: entries[ 0 ].width, height: entries[ 0 ].height } );
} );
MAIN_VISUALIZE_OVERVIEW_ECHART_sizeObserver.observe( document.getElementById( "main-visualize-overview-echart" ) );
var MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART_sizeObserver = new ResizeObserver( ( entries ) => {
    MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART.resize( { width: entries[ 0 ].width, height: entries[ 0 ].height } );
} );
MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART_sizeObserver.observe( document.getElementById( "main-visualize-proteoforms-variants-echart" ) );

/* Methods that manipulate or to interact with the MAIN_VISUALIZE_OVERVIEW_ECHART object. */
var MAIN_VISUALIZE_OVERVIEW_ECHART = echarts.init(document.getElementById("main-visualize-overview-echart"), { "renderer": "canvas" });

/**
 * Adds a new feature to the feature overview echart component, i.e., a three-layered tree comprising chromosome, class (user defined) and feature level.
 * 
 * @param {string} chr - Chromosome name; used as node name for the chromosome level of the tree.
 * @param {string} cls - Class name; used as node name for the class level of the tree. 
 * @param {string} ftr - Feature name; used as node name for the feature level of the tree.
 */
function MAIN_VISUALIZE_OVERVIEW_ECHART_addFeature(chr, cls, ftr) {
    let featureOverviewData = STATE.mainVisualizeOverviewEchart.series[0].data;
    let chrLevelNode;
    let clsLevelNode;
    let ftrLevelNode;
    // The node symbol size is computed as ln(#PF)², but not smaller than 5.
    let computeSymbolSize = (noPf) => {
        return Math.max( 5, Math.round(Math.pow(Math.log(noPf), 2)) );
    };
    // Add a new chromosome level node, if none for the specified chromosome name exists.
    if (featureOverviewData.filter(node => node.name == chr).length == 0) {
        chrLevelNode = {
            name: chr,
            value: -1,
            symbol: 'emptyCircle',
            symbolSize: 12,
            children: []
        };
        featureOverviewData.push(chrLevelNode);
    } else {
        chrLevelNode = featureOverviewData.filter(node => node.name === chr)[0];
    }
    // Add a new class level node, if none for the specified class name exists.
    if (chrLevelNode.children.filter(node => node.name === cls).length == 0) {
        clsLevelNode = {
            name: cls,
            value: -1,
            symbol: 'emptyCircle',
            symbolSize: 12,
            children: []
        };
        chrLevelNode.children.push(clsLevelNode);
    } else {
        clsLevelNode = chrLevelNode.children.filter(node => node.name === cls)[0];
    }
    // Add a new feature level node, if none for the specified feature name exists.
    if (clsLevelNode.children.filter(node => node.name === ftr).length == 0) {
        var variablePositionsSet = new Set();
        var variablePositions = 0;
        // Total number of feature positions.
        var featurePositions = STATE.vDict.features[ftr].nucleotideSequence.length / 3;
        var proteoformKeys = Object.keys(STATE.vDict.features[ftr].allocatedProtein.proteoforms);
        // Collect all variable positions from all proteoforms.
        for (let proteoformName of proteoformKeys) {
            if (proteoformName === "WildType") {
                continue;
            } else {
                for (let vp of STATE.vDict.features[ftr].allocatedProtein.proteoforms[proteoformName].annotations.VSWAB.split("|")) {
                    let content = vp.split("@")[0]
                    variablePositionsSet.add(vp.split("@")[1])
                    // Ignore variant positions after first internal termination.
                    if (content === "*") {
                        break;
                    }
                }
            }
        }
        // Add inserted positions as feature positions.
        variablePositionsSet.forEach((vp) => {
            if (vp.includes("+")) {
                featurePositions += 1;
            }
            variablePositions += 1;
        });
        var noProteoforms = proteoformKeys.length;
        ftrLevelNode = {
            name: ftr,
            value: variablePositions == 0 ? 0.0 : (100 * (variablePositions / featurePositions)).toFixed(1),
            symbolSize: computeSymbolSize(noProteoforms),
            symbol: 'circle',
        };
        STATE.mainVisualizeProteoformsAnnotationsPerFeature[ ftr ] = [ ];
        clsLevelNode.children.push(ftrLevelNode);
    }
    MAIN_VISUALIZE_OVERVIEW_ECHART.setOption(STATE.mainVisualizeOverviewEchart);
};

/* Methods that manipulate or to interact with the MAIN_VISUALIZE_PROTEOFORMS_3DMOL object. */
var MAIN_VISUALIZE_PROTEOFORMS_3DMOL;

/**
 * Displays the protein structure of the currently selected feature in the 3DMol container.
 */
function MAIN_VISUALIZE_PROTEOFORMS_3DMOL_setSelectedFeature() {
    // Clear current model, add protein model of currently selected feature and apply default cartoon style.
    MAIN_VISUALIZE_PROTEOFORMS_3DMOL.clear( );
    MAIN_VISUALIZE_PROTEOFORMS_3DMOL.addModel(STATE.vDict.features[STATE.mainVisualizeSelectedFeature].allocatedProtein.pdb, "pdb");
    MAIN_VISUALIZE_PROTEOFORMS_3DMOL_applyDefaultStyle( );
    // Add hover callback to viewer.
    MAIN_VISUALIZE_PROTEOFORMS_3DMOL.setHoverable(
        {
            // Empty object -> trigger hovering on all atoms.
        },
        true, // Enable hovering.
        ( atom, viewer, event, container ) => {
            if( !atom.hover_label ) {
                atom.hover_label = viewer.addLabel(
                    "Pos.: " + atom.resi + " + 0 (" + atom.resn + ")",
                    {
                        position: atom,
                        backgroundColor: '#FAFAFC',
                        backgroundOpacity: 0.8,
                        fontColor: 'black',
                        fontSize: 12
                    }
                );
                atom.hover_sphere = viewer.addSphere(
                    {
                        center: {
                            x: atom.x,
                            y: atom.y,
                            z: atom.z
                        },
                        wireframe: true,
                        radius: 1.6,
                        color: '#FF5C43',
                        opacity: 1
                    }
                );
                viewer.render( );
            }
        },
        (atom) => {
            if( atom.hover_label ) {
                MAIN_VISUALIZE_PROTEOFORMS_3DMOL.removeLabel( atom.hover_label );
                MAIN_VISUALIZE_PROTEOFORMS_3DMOL.removeShape( atom.hover_sphere );
                delete atom.hover_label;
                delete atom.hover_sphere;
                MAIN_VISUALIZE_PROTEOFORMS_3DMOL.render( );
            }
        }
    );
    MAIN_VISUALIZE_PROTEOFORMS_3DMOL.setHoverDuration( 100 );
    // Zoom to the model.
    MAIN_VISUALIZE_PROTEOFORMS_3DMOL.zoomTo( );
    // Infer secondary structure annotation.
    MAIN_VISUALIZE_PROTEOFORMS_3DMOL_inferSecondaryStructureAnnotation( );
};

/**
 * Applies default cartoon style with coloring based on the number of variants per position to the loaded model.
 */
function MAIN_VISUALIZE_PROTEOFORMS_3DMOL_applyDefaultStyle( ) {
    MAIN_VISUALIZE_PROTEOFORMS_3DMOL.setStyle(
        {
            // Select all residues.
        },
        {
            cartoon: {
                colorfunc: (atom) => {
                    let noVariants = STATE.mainVisualizeProteoformsVariantsEchart.series[1].data.filter(v => { return v[0] === atom.resi + "+0" })[0][1];
                    let clr = '#E7E7E4';
                    if (noVariants == 2) {
                        clr = '#9c73af';
                    } else if (noVariants > 2 && noVariants <= 4) {
                        clr = '#e56b9d';
                    } else if (noVariants > 4 && noVariants <= 8) {
                        clr = '#ff7764';
                    } else if (noVariants > 8) {
                        clr = '#ffa600';
                    }
                    return clr;
                },
                opacity: 0.95,
                thickness: 0.2,
                arrows: true
            }
        }
    );
    MAIN_VISUALIZE_PROTEOFORMS_3DMOL.render();
}

/**
 * Highlights a specific residue (determined by the residue index/position) of the currently displayed model.
 */
function MAIN_VISUALIZE_PROTEOFORMS_3DMOL_highlightSelectedPosition( ) {
    MAIN_VISUALIZE_PROTEOFORMS_3DMOL_applyDefaultStyle( );
    let selection = STATE.mainVisualizeProteoformsSelection[ STATE.mainVisualizeSelectedFeature ];
    if ( selection != undefined && selection != null ) {
        MAIN_VISUALIZE_PROTEOFORMS_3DMOL.addStyle(
            {
                resi: selection.name.split( "+" )[ 0 ]
            },
            {
                stick: {
                    colorfunc: _ => '#FF5C43',
                    radius: 1
                }
            }
        );
    }
    MAIN_VISUALIZE_PROTEOFORMS_3DMOL.render();
};

/**
 * Extracts information about secondary structure from the 3DMol.js protein model and stores the information as annotation tracks.
 */
function MAIN_VISUALIZE_PROTEOFORMS_3DMOL_inferSecondaryStructureAnnotation( ) {
    let secStrucSegments = { "c": [ ], "s": [ ], "h": [ ] };
    let secStrucColors = { "c": "#C4A78E", "s": "#86B8E1", "h": "#E08787" };
    let currentSecStruc = "";
    let segmentStart = "";
    let segmentEnd = "";
    MAIN_VISUALIZE_PROTEOFORMS_3DMOL.getInternalState( ).models[ 0 ].atoms.forEach( atom => {
        if ( atom.resn != "DUM" ) {
            if ( atom.ss !== currentSecStruc ) {
                if ( currentSecStruc !== "" ) {
                    secStrucSegments[ currentSecStruc ].push( segmentStart + "+0-" + segmentEnd + "+0" );
                }
                currentSecStruc = atom.ss;
                segmentStart = atom.resi;
            }
            segmentEnd = atom.resi;
        }
    } );
    secStrucSegments[ currentSecStruc ].push( segmentStart + "+0-" + segmentEnd + "+0" );
    for ( const [ t, s ] of Object.entries( secStrucSegments ) ) {
        let label = "";
        let segments = "";
        let color = "";
        if ( t == "c" ) {
            label = "Secondary Structure: Coil";
            segments = s.join( "," );
            color = secStrucColors[ t ];
        } else if ( t == "s" ) {
            label = "Secondary Structure: Sheet";
            segments = s.join( "," );
            color = secStrucColors[ t ];
        } else if ( t == "h" ) {
            label = "Secondary Structure: Helix";
            segments = s.join( "," );
            color = secStrucColors[ t ];
        }
        if ( !STATE.mainVisualizeProteoformsAnnotationsPerFeature[ STATE.mainVisualizeSelectedFeature ].some( annotationObject => annotationObject.label == label ) ) {
            STATE.mainVisualizeProteoformsAnnotationsPerFeature[ STATE.mainVisualizeSelectedFeature ].push( { "label": label, "track": 0, "segments": segments, "color": color, "display": true } );
            MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART_addAnnotation( label, segments, 0, color );
        }
    }
    MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART.setOption(STATE.mainVisualizeProteoformsVariantsEchart, {replaceMerge: ['series']});
    MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART.resize();
}

/* METHODS TO MANIPULATE AND INTERACT WITH `MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART` */
var MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART;

/**
 * Displays variant information of the specified chain and the currently selected feature, i.e.,
 * the feature stored in STATE.vDict.features with the key STATE.selectedFeature.
 * 
 * @param {string} chain - Letter of the chain to display. 
 */
function MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART_setChain(chain) {
    // Reset currently stored information.
    STATE.mainVisualizeProteoformsPositionInformation = {};
    STATE.mainVisualizeProteoformsMetaInformation = {};
    STATE.mainVisualizeProteoformsNoSamples = 0;
    STATE.mainVisualizeProteoformsNoProteoforms = 0;
    // Clear EChart information.
    STATE.mainVisualizeProteoformsVariantsEchart.xAxis[0].data = []; // Index 0 -> Heatmap with per sample, per position variants.
    STATE.mainVisualizeProteoformsVariantsEchart.yAxis[0].data = [];
    STATE.mainVisualizeProteoformsVariantsEchart.series[0].data = [];

    STATE.mainVisualizeProteoformsVariantsEchart.xAxis[1].data = []; // Index 1 -> No. variants track on top.
    STATE.mainVisualizeProteoformsVariantsEchart.series[1].data = [];
    
    STATE.mainVisualizeProteoformsVariantsEchart.yAxis[2].data = []; // Index 2 -> Sample frequency track on the right.
    STATE.mainVisualizeProteoformsVariantsEchart.series[2].data = [];

    STATE.mainVisualizeProteoformsVariantsEchart.xAxis[3].data = []; // Index 3 -> Custom tracks.
    STATE.mainVisualizeProteoformsVariantsEchart.series = STATE.mainVisualizeProteoformsVariantsEchart.series.splice( 0, 3 ); // Remove all annotations.

    // Initialize temp. variables.
    var position = 1;
    var chainSequence = STATE.vDict.features[STATE.mainVisualizeSelectedFeature].allocatedProtein.chainSequences[chain];
    var hasTerminated = false;

    // Definition of helper-functions.

    /**
     * Adds the specified variant information to the STATE.perPositionVariantInformation object.
     * 
     * @param {string} content - The alternate content, i.e., single-letter aminoacid code.
     * @param {string} position - The position at which the variant is present.
     * @param {string} proteoform - The proteoform ID that yields the variant.
     * @param {string} insertionIndex - The number of inserted positions, if any.
     */
    let addPositionVariantInformation = (content, position, proteoform, insertionIndex) => {
        let p = position + "+" + insertionIndex;
        if (p in STATE.mainVisualizeProteoformsPositionInformation) {
            if (!(proteoform in STATE.mainVisualizeProteoformsPositionInformation[p])) {
                STATE.mainVisualizeProteoformsPositionInformation[p][proteoform] = content;
            }
        } else {
            STATE.mainVisualizeProteoformsPositionInformation[p] = {};
            addPositionVariantInformation(content, position, proteoform, insertionIndex);
        }
    };

    /**
     * Comparator function that compares to proteoforms stored in STATE.vDict.features[STATE.selectedFeature].allocatedProtein.proteoforms
     * by their number of samples.
     * 
     * @param {string} pfAName - ID of the first proteoform to compare.
     * @param {string} pfBName - ID of the second proteoform to compare.
     * @returns 1, 0 or -1, dependent on whether pfA or pfB has more samples.
     */
    let sortProteoformsByNoSamples = (pfAName, pfBName) => {
        let vpa = parseInt(STATE.vDict.features[STATE.mainVisualizeSelectedFeature].allocatedProtein.proteoforms[pfAName].samples.length);
        let vpb = parseInt(STATE.vDict.features[STATE.mainVisualizeSelectedFeature].allocatedProtein.proteoforms[pfBName].samples.length);
        if (vpa > vpb) {
            return 1;
        } else if (vpa == vpb) {
            return 0;
        } else { // vpa < vpb
            return -1;
        }
    };

    /**
     * Comparator function that compares two positions with the format X+Y where X and Y are substrings that are parsable as strings.
     * X reflects the position on the original protein and Y the number of inserted positions; If X of a and b is equal, Y is used to
     * compare the positions.
     * 
     * @param {string} a - The first position to compare.
     * @param {string} b - The second position to compare.
     * @returns 1, 0 or -1, dependent on whether a or b is the subsequent position wrt. the other one.
     */
    let sortPositions = (a, b) => {
        let va = parseInt(a.split('+')[0]);
        let vb = parseInt(b.split('+')[0]);
        if (va == vb) {
            let va = parseInt(a.split('+')[1]);
            let vb = parseInt(b.split('+')[1]);
            if (va > vb) {
                return 1;
            } else if (va < vb) {
                return -1;
            } else {
                return 0;
            }
        } else {
            if (va > vb) {
                return 1;
            } else {
                return -1;
            }
        }
    };
    
    // Filter proteoforms to display based on the values stored in SETTINGS.
    var filteredProteoformKeys = Object.keys(STATE.vDict.features[STATE.mainVisualizeSelectedFeature].allocatedProtein.proteoforms).sort(sortProteoformsByNoSamples).filter(
        proteoformKey => {
            if ( SETTINGS._main_visualize_proteoforms_excludePFWithInternalTermination && STATE.vDict.features[STATE.mainVisualizeSelectedFeature].allocatedProtein.proteoforms[ proteoformKey ].annotations.PT == "true" ) {
                // Filter for absence of premature termination; If filter is set. 
                return false;
            } else if ( STATE.vDict.features[STATE.mainVisualizeSelectedFeature].allocatedProtein.proteoforms[ proteoformKey ].samples.length < SETTINGS._main_visualize_proteoforms_PFMinNoSamples ) {
                // Filter for No. samples  below set threshold.
                return false;
            } else if (  parseFloat( STATE.vDict.features[STATE.mainVisualizeSelectedFeature].allocatedProtein.proteoforms[ proteoformKey ].annotations.VP ) < SETTINGS._main_visualize_proteoforms_PFMinVarPosPerc ) {
                // Filter for variable position percentage below set threshold.
                return false;
            } else {
                // Filter if proteoform name or contained sample is explicitly stated to be included.
                let PFIsIncluded = SETTINGS._main_visualize_proteoforms_explicitPFs.length == 0 && SETTINGS._main_visualize_proteoforms_explicitSamples.length == 0;
                let PFIncludesSample = SETTINGS._main_visualize_proteoforms_explicitPFs.length == 0 && SETTINGS._main_visualize_proteoforms_explicitSamples.length == 0;
                if ( !PFIsIncluded ) {
                    PFIsIncluded = SETTINGS._main_visualize_proteoforms_explicitPFs.includes( proteoformKey );
                }
                if ( !PFIncludesSample ) {
                    PFIncludesSample = SETTINGS._main_visualize_proteoforms_explicitSamples.some( sId => STATE.vDict.features[STATE.mainVisualizeSelectedFeature].allocatedProtein.proteoforms[ proteoformKey ].samples.includes( sId ) );
                }
                return ( PFIsIncluded || PFIncludesSample ) && proteoformKey !== "WildType";
            }
        }
    );
    STATE.mainVisualizeProteoformsNoProteoforms = filteredProteoformKeys.length + 1;

    // Add information about wild type proteoform.
    for (let content of chainSequence.split('')) {
        if (content == content.toUpperCase()) {
            // Content is of gene and protein.
            addPositionVariantInformation(content, position, "Wild Type Gene", 0);
            addPositionVariantInformation(content, position, "Wild Type Protein", 0);
        } else {
            // Content is only of gene.
            addPositionVariantInformation(content.toUpperCase(), position, "Wild Type Gene", 0);
        }
        position++;
    }

    // Add information about filtered non wild type proteoforms.
    for (let proteoformKey of filteredProteoformKeys) {
        hasTerminated = false;
        var proteoformVariants = STATE.vDict.features[STATE.mainVisualizeSelectedFeature].allocatedProtein.proteoforms[proteoformKey].annotations.VSWAB.split('|');
        for (let proteoformVariant of proteoformVariants) {
            if (hasTerminated) {
                break;
            }
            var proteoformVariantContent = proteoformVariant.split('@')[0];
            var proteoformVariantPosition = parseInt(proteoformVariant.split('@')[1].split('+')[0]);
            var proteoformVariantInsertedPosition = parseInt(proteoformVariant.split('@')[1].split('+')[1]);
            addPositionVariantInformation(proteoformVariantContent, proteoformVariantPosition, proteoformKey, proteoformVariantInsertedPosition);
            if (proteoformVariantContent === '*') {
                hasTerminated = SETTINGS._main_visualize_proteoforms_truncateAfterFirstTermination;
            }
        }
    }

    // Re-add labels for wild type proteoform.
    filteredProteoformKeys.push("Wild Type Gene");
    filteredProteoformKeys.push("Wild Type Protein");
    
    // Set y-axis label data.
    STATE.mainVisualizeProteoformsVariantsEchart.yAxis[0].data = filteredProteoformKeys;
    STATE.mainVisualizeProteoformsVariantsEchart.yAxis[0].name = "Proteoforms (m = " + STATE.mainVisualizeProteoformsNoProteoforms + ")";
    STATE.mainVisualizeProteoformsVariantsEchart.yAxis[2].data = filteredProteoformKeys;
    
    // Sort positions in ascending order and add information to EChart series and x-axis.
    let i = 0;
    for (let position of Object.keys(STATE.mainVisualizeProteoformsPositionInformation).sort(sortPositions)) {
        STATE.mainVisualizeProteoformsVariantsEchart.xAxis[0].data.push(position);
        STATE.mainVisualizeProteoformsVariantsEchart.xAxis[1].data.push(position);
        STATE.mainVisualizeProteoformsVariantsEchart.xAxis[3].data.push(position);
        for (let [proteoform, variant] of Object.entries(STATE.mainVisualizeProteoformsPositionInformation[position])) {
            STATE.mainVisualizeProteoformsVariantsEchart.series[0].data.push([i, filteredProteoformKeys.indexOf(proteoform), AMINO_ACID_ENCODING[variant]]);
        }
        STATE.mainVisualizeProteoformsVariantsEchart.series[1].data.push([position, Object.keys(MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART_getPositionComposition(position)).length]);
        i++;
    }

    // Compute sample proportion per proteoform.
    let nS;
    let totalCounts = [];
    for (let proteoformKey of filteredProteoformKeys) {
        if (proteoformKey === "Wild Type Gene") {
            nS = STATE.vDict.features[STATE.mainVisualizeSelectedFeature].allocatedProtein.proteoforms['WildType'].samples.length;
        } else if (proteoformKey === "Wild Type Protein") {
            nS = 0;
        } else {
            nS = STATE.vDict.features[STATE.mainVisualizeSelectedFeature].allocatedProtein.proteoforms[proteoformKey].samples.length;
        }
        totalCounts.push(nS);
        STATE.mainVisualizeProteoformsNoSamples += nS;
    }
    STATE.mainVisualizeProteoformsVariantsEchart.series[2].data = totalCounts.map( v => (v / STATE.mainVisualizeProteoformsNoSamples).toFixed(4) );

    // Add any existing annotation tracks.
    STATE.mainVisualizeProteoformsAnnotationsPerFeature[ STATE.mainVisualizeSelectedFeature ].forEach( annotationObject => {
        if ( annotationObject.display ) {
            MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART_addAnnotation(
                annotationObject.label,
                annotationObject.segments,
                annotationObject.track,
                annotationObject.color
            );
        }
    } );

    MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART.setOption(STATE.mainVisualizeProteoformsVariantsEchart, {notMerge: true});
    MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART.resize();
};

/**
 * Fires the SWAL event to display the proteoform filter tool popup window.
 */
function MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART_openFilterDialog( ) {
    // Extract set `excludePFWithInternalTermination` value from SETTINGS.
    let settingsExcludePTPFschecked = SETTINGS._main_visualize_proteoforms_excludePFWithInternalTermination ? "checked" : "";
    // Extract set `explicit` value from SETTINGS.
    let settingExplicitValue = "";
    if ( SETTINGS._main_visualize_proteoforms_explicitSamples.length > 0 ) {
        settingExplicitValue += SETTINGS._main_visualize_proteoforms_explicitSamples.join( " " );
    }
    if ( SETTINGS._main_visualize_proteoforms_explicitPFs.length > 0 ) {
        settingExplicitValue += " " + SETTINGS._main_visualize_proteoforms_explicitPFs.join( " " );
    }
    let htmlContent = `
    <div>
        <table class="table row-border" data-role="table" data-rows="10" data-show-pagination="false" data-show-search="false" data-show-table-info="false" data-show-rows-steps="false">
            <thead>
                <tr>
                    <th data-cls-column="text-left w-25">Filter</th>
                    <th data-cls-column="w-50">Value</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Exlude Proteoforms with Premature Termination</td>
                    <td><input id="tmp-visualize-proteoforms-setting-excludePFWithInternalTermination" type="checkbox" data-cls-check="customCheck bd-gray" data-cls-switch="customSwitch" data-role="switch"` + settingsExcludePTPFschecked + `></td>
                </tr>
                <tr>
                    <td>Min. Percentage of Variable Positions</td>
                    <td><br><input id="tmp-visualize-proteoforms-setting-PFMinVarPosPerc" class="input-small" data-min-value="0.0" data-max-value="100.0" data-fixed="1" data-step="0.1" data-role="spinner"></td>
                </tr>
                <tr>
                    <td>Min. No. Samples</td>
                    <td><br><input id="tmp-visualize-proteoforms-setting-PFMinNoSamples" class="input-small" data-min-value="0" data-max-value="` + Object.keys( STATE.vDict.samples ).length + `" data-fixed="0" data-step="1" data-role="spinner"></td>
                </tr>
                <tr>
                    <td>Include Only</td>
                    <td><input id="tmp-visualize-proteoforms-setting-explicit" type="text" data-role="taginput" data-tag-trigger="Space" value="` + settingExplicitValue + `" data-autocomplete="Foo"></td>
                </tr>
            </tbody>
        </table>
    </div>
    `
    Swal.fire({
        title: 'Apply Filters',
        width: "70%",
        padding: '1%',
        color: '#6d81ad',
        background: '#EFF0F8',
        html: htmlContent,
        didOpen: ( ) => {
            Metro.getPlugin( $( "#tmp-visualize-proteoforms-setting-PFMinVarPosPerc" ) ,'spinner').val( SETTINGS._main_visualize_proteoforms_PFMinVarPosPerc );
            Metro.getPlugin( $( "#tmp-visualize-proteoforms-setting-PFMinNoSamples" ) ,'spinner').val( SETTINGS._main_visualize_proteoforms_PFMinNoSamples );
        },
        backdrop: 'rgba(139, 140, 148, 0.5) no-repeat',
        confirmButtonColor: '#6d81ad'
    }).then( _ => {
        SETTINGS._main_visualize_proteoforms_excludePFWithInternalTermination =  $( "#tmp-visualize-proteoforms-setting-excludePFWithInternalTermination" ).is(':checked');
        SETTINGS._main_visualize_proteoforms_PFMinVarPosPerc = parseFloat( document.getElementById( "tmp-visualize-proteoforms-setting-PFMinVarPosPerc" ).value );
        SETTINGS._main_visualize_proteoforms_PFMinNoSamples = parseInt( document.getElementById( "tmp-visualize-proteoforms-setting-PFMinNoSamples" ).value );
        SETTINGS._main_visualize_proteoforms_explicitPFs = [ ];
        SETTINGS._main_visualize_proteoforms_explicitSamples = [ ];
        for ( let considered of document.getElementById( "tmp-visualize-proteoforms-setting-explicit" ).value.split( "," ) ) {
            if ( considered.startsWith( "PF" ) && considered in STATE.vDict.features[ STATE.mainVisualizeSelectedFeature ].allocatedProtein.proteoforms  ) {
                SETTINGS._main_visualize_proteoforms_explicitPFs.push( considered );
            } else if ( considered in STATE.vDict.samples ) {
                SETTINGS._main_visualize_proteoforms_explicitSamples.push( considered );
            }
        }
        MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART_setChain('A');
        MAIN_VISUALIZE_PROTEOFORMS_3DMOL_setSelectedFeature( );
    });
}

/**
 * Fires the SWAL event to display the proteoform custom tracks tool popup window.
 */
function MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART_openTracksDialog( ) {
    /** 
     * Adds a row to the table element of the tracks dialog.
     * 
     * @param {Object} annotation - Optional existing annotation.
     */
    var addAnnotationTableEntry = ( annotation ) => {
        let isNewEntry = false;
        if ( typeof annotation === 'undefined' ) {
            annotation = {
                "label": Math.random( ).toString().slice(2, 8),
                "track": 0,
                "segments": "1+0-10+0",
                "color": "#000000",
                "display": true,
                "deletable": true
            };
            isNewEntry = true;
        }
        let tableEntryHtmlContent = `
        <tr id="` + annotation.label + `">
            <td>
                <input id="` + annotation.label + `Label" type="text" data-role="input" data-default-value="` + annotation.label + `" data-clear-button="false" ` + ( isNewEntry ? `` : `disabled` ) + `>
            </td>
            <td>
                <select id="` + annotation.label + `Track" data-role="select" data-filter="false" data-empty-value="Select Track">
                    <option value="0"` + ( annotation.track == 0 ? `selected="selected"` : `` ) + `>Bottom</option>
                    <option value="2"` + ( annotation.track == 2 ? `selected="selected"` : `` ) + `>Mid</option>
                    <option value="4"` + ( annotation.track == 4 ? `selected="selected"` : `` ) + `>Top</option>
                </select>
            </td>
            <td>
                <input id="` + annotation.label + `Segments" type="text" data-role="taginput" data-tag-trigger="Space" value="` + annotation.segments + `">
            </td>
            <td>
                <input id="` + annotation.label + `Color" type="color" value="` + annotation.color + `"></input>
            </td>
            <td>
                <input id="` + annotation.label + `Display" type="checkbox" data-role="checkbox" data-cls-check="bd-gray bg-gray" ` + ( annotation.display ? `checked` : `` ) + `>
            </td>
            <td>
                <button id="` + annotation.label + `DeleteButton" class="button rounded mini ribbed-red fg-white" onclick="document.getElementById('` + annotation.label + `').remove( );"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
        `
        $( '#tmp-visualize-proteoforms-toolTracks-annotationsTable' ).append(tableEntryHtmlContent);
    };
    // Extract set `displayAnnotationTracks` value from SETTINGS.
    let settingsDisplayAnnotationTracks = SETTINGS._main_visualize_proteoforms_displayAnnotationTracks ? "checked" : "";
    // Definition of the html content to display on the dialog.
    let htmlContent = `
    <div class="grid my-1 p-1">
        <div class="row flex-align-center">
            <div class="stub" style="width: 22%">
                <p>Display Annotation Tracks</p>
            </div>
            <div class="stub" style="width: 5%">
                <input id="tmp-visualize-proteoforms-setting-displayAnnotationTracks" type="checkbox" data-cls-check="customCheck bd-gray" data-cls-switch="customSwitch" data-role="switch"` + settingsDisplayAnnotationTracks + `>
            </div>
            <div class="stub" style="width: 63%">
            </div>
            <div class="stub" style="width: 10%">
                <button id="tmp-visualize-proteoforms-toolTracks-addAnnotationButton" class="button rounded success mini" style="display: inline-block;">New Annotation</button>
            </div>
        </div>
    </div>
    <hr>
    <table class="table subcompact">
        <thead>
            <tr>
                <th class="fg-darkGray w-25">Label</th>
                <th class="fg-darkGray">Track</th>
                <th class="fg-darkGray">Segments</th>
                <th class="fg-darkGray">Color</th>
                <th class="fg-darkGray">Display</th>
                <th class="fg-darkGray"></th>
            </tr>
        </thead>
        <tbody id="tmp-visualize-proteoforms-toolTracks-annotationsTable">
        </tbody>
    </table>
    `
    Swal.fire({
        title: 'Manage Annotation Tracks',
        width: '70%',
        padding: '1%',
        color: '#6d81ad',
        background: '#EFF0F8',
        html: htmlContent,
        didOpen: _ => {
            document.getElementById( "tmp-visualize-proteoforms-toolTracks-addAnnotationButton" ).onclick = _ => addAnnotationTableEntry( );
            STATE.mainVisualizeProteoformsAnnotationsPerFeature[ STATE.mainVisualizeSelectedFeature ].forEach( annotationObject => addAnnotationTableEntry( annotationObject ) )
        },
        backdrop: 'rgba(139, 140, 148, 0.5) no-repeat',
        confirmButtonColor: '#6d81ad'
    }).then( _ => {
        // Reset anntation objects and series.
        STATE.mainVisualizeProteoformsAnnotationsPerFeature[ STATE.mainVisualizeSelectedFeature ] = [ ];
        STATE.mainVisualizeProteoformsVariantsEchart.series = STATE.mainVisualizeProteoformsVariantsEchart.series.splice( 0, 3 );
        for (let i = 0; i < document.getElementById("tmp-visualize-proteoforms-toolTracks-annotationsTable").children.length; i++) {
            let id = document.getElementById("tmp-visualize-proteoforms-toolTracks-annotationsTable").children[i].id;
            let label = document.getElementById( id + "Label" ).value;
            let track = parseInt( document.getElementById( id + "Track" ).value );
            let segments = document.getElementById( id + "Segments" ).value;
            let color = document.getElementById( id + "Color" ).value;
            let display = document.getElementById( id + "Display" ).checked;
            STATE.mainVisualizeProteoformsAnnotationsPerFeature[ STATE.mainVisualizeSelectedFeature ].push( { "label": label, "track": track, "segments": segments, "color": color, "display": display } );
            if ( display ) {
                MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART_addAnnotation( label, segments, track, color );
            }
        }
        SETTINGS._main_visualize_proteoforms_displayAnnotationTracks =  $( "#tmp-visualize-proteoforms-setting-displayAnnotationTracks" ).is(':checked');
        MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART_toggleAnnotationTracks( SETTINGS._main_visualize_proteoforms_displayAnnotationTracks );
        MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART.setOption(STATE.mainVisualizeProteoformsVariantsEchart, {replaceMerge: ['series']});
        MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART.resize();
    });
}

/**
 * Toggles display mode of the custom annotations track.
 * 
 * @param {boolean} display - Whether to show or hide the custom annotations track.
 */
 function MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART_toggleAnnotationTracks( display ) {
    if ( display ) {
        STATE.mainVisualizeProteoformsVariantsEchart.grid[ 3 ].top = "8.5%";
        STATE.mainVisualizeProteoformsVariantsEchart.grid[ 3 ].right = "10%";
        STATE.mainVisualizeProteoformsVariantsEchart.grid[ 3 ].bottom = "81%";
        STATE.mainVisualizeProteoformsVariantsEchart.grid[ 3 ].left = "10%";
        STATE.mainVisualizeProteoformsVariantsEchart.grid[ 3 ].show = true;
        STATE.mainVisualizeProteoformsVariantsEchart.yAxis[ 3 ].show = true;
        STATE.mainVisualizeProteoformsVariantsEchart.grid[ 0 ].top = "20%";
        STATE.mainVisualizeProteoformsVariantsEchart.grid[ 2 ].top = "20%";
        STATE.mainVisualizeProteoformsVariantsEchart.dataZoom[ 1 ].top = "20%";
    } else {
        STATE.mainVisualizeProteoformsVariantsEchart.grid[ 3 ].top = "0%";
        STATE.mainVisualizeProteoformsVariantsEchart.grid[ 3 ].right = "50%";
        STATE.mainVisualizeProteoformsVariantsEchart.grid[ 3 ].bottom = "100%";
        STATE.mainVisualizeProteoformsVariantsEchart.grid[ 3 ].left = "50%";
        STATE.mainVisualizeProteoformsVariantsEchart.grid[ 3 ].show = false;
        STATE.mainVisualizeProteoformsVariantsEchart.yAxis[ 3 ].show = false;
        STATE.mainVisualizeProteoformsVariantsEchart.grid[ 0 ].top = "10%";
        STATE.mainVisualizeProteoformsVariantsEchart.grid[ 2 ].top = "10%";
        STATE.mainVisualizeProteoformsVariantsEchart.dataZoom[ 1 ].top = "10%";
    }
    MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART.setOption(STATE.mainVisualizeProteoformsVariantsEchart);
 }

/**
 * Resets all proteoform filters to default values.
 */
function MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART_resetFeatureSpecificProteoformFilters( ) {
    SETTINGS._main_visualize_proteoforms_PFMinNoSamples = 0;
    SETTINGS._main_visualize_proteoforms_explicitPFs = [ ];
}

/**
 * Adds a heatmap type series to the MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART annotations track grid.
 * 
 * @param {string} label - The label, i.e., the name, of the annotation.
 * @param {Array} segments - The segments, i.e., two - separated relative positions, at which the annotation shall be displayed.
 * @param {int} track - The track on which the annotation shall be displayed; Has to be 0, 2 and 4 for the bottom, mid and top track, respectively.
 * @param {string} color - HEX format color used for the annotation.
 */
function MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART_addAnnotation( label, segments, track, color ) {
    let positions = [ ];
    for (let segment of segments.split( "," ) ) {
        let segmentStart = STATE.mainVisualizeProteoformsVariantsEchart.xAxis[ 0 ].data.indexOf( segment.split( "-" )[ 0 ] );
        let segmentEnd = STATE.mainVisualizeProteoformsVariantsEchart.xAxis[ 0 ].data.indexOf( segment.split( "-" )[ 1 ] );
        for (let p = segmentStart; p <= segmentEnd; p++) {
            positions.push( parseInt( p ) );
        }
    }
    STATE.mainVisualizeProteoformsVariantsEchart.series.push(
        {
            type: 'heatmap',
            name: 'CUSTOM_TRACK_' + label,
            xAxisIndex: 3,
            yAxisIndex: 3,
            data: positions.map( p => [ p, track, 0 ] ),
            itemStyle: {
                color: color,
                borderType: [ 5, 10 ]
            },
            animation: false,
            hoverLayerThreshold: 1000,
            progressive: 0
        }
    );
}

/**
 * Computes a object from STATE.perPositionVariantInformation that yields the number of occurences of each unique variant at a given position.
 * 
 * @param {string} p - The position at which variants shall be counted.
 * @returns Counts per position state.
 */
function MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART_getPositionComposition(p) {
    let states = {};
    let content;
    let observationsNo = 0;
    for (let proteoformKey of STATE.mainVisualizeProteoformsVariantsEchart.yAxis[0].data) {
        if (proteoformKey === "Wild Type Protein") {
            continue;
        } else {
            content = proteoformKey in STATE.mainVisualizeProteoformsPositionInformation[p] ? STATE.mainVisualizeProteoformsPositionInformation[p][proteoformKey] : STATE.mainVisualizeProteoformsPositionInformation[p]['Wild Type Gene'];
            if (proteoformKey === "Wild Type Gene") {
                proteoformKey = "WildType";
            }
            if (content in states) {
                states[content] += STATE.vDict.features[STATE.mainVisualizeSelectedFeature].allocatedProtein.proteoforms[proteoformKey].samples.length;
            } else {
                states[content] = STATE.vDict.features[STATE.mainVisualizeSelectedFeature].allocatedProtein.proteoforms[proteoformKey].samples.length;
            }
        }
        observationsNo += STATE.vDict.features[STATE.mainVisualizeSelectedFeature].allocatedProtein.proteoforms[proteoformKey].samples.length;
        STATE.mainVisualizeProteoformsVariantsEchart.yAxis[2].name = "Sample Proportion (n = " + observationsNo + ")";
    }
    delete states.undefined;
    return states;
};

/* METHODS TO MANIPULATE AND INTERACT WITH `POSITION_INFORMATION_ECHART` */
var MAIN_VISUALIZE_PROTEOFORMS_POSITIONINFORMATION_ECHART;

/**
 * Opens the position information dialog with the specified selection object. The selection object has to comprise a name property that represents
 * the selected position in string format X+Y (i.e. residue position + inserted positions) and a data property that represents the data stored in
 * a cell of the variants heatmap, i.e., [ POSITION_INDEX, PROTEOFORM_INDEX, CONTENT_ENCODING ]
 * 
 * @param {object} selection - Object describing a selected cell in the variants heatmap.
 */
function MAIN_VISUALIZE_PROTEOFORMS_POSITIONINFORMATION_openDialog( selection ) {
    let position = selection.name;
    let proteoformName = STATE.mainVisualizeProteoformsVariantsEchart.yAxis[0].data[selection.data[1]];
    proteoformName = proteoformName.startsWith( "Wild Type" ) ? "Wild Type" : proteoformName;
    let mutatedResidue = AMINO_ACID_DECODING[selection.data[2]];
    let wildTypeResidue;
    if (position.split("+")[1] === "0") {
        wildTypeResidue = AMINO_ACID_DECODING[STATE.mainVisualizeProteoformsVariantsEchart.series[0].data.filter(e => e[0] == selection.data[0] && e[1] == STATE.mainVisualizeProteoformsVariantsEchart.yAxis[0].data.indexOf("Wild Type Gene"))[0][2]];
    } else {
        wildTypeResidue = "None";
    }
    let noVariants = STATE.mainVisualizeProteoformsVariantsEchart.series[1].data.filter(e => e[0] == position)[0][1]
    let positionComposition = MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART_getPositionComposition(position);
    $( '#main-visualize-proteoforms-positioninformation-proteoformID' ).html( 'Proteoform <b>' + proteoformName + '</b>' );
    $( '#main-visualize-proteoforms-positioninformation-noSamples' ).html( 'No. Samples <b>' + STATE.vDict.features[ STATE.mainVisualizeSelectedFeature ].allocatedProtein.proteoforms[ proteoformName.replace( " ", "" )  ].samples.length + '</b>' );
    $( '#main-visualize-proteoforms-positioninformation-position' ).html( 'Relative Position <b>' + position + '</b>' );
    $( '#main-visualize-proteoforms-positioninformation-variant' ).html( 'Variant <b>' + AMINO_ACID_DESIGNATION[wildTypeResidue] + ' &#8594; ' + AMINO_ACID_DESIGNATION[mutatedResidue] + '</b>' );
    $( '#main-visualize-proteoforms-positioninformation-noVariants' ).html( 'No. Variants <b>' + noVariants + '</b>' );
    MAIN_VISUALIZE_PROTEOFORMS_POSITIONINFORMATION_ECHART = echarts.init(document.getElementById("main-visualize-proteoforms-positioninformation-echart"), { "renderer": "canvas" });
    STATE.mainVisualizeProteoformsPositioninformationEchart.series[0].data = [];
    for (let [key, value] of Object.entries(positionComposition)) {
        STATE.mainVisualizeProteoformsPositioninformationEchart.series[0].data.push({
            name: AMINO_ACID_DESIGNATION[key] + ", " + value + " of " + Object.values(positionComposition).reduce((i1, i2) => i1 + i2),
            value: value,
            itemStyle: {
                color: AMINO_ACID_COLOR[key],
                borderWidth: key === mutatedResidue ? 5 : 0
            }
        });
    }
    MAIN_VISUALIZE_PROTEOFORMS_POSITIONINFORMATION_ECHART.setOption(STATE.mainVisualizeProteoformsPositioninformationEchart, true);
    STATE.mainVisualizeProteoformsSelection[ STATE.mainVisualizeSelectedFeature ] = { "name": selection.name, "data": selection.data };
    MAIN_VISUALIZE_PROTEOFORMS_3DMOL_highlightSelectedPosition( );
    displayComponent( "main-visualize-proteoforms-positioninformation", "block" );
}

/**
 * Closes the position information dialog an resets its content as well as any selection.
 */
function MAIN_VISUALIZE_PROTEOFORMS_POSITIONINFORMATION_closeDialog( ) {
    STATE.mainVisualizeProteoformsSelection[ STATE.mainVisualizeSelectedFeature ] = null;
    MAIN_VISUALIZE_PROTEOFORMS_3DMOL_highlightSelectedPosition( );
    hideComponent("main-visualize-proteoforms-positioninformation");
}

/* Methods to be executed once the application has loaded. */
window.onload = _ => {
    // Fetch local json schema and initialize json validator with it (used to validate loaded .vdict.json files).
    fetch( "./MUSIALvDictSchema.json" ).then( content => content.json( ) ).then( promise => {
        SCHEMA_VALIDATOR = new djv( );
        SCHEMA_VALIDATOR.addSchema( 'MUSIAL_VDICT_SCHEMA', promise );
    } );

    // Assign functionality to button elements contained within the main-menu element.
    document.getElementById("main-menu-linkvisualize").onclick = _ => toggleComponent('visualize-overview');
    document.getElementById("main-menu-linklegalnotice").onclick = _ => toggleComponent('legalnotice');

    // Assign functionality to elements contained within components.
    document.getElementById("main-visualize-overview-fileinput").onchange = fileInputChange;
    document.getElementById("main-visualize-proteoforms-backbutton").onclick = _ => toggleComponent('visualize-overview');
    document.getElementById("main-visualize-proteoforms-toolFilter").onclick = _ => MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART_openFilterDialog( );
    document.getElementById("main-visualize-proteoforms-toolTracks").onclick = _ => MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART_openTracksDialog( );
    document.getElementById("main-visualize-proteoforms-positioninformation-closebutton").onclick = _ => MAIN_VISUALIZE_PROTEOFORMS_POSITIONINFORMATION_closeDialog( );

    // Initialize the `MAIN_VISUALIZE_OVERVIEW_ECHART` component.
    MAIN_VISUALIZE_OVERVIEW_ECHART = echarts.init(document.getElementById("main-visualize-overview-echart"), { "renderer": "canvas" });
    MAIN_VISUALIZE_OVERVIEW_ECHART.setOption(STATE.mainVisualizeOverviewEchart);
    MAIN_VISUALIZE_OVERVIEW_ECHART.on('click', function (params) {
        let selectedFeatureName = params.data.name;
        if (params.data.children === undefined) {
            let items = [
                { type: 'custom', markup: '<div style="text-align: center;"><b style="padding: 8px;">' + selectedFeatureName + '</b></div>' },
                { type: 'seperator' }
            ];
            if (STATE.vDict.features[selectedFeatureName].allocatedProtein !== {}) {
                items.push({
                    type: 'button', label: 'Explore Proteoforms (' + Object.keys(STATE.vDict.features[selectedFeatureName].allocatedProtein.proteoforms).length + ')', onClick: () => {
                        STATE.mainVisualizeSelectedFeature = selectedFeatureName;
                        document.getElementById("main-visualize-proteoforms-featureinformation").innerHTML = selectedFeatureName;
                        toggleComponent('visualize-proteoforms');
                        MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART_resetFeatureSpecificProteoformFilters( );
                        MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART_setChain('A');
                        MAIN_VISUALIZE_PROTEOFORMS_3DMOL_setSelectedFeature( );
                        // Reset previous selection information.
                        let selection = STATE.mainVisualizeProteoformsSelection[ STATE.mainVisualizeSelectedFeature ];
                        if ( selection != undefined && selection != null ) {
                            MAIN_VISUALIZE_PROTEOFORMS_POSITIONINFORMATION_openDialog( selection );
                            MAIN_VISUALIZE_PROTEOFORMS_3DMOL_highlightSelectedPosition( );
                        } else {
                            MAIN_VISUALIZE_PROTEOFORMS_POSITIONINFORMATION_closeDialog( );
                        }
                    }
                });
            }
            new Contextual({
                items: items,
                width: '182px'
            });
        }
    });

    // Initialize the `MAIN_VISUALIZE_PROTEOFORMS_3DMOL` component.
    MAIN_VISUALIZE_PROTEOFORMS_3DMOL = $3Dmol.createViewer(
        $('#main-visualize-proteoforms-3dmol'),
        { backgroundColor: '#FAFAFC', id: 'PROTEIN_STRUCTURE_VIEW_CANVAS', antialias: true, cartoonQuality: 6 }
    );

    // Initialize the `MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART` component.
    MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART = echarts.init(document.getElementById("main-visualize-proteoforms-variants-echart"), { "renderer": "canvas", "width": 'auto', "height": 'auto' });
    MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART.setOption(STATE.mainVisualizeProteoformsVariantsEchart, {replaceMerge: ['series']});

    // Initialize the `MAIN_VISUALIZE_PROTEOFORMS_POSITIONINFORMATION_ECHART` component.
    STATE.mainVisualizeProteoformsVariantsEchart.tooltip.formatter = ( content ) => {
        if (content.seriesIndex === 0) {
            MAIN_VISUALIZE_PROTEOFORMS_POSITIONINFORMATION_openDialog( content );
        }
    }
};

/**
 * Hides the specified component.
 * 
 * @param {string} - Value of the html id attribute of the component to hide. 
 */
function hideComponent(id) {
    document.getElementById(id) ? document.getElementById(id).style.display = "none" : null;
}

/**
 * Displays the specified component.
 * 
 * @param {string} id - Value of the html id attribute of the component to display.
 * @param {string} s - CSS style value to use for displaying the component. Default is `block`.
 */
function displayComponent(id, s) {
    if ( s === null ) {
        s = 'block';
    }
    document.getElementById(id) ? document.getElementById(id).style.display = s : null;
}

/**
 * Displays the specified component. All other components are hidden.
 * 
 * @param {string} id - Value of the html id attribute of the component to display.
 */
function toggleComponent(id) {
    for (let key of ["visualize-overview", "visualize-proteoforms", "legalnotice"]) {
        if (id === key) {
            displayComponent("main-" + key, "block");
        } else {
            hideComponent("main-" + key);
        }
    }
}

/**
 * Handles the user selection of a variant dictionary, i.e. <FILENAME>.vdict.json file.
 */
function fileInputChange() {
    initializeState(document.getElementById("main-visualize-overview-fileinput").files[0]);
}

/**
 * Initializes the `STATE` variable based on the content of a MUSIAL v2.1 variants dictionary.
 * 
 * @param {file} file - Specifies the content of a MUSIAL v2.1 variants dictionary.
 */
function initializeState(file) {
    var fileReader = new FileReader();
    var fileContent;
    fileReader.onload = function (event) {
        fileContent = event.target.result;
        let parsedContent = JSON.parse(fileContent);
        let validationResponse = SCHEMA_VALIDATOR.validate( 'MUSIAL_VDICT_SCHEMA', parsedContent );
        if ( validationResponse === undefined ) {
            STATE.vDict = parsedContent;
        } else {
            let dataPath = validationResponse.dataPath.split( "'" ).filter( e => e !== '' && e.indexOf( ')' ) == -1 && e.indexOf( '(' ) == -1 && e.indexOf( ']' ) == -1 && e.indexOf( '[' ) == -1 && e.indexOf( 'decodeURIComponent' ) == -1 );
            dataPath = dataPath.map( e => {
                if ( e.indexOf( '+i' ) !== -1 ) {
                    return 'ITEM';
                } else {
                    return e;
                }
            } );
            Swal.fire( {
                icon: 'error',
                title: 'Input Validation Failed!',
                text: 'The validation of the uploaded variants dictionary failed; missing required properties in the following data path:',
                html: `
                <p>The validation of the uploaded variants dictionary failed; missing required properties in the following data path:</p>
                <p>` + dataPath.join( ' <i class="fa-solid fa-caret-right"></i> ' ) + `</p>
                `,
                width: '50%',
                height: '50%'
            } );
        }
    };
    if (file !== undefined) {
        fileReader.readAsText(file);
        // Add features parsed from a `.vDict.json` file to the `STATE`.
        window.setTimeout(
            _ => {
                if ( STATE.vDict === null ) {
                    return;
                }
                let chr = STATE.vDict.chromosome;
                let fileName = file.name.split('.')[0];
                for (const [ftrName, ftrObj] of Object.entries(STATE.vDict.features)) {
                    if ('class' in ftrObj.annotations && ftrObj.annotations.class !== null) {
                        MAIN_VISUALIZE_OVERVIEW_ECHART_addFeature(chr, ftrObj.annotations.class, ftrName);
                    } else {
                        MAIN_VISUALIZE_OVERVIEW_ECHART_addFeature(chr, fileName, ftrName);
                    }
                }
            },
            500
        );
    }
}