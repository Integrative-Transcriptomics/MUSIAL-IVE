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

/* Methods that manipulate or to interact with the MAIN_VISUALIZE_OVERVIEW_ECHART object. */
var MAIN_VISUALIZE_OVERVIEW_ECHART;

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
    MAIN_VISUALIZE_PROTEOFORMS_3DMOL.addModel(STATE.vDict.features[STATE.selectedFeature].allocatedProtein.pdb, "pdb");
    MAIN_VISUALIZE_PROTEOFORMS_3DMOL.setStyle(
        {

        },
        {
            cartoon: {
                color: '#E7E7E4',
                opacity: 0.95,
                thickness: 0.2,
                arrows: true
            }
        }
    );
    // Select all positions that are actually reflected in the protein structure and color them according to the number of different variants.
    MAIN_VISUALIZE_PROTEOFORMS_3DMOL.addStyle(
        {
            resi: STATE.mainVisualizeProteoformsVariantsEchart.series[1].data
                .filter(v => { return v[1] > 1 && v[0].split("+")[1] === "0" })
                .map(v => { return v[0].split("+")[0] })
        },
        {
            cartoon: {
                colorfunc: (atom) => {
                    let noVariants = STATE.mainVisualizeProteoformsVariantsEchart.series[1].data.filter(v => { return v[0] === atom.resi + "+0" })[0][1];
                    let clr;
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
                }
            }
        }
    );
    // Zoom to the model and render it.
    MAIN_VISUALIZE_PROTEOFORMS_3DMOL.zoomTo();
    MAIN_VISUALIZE_PROTEOFORMS_3DMOL.render();
};

/**
 * Highlights a specific residue (determined by the residue index/position) of the currently displayed model.
 * 
 * @param {string} position - Position, i.e., residue index (resi) of the position to highlight. 
 * @param {boolean} reset - Whether to reset previous selection. 
 */
function MAIN_VISUALIZE_PROTEOFORMS_3DMOL_highlightResidue(position, reset) {
    if (reset) {
        MAIN_VISUALIZE_PROTEOFORMS_3DMOL.setStyle(
            {
                resi: STATE.selectedResidue[ STATE.selectedFeature ]
            },
            {
                cartoon: {
                    color: '#FFFFFF',
                    thickness: 0.2,
                    arrows: true
                },
                cartoon: {
                    colorfunc: (atom) => {
                        let noVariants = STATE.mainVisualizeProteoformsVariantsEchart.series[1].data.filter(v => { return v[0] === atom.resi + "+0" })[0][1];
                        let clr;
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
                    }
                }
            }
        );
        STATE.selectedResidue[ STATE.selectedFeature ] = null;
    }
    MAIN_VISUALIZE_PROTEOFORMS_3DMOL.addStyle(
        {
            resi: position
        },
        {
            stick: {
                colorfunc: (atom) => {
                    return '#FF5C43';
                },
                radius: 1
            }
        }
    );
    STATE.selectedResidue[ STATE.selectedFeature ] = position;
    MAIN_VISUALIZE_PROTEOFORMS_3DMOL.render();
};

/* METHODS TO MANIPULATE AND INTERACT WITH `MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART` */
var MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART;

function MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART_setChain(chain) {
    // Reset currently stored information.
    STATE.perPositionVariantInformation = {};
    STATE.perProteoformMetaInformation = {};
    STATE.noSamples = 0;
    STATE.noProteoforms = 0;
    STATE.mainVisualizeProteoformsVariantsEchart.xAxis[0].data = [];
    STATE.mainVisualizeProteoformsVariantsEchart.xAxis[1].data = [];
    STATE.mainVisualizeProteoformsVariantsEchart.yAxis[0].data = [];
    STATE.mainVisualizeProteoformsVariantsEchart.yAxis[2].data = [];
    STATE.mainVisualizeProteoformsVariantsEchart.series[0].data = [];
    STATE.mainVisualizeProteoformsVariantsEchart.series[1].data = [];
    STATE.mainVisualizeProteoformsVariantsEchart.series[2].data = [];
    // Initialize temp. variables.
    var position = 1;
    var chainSequence = STATE.vDict.features[STATE.selectedFeature].allocatedProtein.chainSequences[chain];
    var hasTerminated = false;
    // Definition of helper-functions.
    let addPositionVariantInformation = (content, position, proteoform, insertionIndex) => {
        let p = position + "+" + insertionIndex;
        if (p in STATE.perPositionVariantInformation) {
            if (!(proteoform in STATE.perPositionVariantInformation[p])) {
                STATE.perPositionVariantInformation[p][proteoform] = content;
            }
        } else {
            STATE.perPositionVariantInformation[p] = {};
            addPositionVariantInformation(content, position, proteoform, insertionIndex);
        }
    };
    let sortProteoformsByNoSamples = (pfAName, pfBName) => {
        let vpa = parseInt(STATE.vDict.features[STATE.selectedFeature].allocatedProtein.proteoforms[pfAName].samples.length);
        let vpb = parseInt(STATE.vDict.features[STATE.selectedFeature].allocatedProtein.proteoforms[pfBName].samples.length);
        if (vpa > vpb) {
            return 1;
        } else if (vpa == vpb) {
            return 0;
        } else { // vpa < vpb
            return -1;
        }
    };
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
    // Filter proteoforms to display; TODO: Adjust by parameter/user defined filtering function
    var filteredProteoformKeys = Object.keys(STATE.vDict.features[STATE.selectedFeature].allocatedProtein.proteoforms).sort(sortProteoformsByNoSamples).filter(
        proteoformKey => {
            if ( SETTINGS._PROTEOFORMFILTER_EXCLUDEPT && STATE.vDict.features[STATE.selectedFeature].allocatedProtein.proteoforms[ proteoformKey ].annotations.PT == "true" ) {
                // Filter for absence of premature termination; If filter is set. 
                return false;
            } else if ( STATE.vDict.features[STATE.selectedFeature].allocatedProtein.proteoforms[ proteoformKey ].samples.length < SETTINGS._PROTEOFORMFILTER_MINSP ) {
                // Filter for No. samples  below set threshold.
                return false;
            } else if (  parseFloat( STATE.vDict.features[STATE.selectedFeature].allocatedProtein.proteoforms[ proteoformKey ].annotations.VP ) < SETTINGS._PROTEOFORMFILTER_MINVP ) {
                // Filter for variable position percentage below set threshold.
                return false;
            } else {
                // Filter if proteoform name or contained sample is explicitly stated to be included.
                let PFIsIncluded = SETTINGS._PROTEOFORMFILTER_CONSIDEREDPF.length == 0 && SETTINGS._PROTEOFORMFILTER_CONSIDEREDSAMPLES.length == 0;
                let PFIncludesSample = SETTINGS._PROTEOFORMFILTER_CONSIDEREDPF.length == 0 && SETTINGS._PROTEOFORMFILTER_CONSIDEREDSAMPLES.length == 0;
                if ( !PFIsIncluded ) {
                    PFIsIncluded = SETTINGS._PROTEOFORMFILTER_CONSIDEREDPF.includes( proteoformKey );
                }
                if ( !PFIncludesSample ) {
                    PFIncludesSample = SETTINGS._PROTEOFORMFILTER_CONSIDEREDSAMPLES.some( sId => STATE.vDict.features[STATE.selectedFeature].allocatedProtein.proteoforms[ proteoformKey ].samples.includes( sId ) );
                }
                return ( PFIsIncluded || PFIncludesSample ) && proteoformKey !== "WildType";
            }
        }
    );
    STATE.noProteoforms = filteredProteoformKeys.length + 1;
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
        var proteoformVariants = STATE.vDict.features[STATE.selectedFeature].allocatedProtein.proteoforms[proteoformKey].annotations.VSWAB.split('|');
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
    STATE.mainVisualizeProteoformsVariantsEchart.yAxis[0].name = "Proteoforms (m = " + STATE.noProteoforms + ")";
    STATE.mainVisualizeProteoformsVariantsEchart.yAxis[2].data = filteredProteoformKeys;
    // Sort positions in ascending order and add information to EChart series and x-axis.
    let i = 0;
    for (let position of Object.keys(STATE.perPositionVariantInformation).sort(sortPositions)) {
        STATE.mainVisualizeProteoformsVariantsEchart.xAxis[0].data.push(position);
        STATE.mainVisualizeProteoformsVariantsEchart.xAxis[1].data.push(position);
        for (let [proteoform, variant] of Object.entries(STATE.perPositionVariantInformation[position])) {
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
            nS = STATE.vDict.features[STATE.selectedFeature].allocatedProtein.proteoforms['WildType'].samples.length;
        } else if (proteoformKey === "Wild Type Protein") {
            nS = 0;
        } else {
            nS = STATE.vDict.features[STATE.selectedFeature].allocatedProtein.proteoforms[proteoformKey].samples.length;
        }
        totalCounts.push(nS);
        STATE.noSamples += nS;
    }
    STATE.mainVisualizeProteoformsVariantsEchart.series[2].data = totalCounts.map(v => (v / STATE.noSamples).toFixed(4));

    // ...
    let perSampleVP = 0;
    let samplePT = 0;
    for (let proteoformKey of filteredProteoformKeys) {
        if (proteoformKey == "Wild Type Protein") {
            continue;
        } else {
            if (proteoformKey == "Wild Type Gene") {
                proteoformKey = "WildType";
            }
            perSampleVP += STATE.vDict.features[STATE.selectedFeature].allocatedProtein.proteoforms[proteoformKey].samples.length * STATE.vDict.features[STATE.selectedFeature].allocatedProtein.proteoforms[proteoformKey].annotations.VP;
            if (STATE.vDict.features[STATE.selectedFeature].allocatedProtein.proteoforms[proteoformKey].annotations.PT == "true") {
                samplePT += STATE.vDict.features[STATE.selectedFeature].allocatedProtein.proteoforms[proteoformKey].samples.length
            }
        }
    }
    // console.log( STATE.selectedFeature );
    // console.log( "Sample mean VP: " + perSampleVP / STATE.noSamples );
    // console.log( "Sample % PT: " + ( samplePT / STATE.noSamples ) * 100 );
    MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART.setOption(STATE.mainVisualizeProteoformsVariantsEchart);
    MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART.resize();
};
function MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART_getPositionComposition(p) {
    let states = {};
    let content;
    let observationsNo = 0;
    for (let proteoformKey of STATE.mainVisualizeProteoformsVariantsEchart.yAxis[0].data) {
        if (proteoformKey === "Wild Type Protein") {
            continue;
        } else {
            content = proteoformKey in STATE.perPositionVariantInformation[p] ? STATE.perPositionVariantInformation[p][proteoformKey] : STATE.perPositionVariantInformation[p]['Wild Type Gene'];
            if (proteoformKey === "Wild Type Gene") {
                proteoformKey = "WildType";
            }
            if (content in states) {
                states[content] += STATE.vDict.features[STATE.selectedFeature].allocatedProtein.proteoforms[proteoformKey].samples.length;
            } else {
                states[content] = STATE.vDict.features[STATE.selectedFeature].allocatedProtein.proteoforms[proteoformKey].samples.length;
            }
        }
        observationsNo += STATE.vDict.features[STATE.selectedFeature].allocatedProtein.proteoforms[proteoformKey].samples.length;
        STATE.mainVisualizeProteoformsVariantsEchart.yAxis[2].name = "Sample Proportion (n = " + observationsNo + ")";
    }
    delete states.undefined;
    // Compute variability as number of different variants.
    return states;
};

