/**
    MUSIAL-IVE v2.0
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

/**
 * Definition of constants.
 */
const AMINO_ACID_ENCODING = {
    // Polar (positive), Basic
    "H": 1, // HIS
    "K": 2, // LYS
    "R": 3, // ARG
    // Polar (negative), Acidic
    "D": 4, // ASP
    "E": 5, // GLU
    // Polar (neutral)
    "S": 6, // SER
    "T": 7, // THR
    "N": 8, // ASN
    "Q": 9, // GLN
    // Sulfur bridge forming
    "C": 10, // CYS
    // Aromatic
    "F": 11, // PHE
    "W": 12, // TRP
    "Y": 13, // TYR
    // Aliphatic
    "A": 14, // ALA
    "V": 15, // VAL
    "L": 16, // LEU
    "I": 17, // ILE
    "M": 18, // MET
    "P": 19, // PRO
    "G": 20, // GLY
    // Other
    "X": 21, // ANY
    "*": 22, // TER
    "-": 23 // DEL
};
const AMINO_ACID_DECODING = Object.assign( { }, ...Object.entries( AMINO_ACID_ENCODING ).map( ( [ key, value ] ) => ({ [ value ] : key } ) ) );
const AMINO_ACID_DESIGNATION = {
    // Polar (positive), Basic
    "H": "His (H)", // HIS
    "K": "Lys (K)", // LYS
    "R": "Arg (R)", // ARG
    // Polar (negative), Acidic
    "D": "Asp (D)", // ASP
    "E": "Glu (E)", // GLU
    // Polar (neutral)
    "S": "Ser (S)", // SER
    "T": "Thr (T)", // THR
    "N": "Asn (N)", // ASN
    "Q": "Glu (Q)", // GLN
    // Sulfur bridge forming
    "C": "Cys (C)", // CYS
    // Aromatic
    "F": "Phe (F)", // PHE
    "W": "Trp (W)", // TRP
    "Y": "Tyr (Y)", // TYR
    // Aliphatic
    "A": "Ala (A)", // ALA
    "V": "Val (V)", // VAL
    "L": "Leu (L)", // LEU
    "I": "Iso (I)", // ILE
    "M": "Met (M)", // MET
    "P": "Pro (P)", // PRO
    "G": "Gly (G)", // GLY
    // Other
    "X": "Any (X)", // ANY
    "*": "Ter.", // TER
    "-": "Del." // DEL
};
const AMINO_ACID_COLOR = {
    // Polar (positive), Basic
    "H": "#96CDEB", // HIS
    "K": "#96CDEB", // LYS
    "R": "#96CDEB", // ARG
    // Polar (negative), Acidic
    "D": "#FF7A83", // ASP
    "E": "#FF7A83", // GLU
    // Polar (neutral)
    "S": "#678D58", // SER
    "T": "#678D58", // THR
    "N": "#678D58", // ASN
    "Q": "#678D58", // GLN
    // Sulfur bridge forming
    "C": "#FFEC70", // CYS
    // Aromatic
    "F": "#38369A", // PHE
    "W": "#38369A", // TRP
    "Y": "#38369A", // TYR
    // Aliphatic
    "A": "#41637F", // ALA
    "V": "#41637F", // VAL
    "L": "#41637F", // LEU
    "I": "#41637F", // ILE
    "M": "#41637F", // MET
    "P": "#41637F", // PRO
    "G": "#41637F", // GLY
    // Other
    "X":"#524632", // ANY
    "*": "#FF0099", // TER
    "-": "#212227" // DEL
}

/**
 * The `SETTINGS` variable is used to store variables used by the web-app, e.g. colors.
 * `SETTINGS` that shall not be changed by user interactions start with a `_` symbol.
 */
var SETTINGS = {
    "_verbose": true,
    "_excludePastFirstTerminationVariants": true
};

/**
 * The `STATE` variable is used to store the current state of the application, i.e. currently loaded data and user interaction.
 */
var STATE = {
    "vDict": null,
    "selectedFeature": null,
    "selectedChain": null,
    "highlightedResidues": [],
    "perPositionVariantInformation": {},
    "perProteoformMetaInformation": {},
    "noProteoforms": null,
    "noSamples": null,
    "featureOverviewEchartOption": {
        title: {
            text: 'Leaf Node Color: Mean Proteoform Variant Positions',
            bottom: '5%',
            right: 'center',
            textStyle: {
                color: '#607196',
                fontSize: 12
            }
        },
        toolbox: {
            feature: {

            },
            bottom: '2%',
            left: '1%'
        },
        visualMap: {
            min: -1,
            max: 10,
            range: [0, 10],
            dimension: 0,
            seriesIndex: 0,
            hoverLink: true,
            inverse: false,
            orient: 'horizontal',
            itemHeight: 1000,
            bottom: '2%',
            align: 'left',
            right: 'center',
            text: ['≥ 10%', '0%'],
            textStyle: {
                color: '#607196',
                fontSize: 12
            },
            calculable: false,
            inRange: {
                color: ['#5F8FFF', '#FFDE5F', '#FF5F8F' ] //, '#6DE824', '#5FEAFF']
            },
            outOfRange: {
                color: '#607196'
            },
            formatter: (value) => {
                if ( value === -1 ) {
                    return 'No Feature';
                } else {
                    return value + "%";
                }
            }
        },
        series: [
            {
                type: 'tree',
                symbol: 'circle',
                symbolSize: 28,
                edgeShape: 'curve',
                roam: true,
                expandAndCollapse: true,
                initalTreeDepth: 2,
                right: '10%',
                left: '10%',
                label: {
                    position: 'right',
                    fontWeight: 'bold',
                    fontSize: 11,
                    textBorderColor: '#EFF0F8',
                    textBorderWidth: 2
                },
                data: []
            }
        ]
    },
    "proteoformVariantsEchartOption": {
        title: [ ],
        grid: [
            {
                id: 'GRID_VARIANTS_HEATMAP',
                top: '10%',
                bottom: '10%',
                left: '10%',
                right: '10%',
            },
            {
                id: 'GRID_POSITION_VARIABILITY',
                top: '2%',
                bottom: '92.5%',
                left: '10%',
                right: '10%'
            },
            {
                id: 'GRID_PROTEOFORM_PROPORTION',
                top: '10%',
                bottom: '10%',
                left: '91.5%',
                right: '5%'
            }
        ],
        tooltip: {
            trigger: 'item',
            triggerOn: 'click',
            alwaysShowContent: true,
            axisPointer: {
                type: 'cross'
            },
            position: [ '1%', '-85%' ],
            extraCssText: "height: 80%; width: 22%; overflow-y: scroll;",
            borderColor: '#607196',
            borderWidth: 0,
            formatter: ( p ) => {
                if ( p.seriesIndex === 0 ) {
                    let position = p.name;
                    let proteoformName = STATE.proteoformVariantsEchartOption.yAxis[ 0 ].data[ p.data[ 1 ] ];
                    if ( position.split( "+" )[ 1 ] === "0" ) {
                        let mutatedResidue = AMINO_ACID_DECODING[ p.data[ 2 ] ];
                        let wildTypeResidue = AMINO_ACID_DECODING[ STATE.proteoformVariantsEchartOption.series[ 0 ].data.filter( e => e[ 0 ] == p.data[ 0 ] && e[ 1 ] == STATE.proteoformVariantsEchartOption.yAxis[ 0 ].data.indexOf( "Wild Type Gene" ) )[ 0 ][ 2 ] ];
                        let sampleProportion =  STATE.proteoformVariantsEchartOption.series[ 2 ].data[ STATE.proteoformVariantsEchartOption.yAxis[ 0 ].data.indexOf( proteoformName ) ];
                        let noVariants = STATE.proteoformVariantsEchartOption.series[ 1 ].data.filter( e => e[ 0 ] == position )[ 0 ][ 1 ]
                        let positionComposition = PROTEOFORM_VARIANTS_ECHART_getPositionComposition( position );
                        console.log( positionComposition );
                        let html = `
                            <div>
                                <p>Proteoform <b>` + proteoformName + `</b>&nbsp;(` + Math.round( sampleProportion * STATE.noSamples ) + ` of ` + STATE.noSamples + ` samples)</p>
                                <p>Relative Position <b>` + position + `</b></p>
                                <p>Variant <b>` + AMINO_ACID_DESIGNATION[ wildTypeResidue ] + ` &#8594; ` + AMINO_ACID_DESIGNATION[ mutatedResidue ] + `</b></p>
                                <p>Total Number of Variants <b>` + noVariants + `</b></p>
                                <div id="position_information_echart_container" style="width: 340px; height: 230px;"></div>
                            </div>
                        `;
                        document.getElementById( "main-visualize_proteoforms_position_information_container" ).innerHTML = html;
                        POSITION_INFORMATION_ECHART = echarts.init(document.getElementById("position_information_echart_container"), { "renderer": "canvas" });
                        STATE.positionVariantCompositionEchartOption.series[ 0 ].data = [ ];
                        for ( let [ key, value ] of Object.entries( positionComposition ) ) {
                            STATE.positionVariantCompositionEchartOption.series[ 0 ].data.push( {
                                name: AMINO_ACID_DESIGNATION[ key ] + ", " + value + " of " + Object.values( positionComposition ).reduce( ( i1, i2 ) => i1 + i2 ),
                                value: value,
                                itemStyle: {
                                    color: AMINO_ACID_COLOR[ key ],
                                    borderWidth: key === mutatedResidue ? 5 : 0
                                }
                            } );
                        }
                        POSITION_INFORMATION_ECHART.setOption( STATE.positionVariantCompositionEchartOption );
                        PROTEIN_STRUCTURE_VIEWER_highlightResidue( position.split( "+" )[ 0 ], true );
                    }
                } else {
                    document.getElementById( "main-visualize_proteoforms_position_information_container" ).innerHTML = "";
                }
            }
        },
        axisPointer: {
            link: {
                xAxisIndex: [ 0 ],
                yAxisIndex: [ 0 ]
            },
            snap: true,
            triggerTooltip: false,
            triggerOn: 'mousemove',
            show: true
        },
        xAxis: [
            {
                id: 'XAXIS_VARIANTS_HEATMAP',
                type: 'category',
                gridIndex: 0,
                data: [ ],
                splitLine: {
                    show: true,
                    interval: 0
                },
                name: 'Global Proteoform Position',
                nameLocation: 'center',
                nameGap: 25,
                nameTextStyle: {
                    fontWeight: 'bold'
                }
            },
            {
                id: 'XAXIS_POSITION_VARIABILITY',
                type: 'category',
                gridIndex: 1,
                show: false,
                data: [ ]
            },
            {
                id: 'XAXIS_PROTEOFORM_PROPORTION',
                min: 0.0,
                max: 1.0,
                type: 'value',
                gridIndex: 2,
                minInterval: 0.5,
                show: true,
                data: [ 0.0, 1.0 ]
            }
        ],
        yAxis: [
            {
                id: 'YAXIS_VARIANTS_HEATMAP',
                type: 'category',
                gridIndex: 0,
                inverse: false,
                data: [ ],
                splitLine: {
                    show: true,
                    interval: 0
                },
                name: 'Proteoforms',
                nameLocation: 'center',
                nameGap: 130,
                nameTextStyle: {
                    fontWeight: 'bold'
                }
            },
            {
                id: 'YAXIS_POSITION_VARIABILITY',
                type: 'value',
                gridIndex: 1,
                inverse: false,
                axisTick: {
                    show: false
                },
                axisLabel: {
                    show: false
                },
                name: 'No. Variants',
                nameLocation: 'center',
                nameRotate: 0,
                nameGap: 70,
                nameTextStyle: {
                    fontWeight: 'bold'
                }
            },
            {
                id: 'YAXIS_PROTEOFORM_PROPORTION',
                type: 'category',
                gridIndex: 2,
                show: true,
                axisLabel: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                data: [ ],
                name: 'Sample Proportion',
                nameLocation: 'center',
                nameGap: -100,
                nameTextStyle: {
                    fontWeight: 'bold'
                }
            }
        ],
        visualMap: [
            {
                type: 'piecewise',
                pieces: [
                    // Polar (positive), Basic
                    { min: 1, max: 3, color: "#96CDEB", label: "Polar, Positive" },
                    // Polar (negative), Acidic
                    { min: 4, max: 5, color: "#FF7A83", label: "Polar, Negative" },
                    // Polar (neutral)
                    { min: 6, max: 9, color: "#678D58", label: "Polar, Neutral" },
                    // Sulfur bridge forming
                    { min: 10, max: 10, color: "#FFEC70", label: "Cysteine" },
                    // Aromatic
                    { min: 11, max: 13, color: "#38369A", label: "Aromatic" },
                    // Aliphatic
                    { min: 14, max: 20, color: "#41637F", label: "Aliphatic" },
                    // Deletion
                    { min: 23, max: 23, color: "#212227", label: "Deletion" },
                    // Termination
                    { min: 22, max: 22, color: "#FF0099", label: "Termination" },
                    // Any
                    { min: 21, max: 21, color: "#524632", label: "Unknown/Any" }
                ],
                seriesIndex: [0],
                show: false,
                orient: 'vertical',
                align: 'left',
                right: '1%',
                top: 'center'
            },
            {
                type: 'piecewise',
                pieces: [
                    {
                        gt: 0,
                        lte: 1,
                        color: '#607196',
                        label: '1'
                    },
                    {
                        gt: 1,
                        lte: 2,
                        color: '#9c73af',
                        label: '2'
                    },
                    {
                        gt: 2,
                        lte: 4,
                        color: '#e56b9d',
                        label: '>2'
                    },
                    {
                        gt: 4,
                        lte: 8,
                        color: '#ff7764',
                        label: '>4'
                    },
                    {
                        gt: 8,
                        lte: 23,
                        color: '#ffa600',
                        label: '>8'
                    }
                ],
                seriesIndex: 1,
                show: false,
                selectMode: false,
                itemWidth: 4,
                itemHeight: 10,
                textGap: 1,
                itemGap: 4,
                orient: 'horizontal',
                top: '4.5%',
                left: '5%'

            }
        ],
        series: [
            {
                type: 'heatmap',
                xAxisIndex: 0,
                yAxisIndex: 0,
                data: [],
                itemStyle: {
                    borderColor: '#fafafc',
                    borderWidth: 0.2
                },
                progressive: 1000,
                animation: false
            },
            {
                type: 'line',
                xAxisIndex: 1,
                yAxisIndex: 1,
                data: [],
                smooth: false,
                showSymbol: false
            },
            {
                type: 'bar',
                xAxisIndex: 2,
                yAxisIndex: 2,
                data: [],
                showSymbol: false,
                smooth: false,
                step: true,
                itemStyle: {
                    opacity: 0.8,
                    color: '#607196'
                }
            }
        ]
    },
    "positionVariantCompositionEchartOption": {
        legend: {
            type: 'scroll',
            right: 'right',
            orient: 'vertical',
            textStyle: {
                fontSize: 9
            },
            selectMode: 'false'
        },
        series: [
            {
                type: 'pie',
                radius: ['45%', '60%'],
                center: ['30%', '50%'],
                avoidLabelOverlap: true,
                itemStyle: {
                    borderRadius: 4
                },
                label: {
                    show: false,
                    position: 'center'
                },
                labelLine: {
                    show: false
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 9,
                        color: '#1c1c1c'
                    }
                },
                data: [ ]
            }
          ]
    }
};