/* METHODS TO MANIPULATE AND INTERACT WITH `POSITION_INFORMATION_ECHART` */
var MAIN_VISUALIZE_PROTEOFORMS_POSITIONINFORMATION_ECHART;

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
                        toggleComponent('visualize-proteoforms');
                        MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART_setChain('A');
                        MAIN_VISUALIZE_PROTEOFORMS_3DMOL_setSelectedFeature( );
                    }
                });
            }
            new Contextual({
                items: items,
                width: '182px'
            });
        } else {
            selectedFeatureName = null;
        }
        STATE.selectedFeature = selectedFeatureName;
        document.getElementById("main-visualize-proteoforms-featureinformation").innerHTML = selectedFeatureName;
    });

    // Initialize the `MAIN_VISUALIZE_PROTEOFORMS_3DMOL` component.
    MAIN_VISUALIZE_PROTEOFORMS_3DMOL = $3Dmol.createViewer(
        $('#main-visualize-proteoforms-3dmol'),
        { backgroundColor: '#FAFAFC', id: 'PROTEIN_STRUCTURE_VIEW_CANVAS', antialias: true, cartoonQuality: 6 }
    );

    // Initialize the `MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART` component.
    MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART = echarts.init(document.getElementById("main-visualize-proteoforms-variants-echart"), { "renderer": "canvas", "width": 'auto', "height": 'auto' });
    STATE.mainVisualizeProteoformsVariantsEchart.toolbox.feature["myTool1"] = {
        show: true,
        title: 'Proteoform Filters',
        icon: 'path://M3.853 54.87C10.47 40.9 24.54 32 40 32H472C487.5 32 501.5 40.9 508.1 54.87C514.8 68.84 512.7 85.37 502.1 97.33L320 320.9V448C320 460.1 313.2 471.2 302.3 476.6C291.5 482 278.5 480.9 268.8 473.6L204.8 425.6C196.7 419.6 192 410.1 192 400V320.9L9.042 97.33C-.745 85.37-2.765 68.84 3.854 54.87L3.853 54.87z',
        onclick: function () {
            Swal.fire({
                title: 'Proteoform Filters',
                width: 1200,
                padding: '1%',
                color: '#6d81ad',
                background: '#EFF0F8',
                html: `
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
                                <td><input id="COMPONENT_PROTEOFORMFILTER_EXCLUDEPT" type="checkbox" data-role="switch"></td>
                            </tr>
                            <tr>
                                <td>Min. Percentage of Variable Positions</td>
                                <td><br><input id="COMPONENT_PROTEOFORMFILTER_MINVP" data-show-min-max="true" data-accuracy="0.1" data-role="slider" data-hint="true" data-hint-position="top"></td>
                            </tr>
                            <tr>
                                <td>Min. No. Samples</td>
                                <td><br><input id="COMPONENT_PROTEOFORMFILTER_MINSP" data-value="1" data-return-type="value" data-show-min-max="true" data-min="1" data-max="` +  Object.keys( STATE.vDict.samples ).length + `" data-accuracy="1" data-role="slider" data-hint="true" data-hint-position="top"></td>
                            </tr>
                            <tr>
                                <td>Include Only</td>
                                <td><input id="COMPONENT__PROTEOFORMFILTER_CONSIDERED" type="text" data-role="taginput" data-tag-trigger="Space"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                `,
                backdrop: `rgba(96, 113, 150, 0.4) no-repeat`
            }).then( _ => {
                SETTINGS._PROTEOFORMFILTER_EXCLUDEPT =  $( "#COMPONENT_PROTEOFORMFILTER_EXCLUDEPT" ).is(':checked');
                SETTINGS._PROTEOFORMFILTER_MINVP = parseFloat( document.getElementById( "COMPONENT_PROTEOFORMFILTER_MINVP" ).value );
                SETTINGS._PROTEOFORMFILTER_MINSP = parseFloat( document.getElementById( "COMPONENT_PROTEOFORMFILTER_MINSP" ).value );
                SETTINGS._PROTEOFORMFILTER_CONSIDEREDPF = [ ];
                SETTINGS._PROTEOFORMFILTER_CONSIDEREDSAMPLES = [ ];
                for ( let considered of document.getElementById( "COMPONENT__PROTEOFORMFILTER_CONSIDERED" ).value.split( "," ) ) {
                    if ( considered.startsWith( "PF" ) && considered in STATE.vDict.features[ STATE.selectedFeature ].allocatedProtein.proteoforms  ) {
                        SETTINGS._PROTEOFORMFILTER_CONSIDEREDPF.push( considered );
                    } else if ( considered in STATE.vDict.samples ) {
                        SETTINGS._PROTEOFORMFILTER_CONSIDEREDSAMPLES.push( considered );
                    }
                }
                MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART_setChain('A');
                MAIN_VISUALIZE_PROTEOFORMS_3DMOL_setSelectedFeature( );
            });
        }
    };
    MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART.setOption(STATE.mainVisualizeProteoformsVariantsEchart);

    // Initialize the `MAIN_VISUALIZE_PROTEOFORMS_POSITIONINFORMATION_ECHART` component.
    STATE.mainVisualizeProteoformsVariantsEchart.tooltip.formatter = (p) => {
        if (p.seriesIndex === 0) {
            let position = p.name;
            let proteoformName = STATE.mainVisualizeProteoformsVariantsEchart.yAxis[0].data[p.data[1]];
            let mutatedResidue = AMINO_ACID_DECODING[p.data[2]];
            let wildTypeResidue;
            if (position.split("+")[1] === "0") {
                wildTypeResidue = AMINO_ACID_DECODING[STATE.mainVisualizeProteoformsVariantsEchart.series[0].data.filter(e => e[0] == p.data[0] && e[1] == STATE.mainVisualizeProteoformsVariantsEchart.yAxis[0].data.indexOf("Wild Type Gene"))[0][2]];
            } else {
                wildTypeResidue = "None";
            }
            let sampleProportion = STATE.mainVisualizeProteoformsVariantsEchart.series[2].data[STATE.mainVisualizeProteoformsVariantsEchart.yAxis[0].data.indexOf(proteoformName)];
            let noVariants = STATE.mainVisualizeProteoformsVariantsEchart.series[1].data.filter(e => e[0] == position)[0][1]
            let positionComposition = MAIN_VISUALIZE_PROTEOFORMS_VARIANTS_ECHART_getPositionComposition(position);
            let html = `
                <div>
                    <p>Proteoform <b>` + proteoformName + `</b>&nbsp;(` + Math.round(sampleProportion * STATE.noSamples) + ` sample(s))</p>
                    <p>Relative Position <b>` + position + `</b></p>
                    <p>Variant <b>` + AMINO_ACID_DESIGNATION[wildTypeResidue] + ` &#8594; ` + AMINO_ACID_DESIGNATION[mutatedResidue] + `</b></p>
                    <p>Total Number of Variants <b>` + noVariants + `</b></p>
                    <div id="main-visualize-proteoforms-positioninformation-echart" style="width: 340px; height: 230px;"></div>
                </div>
            `;
            document.getElementById("main-visualize-proteoforms-positioninformation").innerHTML = html;
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
            MAIN_VISUALIZE_PROTEOFORMS_POSITIONINFORMATION_ECHART.setOption(STATE.mainVisualizeProteoformsPositioninformationEchart);
            MAIN_VISUALIZE_PROTEOFORMS_3DMOL_highlightResidue(position.split("+")[0], true);
        } else {
            document.getElementById("main-visualize-proteoforms-positioninformation").innerHTML = "";
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
            console.log( dataPath );
            dataPath = dataPath.map( e => {
                if ( e.indexOf( '+i' ) !== -1 ) {
                    return 'ITEM';
                } else {
                    return e;
                }
            } );
            console.log( dataPath );
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