var FEATURE_OVERVIEW_ECHART;
/**
 * METHODS TO MANIPULATE AND INTERACT WITH `FEATURE_OVERVIEW_ECHART`
 */
function FEATURE_OVERVIEW_ECHART_addFeature(chr, cls, ftr) {
    let featureOverviewData = STATE.featureOverviewEchartOption.series[0].data;
    let chrLevelNode;
    let clsLevelNode;
    let ftrLevelNode;
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
    if (chrLevelNode.children.filter(node => node.name === cls).length == 0) {
        clsLevelNode = {
            name: cls,
            value: -1,
            symbol: 'emptyCircle',
            symbolSize: 12,
            children: []
        };
        STATE.featureOverviewEchartOption.clsLevelTotal += 1;
        chrLevelNode.children.push(clsLevelNode);
    } else {
        clsLevelNode = chrLevelNode.children.filter(node => node.name === cls)[0];
    }
    if (clsLevelNode.children.filter(node => node.name === ftr).length == 0) {
        var noProteoforms = 0;
        var sumPercVariantPositions = 0;
        for ( let proteoformName of Object.keys( STATE.vDict.features[ ftr ].allocatedProtein.proteoforms ) ) {
            if ( proteoformName === "WildType" ) {
                continue;
            }
            noProteoforms += 1;
            sumPercVariantPositions += parseFloat( STATE.vDict.features[ ftr ].allocatedProtein.proteoforms[ proteoformName ].annotations.VP );
        }
        ftrLevelNode = {
            name: ftr,
            value: noProteoforms == 0 ? 0.0 : ( sumPercVariantPositions / noProteoforms ).toFixed( 1 ),
            symbolSize: 14,
            symbol: 'circle',
        };
        clsLevelNode.children.push(ftrLevelNode);
    }
    FEATURE_SELECTION_ECHART.setOption(STATE.featureOverviewEchartOption);
};

var PROTEIN_STRUCTURE_VIEWER;
/**
 * METHODS TO MANIPULATE AND INTERACT WITH `PROTEIN_STRUCTURE_VIEW`
 */
function PROTEIN_STRUCTURE_VIEWER_setSelectedFeature( ) {
    PROTEIN_STRUCTURE_VIEWER.clear( );
    PROTEIN_STRUCTURE_VIEWER.addModel( STATE.vDict.features[ STATE.selectedFeature ].allocatedProtein.pdb, "pdb" );
    PROTEIN_STRUCTURE_VIEWER.setStyle(
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
    PROTEIN_STRUCTURE_VIEWER.addStyle(
        {
            resi: STATE.proteoformVariantsEchartOption.series[ 1 ].data
            .filter( v => { return v[ 1 ] > 1 && v[ 0 ].split( "+" )[ 1 ] === "0" } )
            .map( v => { return v[ 0 ].split( "+" )[ 0 ] } ),
            // chain: STATE.selectedChain
        },
        {
            cartoon: {
                colorfunc: (atom) => {
                    let noVariants = STATE.proteoformVariantsEchartOption.series[ 1 ].data.filter( v => {return v[ 0 ] === atom.resi + "+0"} )[ 0 ][ 1 ];
                    let clr;
                    if ( noVariants == 2 ) {
                        clr = '#9c73af';
                    } else if ( noVariants > 2 && noVariants <= 4 ) {
                        clr = '#e56b9d';
                    } else if ( noVariants > 4 && noVariants <= 8 ) {
                        clr = '#ff7764';
                    } else if ( noVariants > 8 ) {
                        clr = '#ffa600';
                    }
                    return clr;
                }
            }
        }
    );
    PROTEIN_STRUCTURE_VIEWER.zoomTo();
    PROTEIN_STRUCTURE_VIEWER.render();
};
function PROTEIN_STRUCTURE_VIEWER_highlightResidue( position, reset ) {
    if ( reset ) {
        for (let resi of STATE.highlightedResidues) {
            PROTEIN_STRUCTURE_VIEWER.setStyle(
                {
                    resi: resi
                },
                {
                    cartoon: {
                        color: '#FFFFFF',
                        thickness: 0.2,
                        arrows: true
                    },
                    cartoon: {
                        colorfunc: (atom) => {
                            let noVariants = STATE.proteoformVariantsEchartOption.series[ 1 ].data.filter( v => {return v[ 0 ] === atom.resi + "+0"} )[ 0 ][ 1 ];
                            let clr;
                            if ( noVariants == 2 ) {
                                clr = '#9c73af';
                            } else if ( noVariants > 2 && noVariants <= 4 ) {
                                clr = '#e56b9d';
                            } else if ( noVariants > 4 && noVariants <= 8 ) {
                                clr = '#ff7764';
                            } else if ( noVariants > 8 ) {
                                clr = '#ffa600';
                            }
                            return clr;
                        }
                    }
                }
            );
        }
        STATE.highlightedResidues = [ ];
    }
    PROTEIN_STRUCTURE_VIEWER.addStyle(
        {
            resi: position
        },
        {
            stick: {
                colorfunc: (atom) => {
                    let noVariants = STATE.proteoformVariantsEchartOption.series[ 1 ].data.filter( v => {return v[ 0 ] === atom.resi + "+0"} )[ 0 ][ 1 ];
                    let clr;
                    if ( noVariants == 1 ) {
                        clr = '#FFFFFF';
                    } else if ( noVariants == 2 ) {
                        clr = '#9c73af';
                    } else if ( noVariants > 2 && noVariants <= 4 ) {
                        clr = '#e56b9d';
                    } else if ( noVariants > 4 && noVariants <= 8 ) {
                        clr = '#ff7764';
                    } else if ( noVariants > 8 ) {
                        clr = '#ffa600';
                    }
                    return clr;
                },
                radius: 1
            }
        }
    );
    STATE.highlightedResidues.push( position );
    PROTEIN_STRUCTURE_VIEWER.render();
};

var PROTEOFORM_VARIANTS_ECHART;
/**
 * METHODS TO MANIPULATE AND INTERACT WITH `PROTEOFORM_VARIANTS_ECHART`
 */
function PROTEOFORM_VARIANTS_ECHART_setChain( chain ) {
    // Reset currently stored information.
    STATE.perPositionVariantInformation = { };
    STATE.perProteoformMetaInformation = { };
    STATE.noSamples = 0;
    STATE.noProteoforms = 0;
    STATE.proteoformVariantsEchartOption.xAxis[ 0 ].data = [ ];
    STATE.proteoformVariantsEchartOption.xAxis[ 1 ].data = [ ];
    STATE.proteoformVariantsEchartOption.yAxis[ 0 ].data = [ ];
    STATE.proteoformVariantsEchartOption.yAxis[ 2 ].data = [ ];
    STATE.proteoformVariantsEchartOption.series[ 0 ].data = [ ];
    STATE.proteoformVariantsEchartOption.series[ 1 ].data = [ ];
    STATE.proteoformVariantsEchartOption.series[ 2 ].data = [ ];
    // Initialize temp. variables.
    var position = 1;
    var chainSequence = STATE.vDict.features[ STATE.selectedFeature ].allocatedProtein.chainSequences[ chain ];
    var hasTerminated = false;
    // Definition of helper-functions.
    let addPositionVariantInformation = ( content, position, proteoform, insertionIndex ) => {
        let p = position + "+" + insertionIndex;
        if ( p in STATE.perPositionVariantInformation ) {
            if ( !(proteoform in STATE.perPositionVariantInformation[ p ]) ) {
                STATE.perPositionVariantInformation[ p ][proteoform] = content;
            }
        } else {
            STATE.perPositionVariantInformation[ p ] = { };
            addPositionVariantInformation( content, position, proteoform, insertionIndex );
        }
    };
    let sortProteoformsByNoSamples = ( pfAName, pfBName ) => {
        let vpa = parseInt( STATE.vDict.features[ STATE.selectedFeature ].allocatedProtein.proteoforms[ pfAName ].samples.length );
        let vpb = parseInt( STATE.vDict.features[ STATE.selectedFeature ].allocatedProtein.proteoforms[ pfBName ].samples.length );
        if ( vpa > vpb ) {
            return 1;
        } else if ( vpa == vpb ) {
            return 0;
        } else { // vpa < vpb
            return -1; 
        }
    };  
    let sortPositions = ( a, b ) => {
        let va = parseInt( a.split( '+' )[ 0 ] );
        let vb = parseInt( b.split( '+' )[ 0 ] );
        if ( va == vb ) {
            let va = parseInt( a.split( '+' )[ 1 ] );
            let vb = parseInt( b.split( '+' )[ 1 ] );
            if ( va > vb ) {
                return 1;
            } else if ( va < vb) {
                return -1;
            } else {
                return 0;
            }
        } else {
            if ( va > vb ) {
                return 1;
            } else {
                return -1;
            }
        }
    };
    // Filter proteoforms to display; TODO: Adjust by parameter/user defined filtering function
    var filteredProteoformKeys = Object.keys( STATE.vDict.features[ STATE.selectedFeature ].allocatedProtein.proteoforms ).sort( sortProteoformsByNoSamples ).filter( 
        proteoformKey => {
            return proteoformKey !== "WildType";
            //return proteoformKey !== "WildType" && STATE.vDict.features[ STATE.selectedFeature ].allocatedProtein.proteoforms[ proteoformKey ].annotations.PT == 'false';
        }
    ); 
    STATE.noProteoforms = filteredProteoformKeys.length + 1;
    // Add information about wild type proteoform.
    for ( let content of chainSequence.split( '' ) ) {
        if ( content == content.toUpperCase( ) ) {
            // Content is of gene and protein.
            addPositionVariantInformation( content, position, "Wild Type Gene", 0 );
            addPositionVariantInformation( content, position, "Wild Type Protein", 0 );
        } else {
            // Content is only of gene.
            addPositionVariantInformation( content.toUpperCase( ), position, "Wild Type Gene", 0 );
        }
        position++;
    }
    // Add information about filtered non wild type proteoforms.
    for ( let proteoformKey of filteredProteoformKeys ) {
        hasTerminated = false;
        var proteoformVariants = STATE.vDict.features[ STATE.selectedFeature ].allocatedProtein.proteoforms[ proteoformKey ].annotations.vSwab.split( '|' );
        for ( let proteoformVariant of proteoformVariants ) {
            if ( hasTerminated ) {
                break;
            }
            var proteoformVariantContent = proteoformVariant.split( '@' )[ 0 ];
            var proteoformVariantPosition = parseInt( proteoformVariant.split( '@' )[ 1 ].split( '+' )[ 0 ] );
            var proteoformVariantInsertedPosition = parseInt( proteoformVariant.split( '@' )[ 1 ].split( '+' )[ 1 ] );
            addPositionVariantInformation( proteoformVariantContent, proteoformVariantPosition, proteoformKey, proteoformVariantInsertedPosition );
            if ( proteoformVariantContent === '*' ) {
                hasTerminated = SETTINGS._excludePastFirstTerminationVariants;
            }
        }
    }
    // Re-add labels for wild type proteoform.
    filteredProteoformKeys.push( "Wild Type Gene" );
    filteredProteoformKeys.push( "Wild Type Protein" );
    // Set y-axis label data.
    STATE.proteoformVariantsEchartOption.yAxis[ 0 ].data = filteredProteoformKeys;
    STATE.proteoformVariantsEchartOption.yAxis[ 0 ].name = "Proteoforms (m = " + STATE.noProteoforms + ")";
    STATE.proteoformVariantsEchartOption.yAxis[ 2 ].data = filteredProteoformKeys;
    // Sort positions in ascending order and add information to EChart series and x-axis.
    let i = 0;
    for ( let position of Object.keys( STATE.perPositionVariantInformation ).sort( sortPositions ) ) {
        STATE.proteoformVariantsEchartOption.xAxis[ 0 ].data.push( position );
        STATE.proteoformVariantsEchartOption.xAxis[ 1 ].data.push( position );
        for ( let [ proteoform, variant ] of Object.entries( STATE.perPositionVariantInformation[ position ] ) ) {
            STATE.proteoformVariantsEchartOption.series[ 0 ].data.push( [ i, filteredProteoformKeys.indexOf( proteoform ), AMINO_ACID_ENCODING[ variant ] ] );
        }
        STATE.proteoformVariantsEchartOption.series[ 1 ].data.push( [ position, Object.keys( PROTEOFORM_VARIANTS_ECHART_getPositionComposition( position ) ).length ] );
        i++;
    }
    // Compute sample proportion per proteoform.
    let nS;
    let totalCounts = [ ];
    for ( let proteoformKey of filteredProteoformKeys ) {
        if ( proteoformKey === "Wild Type Gene" ) {
            nS = STATE.vDict.features[ STATE.selectedFeature ].allocatedProtein.proteoforms[ 'WildType' ].samples.length;
        } else if ( proteoformKey === "Wild Type Protein" ) {
            nS = 0;
        } else {
            nS = STATE.vDict.features[ STATE.selectedFeature ].allocatedProtein.proteoforms[ proteoformKey ].samples.length;
        }
        totalCounts.push( nS );
        STATE.noSamples += nS;
    }
    STATE.proteoformVariantsEchartOption.series[ 2 ].data = totalCounts.map( v => ( v / STATE.noSamples ).toFixed( 4 ) );
    
    // ...
    let perSampleVP = 0;
    let samplePT = 0;
    for ( let proteoformKey of filteredProteoformKeys ) {
        if ( proteoformKey == "Wild Type Protein" ) {
            continue;
        } else {
            if ( proteoformKey == "Wild Type Gene" ) {
                proteoformKey = "WildType";
            }
            perSampleVP += STATE.vDict.features[ STATE.selectedFeature ].allocatedProtein.proteoforms[ proteoformKey ].samples.length * STATE.vDict.features[ STATE.selectedFeature ].allocatedProtein.proteoforms[ proteoformKey ].annotations.VP;
            if ( STATE.vDict.features[ STATE.selectedFeature ].allocatedProtein.proteoforms[ proteoformKey ].annotations.PT == "true" ) {
                samplePT += STATE.vDict.features[ STATE.selectedFeature ].allocatedProtein.proteoforms[ proteoformKey ].samples.length
            }
        }
    }
    console.log( STATE.selectedFeature );
    console.log( "Sample mean VP: " + perSampleVP / STATE.noSamples );
    console.log( "Sample % PT: " + ( samplePT / STATE.noSamples ) * 100 );


    PROTEOFORM_VARIANTS_ECHART.setOption(STATE.proteoformVariantsEchartOption);
    PROTEOFORM_VARIANTS_ECHART.resize( );
};

function PROTEOFORM_VARIANTS_ECHART_getPositionComposition( p ) {
    let states = { };
    let content;
    let observationsNo = 0;
    for ( let proteoformKey of STATE.proteoformVariantsEchartOption.yAxis[ 0 ].data ) {
        if ( proteoformKey === "Wild Type Protein" ) {
            continue;
        } else {
            content = proteoformKey in STATE.perPositionVariantInformation[ p ] ? STATE.perPositionVariantInformation[ p ][ proteoformKey ] : STATE.perPositionVariantInformation[ p ][ 'Wild Type Gene' ];
            if ( proteoformKey === "Wild Type Gene" ) {
                proteoformKey = "WildType";
            }
            if ( content in states ) {
                states[ content ] += STATE.vDict.features[ STATE.selectedFeature ].allocatedProtein.proteoforms[ proteoformKey ].samples.length;
            } else {
                states[ content ] = STATE.vDict.features[ STATE.selectedFeature ].allocatedProtein.proteoforms[ proteoformKey ].samples.length;
            }
        }
        observationsNo += STATE.vDict.features[ STATE.selectedFeature ].allocatedProtein.proteoforms[ proteoformKey ].samples.length;
        STATE.proteoformVariantsEchartOption.yAxis[ 2 ].name = "Sample Proportion (n = " + observationsNo + ")";
    }
    delete states.undefined;
    // Compute variability as number of different variants.
    return states;
    /* Compute variability as entropy for position.
    let entropy = 0;
    for ( let [ content, count ] of Object.entries( states ) ) {
        if ( Object.keys( states ).length === 1 ) {
            entropy += 0;
        } else {
            entropy += (count / observationsNo) * (Math.log(count / observationsNo) / Math.log( 23 ) );
        }
    }
    return -entropy; */
};

var POSITION_INFORMATION_ECHART;
/**
 * METHODS TO MANIPULATE AND INTERACT WITH `POSITION_INFORMATION_ECHART`
 */

/**
 * Methods that are executed once the application has loaded.
 */
window.onload = _ => {
    // Initialize the `FEATURE_SELECTION_ECHART` component.
    FEATURE_SELECTION_ECHART = echarts.init(document.getElementById("main-visualize_overview_feature_selection_echart_container"), { "renderer": "canvas" });
    FEATURE_SELECTION_ECHART.setOption(STATE.featureOverviewEchartOption);
    FEATURE_SELECTION_ECHART.on('click', function (params) {
        let selectedFeatureName = params.data.name;
        if ( params.data.children === undefined ) {
            let items =  [
                {type: 'custom', markup: '<div style="text-align: center;"><b style="padding: 8px;">' + selectedFeatureName + '</b></div>'},
                {type: 'seperator'}
            ];
            if ( STATE.vDict.features[ selectedFeatureName ].allocatedProtein !== { } ) {
                items.push( {type: 'button', label: 'Explore Proteoforms', onClick: () => {
                    toggleMainSubcomponent('visualize_proteoforms');
                    PROTEOFORM_VARIANTS_ECHART_setChain( 'A' );
                    PROTEIN_STRUCTURE_VIEWER_setSelectedFeature( );
                }} );
            }
            new Contextual({
                items: items,
                width: '182px'
            });
        } else {
            selectedFeatureName = null;
        }
        STATE.selectedFeature = selectedFeatureName;
        document.getElementById( "main-visualize_proteoforms_selected_feature_name" ).innerHTML = selectedFeatureName;
    });
    // Initialize the `PROTEIN_STRUCTURE_VIEW` component.
    PROTEIN_STRUCTURE_VIEWER = $3Dmol.createViewer(
        $('#main-visualize_proteoforms_structure_viewer_3dmol_container'),
        { backgroundColor: '#FAFAFC', id: 'PROTEIN_STRUCTURE_VIEW_CANVAS', antialias: true, cartoonQuality: 6 }
    );
    // Initialize the `PROTEOFORM_VARIANTS_ECHART` component.
    PROTEOFORM_VARIANTS_ECHART = echarts.init(document.getElementById("main-visualize_proteoforms_variants_viewer_echart_container"), { "renderer": "canvas", "width": 'auto', "height": 'auto' });
    PROTEOFORM_VARIANTS_ECHART.setOption(STATE.proteoformVariantsEchartOption);
};

/**
 * Sets the value of an existing option in the `SETTINGS` variable.
 * 
 * @param {Text} key    The `key`, i.e. name, of an option to change. 
 * @param {Text} value  The value the accessed option should be set to.
 */
function setSetting(key, value) {
    if (key in SETTINGS) {
        SETTINGS.key = value;
        if (SETTINGS._verbose) {
            console.info("Successfully changed value of SETTINGS stored at key " + key + " to " + value);
        }
    } else {
        if (SETTINGS._verbose) {
            console.warn("Failed to change value of SETTINGS stored at key " + key + "; " + key + " is no valid SETTINGS name.");
        }
        return null;
    }
}

/**
 * Returns the value of an existing option in the `SETTINGS` variable.
 * 
 * @param {Text} key    The `key`, i.e. name, of an option (which value is returned).
 */
function getSetting(key) {
    if (key in SETTINGS) {
        return SETTINGS.key;
    } else {
        if (SETTINGS._verbose) {
            console.warn("Accessed value stored at key " + key + " but " + key + " is no valid SETTINGS name.");
        }
        return null;
    }
}

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
 * Shows the specified main subcomponent, i.e. others are closed.
 * 
 * @param {Text} componentId
 */
function toggleMainSubcomponent(componentId) {
    for (let key of ["about", "visualize_overview", "visualize_proteoforms", "settings", "legal_notice"]) {
        if (componentId === key) {
            showElement("main-" + key, "block");
        } else {
            closeElement("main-" + key);
        }
    }
}

/**
 * Handles the user selection of a variant dictionary .json file.
 * 
 * @param {event} event: File selection event. The `target` of the event has to be a file input element with a `files` attribute yielding a `FileList` instance. 
 */
function fileInputChange(event) {
    if (event.isTrusted && event.type === 'change') {
        let file = event.target.files[0];
        initializeState(file);
    }
}

/**
 * Initializes the `STATE` variable based on the content of a MUSIAL v2.0 variant dictionary.
 * 
 * @param {File} file: A `File` instance that specifies the output variant dictionary of a MUSIAL run.
 */
function initializeState(file) {
    var fileReader = new FileReader();
    var fileContent;
    fileReader.onload = function (event) {
        fileContent = event.target.result;
        STATE.vDict = JSON.parse(fileContent);
    };
    if (file !== undefined) {
        fileReader.readAsText(file);
        // Add features parsed from a `.vDict.json` file to the `STATE`.
        window.setTimeout(
            _ => {
                let chr = STATE.vDict.chromosome;
                let fileName = file.name.split('.')[0];
                for (const [ftrName, ftrObj] of Object.entries(STATE.vDict.features)) {
                    if ('class' in ftrObj.annotations && ftrObj.annotations.class !== null) {
                        FEATURE_OVERVIEW_ECHART_addFeature(chr, ftrObj.annotations.class, ftrName);
                    } else {
                        FEATURE_OVERVIEW_ECHART_addFeature(chr, fileName, ftrName);
                    }
                }
            },
            500
        );
    }
}

/* UTILITY METHODS */

/**
 * 
 * @param {*} object 
 * @param {*} sortBy 
 * @returns 
 */
function sortObject(object, sortBy) {
    let sortedObject = { };
    for ( let key of Object.keys( object ).sort( sortBy ) ) {
        sortedObject[ key ] = object[ key ];
    };
    console.log( sortedObject );
    return sortedObject;
}